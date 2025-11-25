
import secrets
import uuid
from pathlib import Path
from typing import List, Optional
import os
import smtplib
import time
import json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import httpx
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
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

# --- Email Sending ---
def send_order_email(order_details: dict):
    # --- Email Configuration ---
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.example.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "user@example.com")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "password")
    RECIPIENT_EMAIL = "udodpilot@gmail.com"

    # --- Email Content ---
    sender_email = SMTP_USERNAME
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"New Order Received: {order_details['id']}"
    msg["From"] = sender_email
    msg["To"] = RECIPIENT_EMAIL

    # --- HTML Body ---
    nova_poshta_details_html = ""
    if order_details.get("novaPoshta"):
        nova_poshta_info = order_details["novaPoshta"]
        if nova_poshta_info:
            nova_poshta_details_html = f"""
            <h4>Nova Poshta Details:</h4>
            <p><strong>City:</strong> {nova_poshta_info.get('city', 'N/A')}</p>
            <p><strong>Warehouse:</strong> {nova_poshta_info.get('warehouse', 'N/A')}</p>
            """

    address_html = ""
    if order_details.get("address"):
        address_html = f"<p><strong>Address:</strong> {order_details['address']}</p>"

    items_html = ""
    if order_details.get("items"):
        items_html += "<h4>Ordered Items:</h4><ul>"
        for item in order_details["items"]:
            description = item.get('description', 'N/A')
            quantity = item.get('quantity', 'N/A')
            size = item.get('size', '')
            size_html = f" (Size: {size})" if size else ""
            items_html += f"<li>{description}{size_html} (Quantity: {quantity})</li>"
        items_html += "</ul>"

    html = f"""
    <html>
    <body>
        <h2>New Order Details</h2>
        <p><strong>Order ID:</strong> {order_details['id']}</p>
        <p><strong>Email:</strong> {order_details['email']}</p>
        <p><strong>Name:</strong> {order_details['firstName']} {order_details['lastName']}</p>
        {address_html}
        <p><strong>Phone:</strong> {order_details['phone']}</p>
        <p><strong>Messenger:</strong> {order_details.get('messenger', 'N/A')}</p>
        <p><strong>Delivery Method:</strong> {order_details['deliveryMethod']}</p>
        <p><strong>Payment Method:</strong> {order_details['paymentMethod']}</p>
        {nova_poshta_details_html}
        {items_html}
    </body>
    </html>
    """
    msg.attach(MIMEText(html, "html"))

    # --- Send Email ---
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(sender_email, RECIPIENT_EMAIL, msg.as_string())
        print("Order email sent successfully.")
    except Exception as e:
        print(f"Failed to send order email: {e}")

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
def init_db():
    retries = 5
    delay = 5  # seconds
    for i in range(retries):
        try:
            # Check connection and create table
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            print("Database connection successful and table created.")
            return
        except OperationalError as e:
            print(f"Database connection failed: {e}. Retrying in {delay} seconds...")
            time.sleep(delay)
        except Exception as e:
            print(f"An unexpected error occurred: {e}. Retrying in {delay} seconds...")
            time.sleep(delay)
    print("Could not connect to the database after several retries. Exiting.")
    raise Exception("Could not connect to the database.")


@app.on_event("startup")
def on_startup():
    init_db()

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
    username: str = Depends(get_current_username),
    db=Depends(get_db)
):
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOADS_DIR / unique_filename

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    sizes_list = json.loads(sizes) if sizes else []

    new_photo = PhotoDB(
        id=str(uuid.uuid4()),
        filename=file.filename,
        description=description,
        path=f"/uploads/{unique_filename}",
        price=price,
        sizes=sizes_list
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
async def create_order(order: OrderSchema, db=Depends(get_db)):
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
    send_order_email(order_details)

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

@app.get("/product-detail", response_class=HTMLResponse)
async def read_product_detail():
    return FileResponse(FRONTEND_DIR / "product-detail.html")

@app.get("/product-detail.html", response_class=HTMLResponse)
async def read_product_detail_alias():
    return FileResponse(FRONTEND_DIR / "product-detail.html")
