from pydantic import BaseModel
from typing import Optional, List

# --- Pydantic Models ---
class Photo(BaseModel):
    id: str
    filename: str
    name: Optional[str] = None
    item_description: Optional[str] = None
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
    email: Optional[str] = None
    firstName: str
    lastName: str
    phone: str
    deliveryMethod: str
    paymentMethod: str
    messenger: Optional[str] = None
    novaPoshta: Optional[NovaPoshtaSchema] = None
    items: List[OrderItemSchema]
