from sqlalchemy import Column, String, Float, Integer, JSON, MetaData
from src.database import Base

metadata = MetaData()

# --- SQLAlchemy Models ---
class PhotoDB(Base):
    __tablename__ = "photos"
    id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    name = Column(String, nullable=True)
    item_description = Column(String, nullable=True)
    path = Column(String)
    price = Column(Float, default=0.0)
    sizes = Column(JSON, nullable=True)
    size_table_photo_path = Column(String, nullable=True)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, index=True)
    # email = Column(String, nullable = True)
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
    name = Column(String)
    quantity = Column(Integer)
    size = Column(String, nullable=True)