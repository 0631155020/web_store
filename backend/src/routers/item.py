import json
from typing import List, Optional
import uuid
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse

from src.dependencies.db import get_db
from src.path import UPLOADS_DIR
from src.models import Order, OrderItem, PhotoDB, ProductImage
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
    item: Optional[UploadFile] = File(None),  # Keep for backwards compatibility
    images: List[UploadFile] = File(None),
    primary_image_index: int = Form(0),
    size_table_photo: Optional[UploadFile] = File(None),
    username: str = Depends(get_current_username),
    db=Depends(get_db)
):
    # Process size table photo (if provided)
    size_table_photo_path_val = None
    if size_table_photo:
        st_filename = await save_file(size_table_photo)
        size_table_photo_path_val = f"/uploads/{st_filename}"

    sizes_list = json.loads(sizes) if sizes else []

    product_id = str(uuid.uuid4())
    new_photo = PhotoDB(
        id=product_id,
        name=name,
        item_description=item_description,
        price=price,
        sizes=sizes_list,
        size_table_photo_path=size_table_photo_path_val
    )
    db.add(new_photo)
    db.flush()

    # Collect images to process
    files_to_process = []
    if images:
        files_to_process = images
    elif item:
        files_to_process = [item]

    for idx, file in enumerate(files_to_process):
        unique_filename = await save_file(file)
        photo_path = f"/uploads/{unique_filename}"

        is_primary = (idx == primary_image_index)
        new_image = ProductImage(
            id=str(uuid.uuid4()),
            product_id=product_id,
            image_url=photo_path,
            is_primary=is_primary,
            sort_order=idx
        )
        db.add(new_image)

    db.commit()
    db.refresh(new_photo)
    return new_photo

@router.put("/photos/{photo_id}", response_model=Photo)
async def update_photo(
    photo_id: str,
    name: Optional[str] = Form(None),
    item_description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    sizes: Optional[str] = Form(None),
    size_table_photo: Optional[UploadFile] = File(None),
    username: str = Depends(get_current_username),
    db=Depends(get_db)
):
    photo = db.query(PhotoDB).filter(PhotoDB.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    if name is not None:
        photo.name = name
    if item_description is not None:
        photo.item_description = item_description
    if price is not None:
        photo.price = price
    if sizes is not None:
        photo.sizes = json.loads(sizes)

    if size_table_photo:
        st_filename = await save_file(size_table_photo)
        photo.size_table_photo_path = f"/uploads/{st_filename}"

    db.commit()
    db.refresh(photo)
    return photo

@router.put("/photos/{photo_id}/images/reorder", response_model=Photo)
async def reorder_images(
    photo_id: str,
    image_ids: str = Form(...), # JSON string list of IDs in order
    username: str = Depends(get_current_username),
    db=Depends(get_db)
):
    photo = db.query(PhotoDB).filter(PhotoDB.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    ids = json.loads(image_ids)

    for idx, img_id in enumerate(ids):
        db.query(ProductImage).filter(ProductImage.id == img_id, ProductImage.product_id == photo_id).update({ProductImage.sort_order: idx})

    db.commit()
    db.refresh(photo)
    return photo

@router.post("/photos/{photo_id}/images", response_model=Photo)
async def add_images_to_photo(
    photo_id: str,
    images: List[UploadFile] = File(...),
    username: str = Depends(get_current_username),
    db=Depends(get_db)
):
    photo = db.query(PhotoDB).filter(PhotoDB.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Find current max sort_order
    current_images = db.query(ProductImage).filter(ProductImage.product_id == photo_id).all()
    max_sort_order = max([img.sort_order for img in current_images]) if current_images else -1

    for idx, file in enumerate(images):
        unique_filename = await save_file(file)
        photo_path = f"/uploads/{unique_filename}"

        new_image = ProductImage(
            id=str(uuid.uuid4()),
            product_id=photo_id,
            image_url=photo_path,
            is_primary=False, # New images are not primary by default
            sort_order=max_sort_order + 1 + idx
        )
        db.add(new_image)

    db.commit()
    db.refresh(photo)
    return photo

@router.delete("/photos/{photo_id}/images/{image_id}", status_code=200)
def delete_product_image(
    photo_id: str,
    image_id: str,
    username: str = Depends(get_current_username),
    db=Depends(get_db)
):
    image_to_delete = db.query(ProductImage).filter(ProductImage.id == image_id, ProductImage.product_id == photo_id).first()
    if not image_to_delete:
        raise HTTPException(status_code=404, detail="Image not found")

    was_primary = image_to_delete.is_primary

    file_path = BASE_DIR / image_to_delete.image_url.strip("/")
    if file_path.exists():
        file_path.unlink()

    db.delete(image_to_delete)

    # If we deleted the primary image, make the first available one primary
    if was_primary:
        first_image = db.query(ProductImage).filter(ProductImage.product_id == photo_id).order_by(ProductImage.sort_order).first()
        if first_image:
            first_image.is_primary = True

    db.commit()
    return JSONResponse(content={"message": "Image deleted successfully"})

@router.put("/photos/{photo_id}/images/{image_id}/primary", response_model=Photo)
def set_primary_image(
    photo_id: str,
    image_id: str,
    username: str = Depends(get_current_username),
    db=Depends(get_db)
):
    photo = db.query(PhotoDB).filter(PhotoDB.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    image = db.query(ProductImage).filter(ProductImage.id == image_id, ProductImage.product_id == photo_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    # Unset all other primary images
    db.query(ProductImage).filter(ProductImage.product_id == photo_id).update({ProductImage.is_primary: False})

    # Set this one as primary
    image.is_primary = True

    db.commit()
    db.refresh(photo)
    return photo


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

    # Delete all associated images
    images = db.query(ProductImage).filter(ProductImage.product_id == photo_id).all()
    for image in images:
        file_path = BASE_DIR / image.image_url.strip("/")
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
            name=item.name,
            quantity=item.quantity,
            size=item.size
        )
        db.add(new_item)

    db.commit()

    detailed_items = []
    for item in order.items:
        # photo = db.query(PhotoDB).filter(PhotoDB.id == item.name).first()
        # if photo:
        detailed_items.append({
            "name": item.name,
            "quantity": item.quantity,
            "size": item.size
        })

    order_details = {
        "id": new_order.id,
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