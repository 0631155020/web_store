import json
from typing import List, Optional
import uuid
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse

from src.dependencies.db import get_db
from src.path import UPLOADS_DIR
from src.models import Order, OrderItem, PhotoDB
from src.schemas import OrderSchema, Photo
from src.security import get_current_username
from src.tg_bot import send_telegram_notification
from src.core import save_file
from src.path import BASE_DIR

router = APIRouter()

@router.post("/photos", response_model=Photo)
async def upload_photo(
    name: Optional[str] = Form(None),
    item_description: Optional[str] = Form(None),
    price: float = Form(0.0),
    sizes: Optional[str] = Form(None),
    item: UploadFile = File(...),
    size_table_photo: Optional[UploadFile] = File(None),
    username: str = Depends(get_current_username),
    db=Depends(get_db)
):
    
    # --- Process main product photo ---
    unique_filename = await save_file(item)
    photo_path = f"/uploads/{unique_filename}"

    # --- Process size table photo (if provided) ---
    size_table_photo_path_val = None
    if size_table_photo:
        st_filename = await save_file(size_table_photo)
        size_table_photo_path_val = f"/uploads/{st_filename}"

    sizes_list = json.loads(sizes) if sizes else []

    new_photo = PhotoDB(
        id=str(uuid.uuid4()),
        filename=item.filename,
        name=name,
        item_description=item_description,
        path=photo_path,
        price=price,
        sizes = sizes_list,
        size_table_photo_path=size_table_photo_path_val
    )
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)
    return new_photo


@router.get("/photos", response_model=List[Photo])
def get_all_photos(db=Depends(get_db)):
    return db.query(PhotoDB).all()

@router.get("/photos/{photo_id}", response_model=Photo)
def get_photo_by_id(photo_id: str, db=Depends(get_db)):
    photo = db.query(PhotoDB).filter(PhotoDB.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo

@router.delete("/photos/{photo_id}", status_code=200)
def delete_photo(photo_id: str, username: str = Depends(get_current_username), db=Depends(get_db)):
    photo_to_delete = db.query(PhotoDB).filter(PhotoDB.id == photo_id).first()
    if not photo_to_delete:
        raise HTTPException(status_code=404, detail="Photo not found")

    file_path = BASE_DIR / photo_to_delete.path.strip("/")
    if file_path.exists():
        file_path.unlink()

    db.delete(photo_to_delete)
    db.commit()
    return JSONResponse(content={"message": "Photo deleted successfully"})

@router.post("/orders", status_code=201)
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
                "name": photo.name,
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

@router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    file_path = UPLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)