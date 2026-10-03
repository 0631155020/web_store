from pydantic import BaseModel
from typing import Optional, List

# --- Pydantic Models ---
class ProductImageSchema(BaseModel):
    id: str
    product_id: str
    image_url: str
    is_primary: bool = False
    sort_order: int = 0

    class Config:
        orm_mode = True

class Photo(BaseModel):
    id: str
    filename: Optional[str] = None
    name: Optional[str] = None
    item_description: Optional[str] = None
    path: Optional[str] = None
    price: Optional[float] = 0.0
    sizes: Optional[List[str]] = None
    size_table_photo_path: Optional[str] = None
    images: List[ProductImageSchema] = []

    class Config:
        orm_mode = True

class OrderItemSchema(BaseModel):
    name: str
    quantity: int
    size: Optional[str] = None

class NovaPoshtaSchema(BaseModel):
    city: str
    warehouse: str

class OrderSchema(BaseModel):
    email: Optional[str] = None
    firstName: str
    lastName: str
    phone: str
    deliveryMethod: str
    paymentMethod: str
    messenger: Optional[str] = None
    novaPoshta: Optional[NovaPoshtaSchema] = None
    items: List[OrderItemSchema]
