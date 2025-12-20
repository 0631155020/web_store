
import secrets
import uuid
from pathlib import Path
from typing import List, Optional
import os
import time
import json

import httpx
from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Float, text, Integer, JSON
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- Database Configuration ---
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db/mydatabase")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLAlchemy Models ---
class PhotoDB(Base):
    __tablename__ = "photos"
    id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    description = Column(String, nullable=True)
    path = Column(String)
    price = Column(Float, default=0.0)
    sizes = Column(JSON, nullable=True)
    size_table_photo_path = Column(String, nullable=True)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, index=True)
    email = Column(String)
    firstName = Column(String)
    lastName = Column(String)
    address = Column(String, nullable=True)
    phone = Column(String)
    deliveryMethod = Column(String)
    paymentMethod = Column(String)
    novaPoshta = Column(JSON, nullable=True)
    messenger = Column(String, nullable=True)

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(String, primary_key=True, index=True)
    order_id = Column(String)
    photo_id = Column(String)
    quantity = Column(Integer)
    size = Column(String, nullable=True)

# --- Pydantic Models ---
class Photo(BaseModel):
    id: str
    filename: str
    description: Optional[str] = None
    path: str
    price: Optional[float] = 0.0
    sizes: Optional[List[str]] = None
    size_table_photo_path: Optional[str] = None

    class Config:
        orm_mode = True

class OrderItemSchema(BaseModel):
    photo_id: str
    quantity: int
    size: Optional[str] = None

class NovaPoshtaSchema(BaseModel):
    city: str
    warehouse: str

class OrderSchema(BaseModel):
    email: str
    firstName: str
    lastName: str
    phone: str
    deliveryMethod: str
    paymentMethod: str
    messenger: Optional[str] = None
    novaPoshta: Optional[NovaPoshtaSchema] = None
    items: List[OrderItemSchema]

# --- FastAPI App Initialization ---
app = FastAPI()

# --- Telegram Bot ---
async def send_telegram_notification(order_details: dict):
    TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
    TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram bot token or chat ID is not set. Skipping notification.")
        return

    # --- Message Formatting ---
    nova_poshta_details = ""
    if order_details.get("novaPoshta"):
        nova_poshta_info = order_details["novaPoshta"]
        if nova_poshta_info:
            nova_poshta_details = (
                f"<b>Nova Poshta Details:</b>\n"
                f"City: {nova_poshta_info.get('city', 'N/A')}\n"
                f"Warehouse: {nova_poshta_info.get('warehouse', 'N/A')}\n\n"
            )

    items_details = "<b>Ordered Items:</b>\n"
    if order_details.get("items"):
        for item in order_details["items"]:
            description = item.get('description', 'N/A')
            quantity = item.get('quantity', 'N/A')
            size = item.get('size', '')
            size_str = f" (Size: {size})" if size else ""
            items_details += f"- {description}{size_str} (Quantity: {quantity})\n"

    message = (
        f"<b>New Order Received!</b>\n"
        f"<b>Order ID:</b> {order_details['id']}\n"
        f"<b>Email:</b> {order_details['email']}\n"
        f"<b>Name:</b> {order_details['firstName']} {order_details['lastName']}\n"
        f"<b>Phone:</b> {order_details['phone']}\n"
        f"<b>Messenger:</b> {order_details.get('messenger', 'N/A')}\n"
        f"<b>Delivery Method:</b> {order_details['deliveryMethod']}\n"
        f"<b>Payment Method:</b> {order_details['paymentMethod']}\n\n"
        f"{nova_poshta_details}"
        f"{items_details}"
    )

    # --- Send Message ---
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    params = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=params)
            response.raise_for_status()
            print("Telegram notification sent successfully.")
        except httpx.HTTPStatusError as e:
            print(f"Failed to send Telegram notification: {e.response.text}")
        except Exception as e:
            print(f"An error occurred while sending Telegram notification: {e}")

# --- Nova Poshta API ---
NOVA_POSHTA_API_KEY = os.getenv("NOVA_POSHTA_API_KEY")
NOVA_POSHTA_API_URL = "https://api.novaposhta.ua/v2.0/json/"

@app.get("/api/novaposhta/all-cities")
async def get_all_cities():
    async with httpx.AsyncClient() as client:
        response = await client.post(NOVA_POSHTA_API_URL, json={
            "apiKey": NOVA_POSHTA_API_KEY,
            "modelName": "Address",
            "calledMethod": "getCities",
            "methodProperties": {}
        })
        return response.json()

@app.post("/api/novaposhta/warehouses")
async def find_warehouses(request: dict):
    city_ref = request.get("cityRef")
    if not city_ref:
        raise HTTPException(status_code=400, detail="City ref is required")

    all_warehouses = []
    page = 1
    limit = 500

    async with httpx.AsyncClient() as client:
        while True:
            response = await client.post(NOVA_POSHTA_API_URL, json={
                "apiKey": NOVA_POSHTA_API_KEY,
                "modelName": "Address",
                "calledMethod": "getWarehouses",
                "methodProperties": {
                    "CityRef": city_ref,
                    "Page": str(page),
                    "Limit": str(limit)
                }
            })
            data = response.json()
            if data["success"] and data["data"]:
                all_warehouses.extend(data["data"])
                if len(data["data"]) < limit:
                    break
                page += 1
            else:
                break

    return {"success": True, "data": all_warehouses, "errors": [], "warnings": [], "info": []}

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- File and Directory Paths ---
APP_DIR = Path("/app")
UPLOADS_DIR = APP_DIR / "uploads"
FRONTEND_DIR = APP_DIR / "frontend"
UPLOADS_DIR.mkdir(exist_ok=True)

# --- Static Files ---
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

# --- Security ---
security = HTTPBasic()
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "password"

def get_current_username(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# --- Database Initialization with Retry ---

# --- Dependency for DB Session ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API Endpoints ---
@app.post("/photos", response_model=Photo)
async def upload_photo(
    description: Optional[str] = Form(None),
    price: float = Form(0.0),
    sizes: Optional[str] = Form('[]'),
    file: UploadFile = File(...),
    size_table_photo: Optional[UploadFile] = File(None),
    username: str = Depends(get_current_username),
    db=Depends(get_db)
):
    # --- Process main product photo ---
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOADS_DIR / unique_filename
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # --- Process size table photo (if provided) ---
    size_table_photo_path_val = None
    if size_table_photo and size_table_photo.filename:
        st_file_extension = Path(size_table_photo.filename).suffix
        st_unique_filename = f"{uuid.uuid4()}{st_file_extension}"
        st_file_path = UPLOADS_DIR / st_unique_filename
        with open(st_file_path, "wb") as buffer:
            buffer.write(await size_table_photo.read())
        size_table_photo_path_val = f"/uploads/{st_unique_filename}"

    sizes_list = json.loads(sizes) if sizes else []

    new_photo = PhotoDB(
        id=str(uuid.uuid4()),
        filename=file.filename,
        description=description,
        path=f"/uploads/{unique_filename}",
        price=price,
        sizes=sizes_list,
        size_table_photo_path=size_table_photo_path_val
    )
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)
    return new_photo

@app.get("/photos", response_model=List[Photo])
def get_all_photos(db=Depends(get_db)):
    return db.query(PhotoDB).all()

@app.get("/photos/{photo_id}", response_model=Photo)
def get_photo_by_id(photo_id: str, db=Depends(get_db)):
    photo = db.query(PhotoDB).filter(PhotoDB.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo

@app.delete("/photos/{photo_id}", status_code=200)
def delete_photo(photo_id: str, username: str = Depends(get_current_username), db=Depends(get_db)):
    photo_to_delete = db.query(PhotoDB).filter(PhotoDB.id == photo_id).first()
    if not photo_to_delete:
        raise HTTPException(status_code=404, detail="Photo not found")

    file_path = APP_DIR / photo_to_delete.path.strip("/")
    if file_path.exists():
        file_path.unlink()

    db.delete(photo_to_delete)
    db.commit()
    return JSONResponse(content={"message": "Photo deleted successfully"})

@app.post("/orders", status_code=201)
async def create_order(order: OrderSchema, background_tasks: BackgroundTasks, db=Depends(get_db)):
    order_id = str(uuid.uuid4())

    nova_poshta_data = order.novaPoshta.dict() if order.novaPoshta else None

    new_order = Order(
        id=order_id,
        email=order.email,
        firstName=order.firstName,
        lastName=order.lastName,
        phone=order.phone,
        deliveryMethod=order.deliveryMethod,
        paymentMethod=order.paymentMethod,
        novaPoshta=nova_poshta_data,
        messenger=order.messenger
    )
    db.add(new_order)

    for item in order.items:
        new_item = OrderItem(
            id=str(uuid.uuid4()),
            order_id=order_id,
            photo_id=item.photo_id,
            quantity=item.quantity,
            size=item.size
        )
        db.add(new_item)

    db.commit()

    detailed_items = []
    for item in order.items:
        photo = db.query(PhotoDB).filter(PhotoDB.id == item.photo_id).first()
        if photo:
            detailed_items.append({
                "description": photo.description,
                "quantity": item.quantity,
                "size": item.size
            })

    order_details = {
        "id": new_order.id,
        "email": new_order.email,
        "firstName": new_order.firstName,
        "lastName": new_order.lastName,
        "address": new_order.address,
        "phone": new_order.phone,
        "deliveryMethod": new_order.deliveryMethod,
        "paymentMethod": new_order.paymentMethod,
        "novaPoshta": new_order.novaPoshta,
        "messenger": new_order.messenger,
        "items": detailed_items
    }
    background_tasks.add_task(send_telegram_notification, order_details)

    return {"message": "Order created successfully", "order_id": order_id}

@app.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    file_path = UPLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# --- HTML Endpoints ---
@app.get("/", response_class=HTMLResponse)
async def read_main():
    return FileResponse(FRONTEND_DIR / "main.html")

@app.get("/main.html", response_class=HTMLResponse)
async def read_home_alias():
    return FileResponse(FRONTEND_DIR / "main.html")

@app.get("/home.html", response_class=HTMLResponse)
async def read_home():
    return FileResponse(FRONTEND_DIR / "home.html")

@app.get("/admin", response_class=HTMLResponse)
async def read_admin(username: str = Depends(get_current_username)):
    return FileResponse(FRONTEND_DIR / "admin.html")

@app.get("/admin.html", response_class=HTMLResponse)
async def read_admin_alias(username: str = Depends(get_current_username)):
    return FileResponse(FRONTEND_DIR / "admin.html")

@app.get("/checkout", response_class=HTMLResponse)
async def read_checkout():
    return FileResponse(FRONTEND_DIR / "checkout.html")

@app.get("/checkout.html", response_class=HTMLResponse)
async def read_checkout_alias():
    return FileResponse(FRONTEND_DIR / "checkout.html")

@app.get("/product-detail", response_class=HTMLResponse)
async def read_product_detail():
    return FileResponse(FRONTEND_DIR / "product-detail.html")

@app.get("/product-detail.html", response_class=HTMLResponse)
async def read_product_detail_alias():
    return FileResponse(FRONTEND_DIR / "product-detail.html")

@app.get("/about.html", response_class=HTMLResponse)
async def read_about():
    return FileResponse(FRONTEND_DIR / "about.html")

@app.get("/contact.html", response_class=HTMLResponse)
async def read_about():
    return FileResponse(FRONTEND_DIR / "contact.html")