from sqlalchemy import Column, String, Float, Integer, JSON, MetaData
from src.database import Base

metadata = MetaData()

from sqlalchemy.orm import relationship

# --- SQLAlchemy Models ---
class PhotoDB(Base):
    __tablename__ = "photos"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
    item_description = Column(String, nullable=True)
    price = Column(Float, default=0.0)
    sizes = Column(JSON, nullable=True)
    size_table_photo_path = Column(String, nullable=True)

    # Path and filename are kept here temporarily for backwards compatibility in API responses,
    # but the primary data source is now product_images
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order")

    @property
    def path(self):
        primary = next((img for img in self.images if img.is_primary), None)
        if primary:
            return primary.image_url
        if self.images:
            return self.images[0].image_url
        return ""

    @property
    def filename(self):
        primary = next((img for img in self.images if img.is_primary), None)
        if primary:
            return primary.image_url.split("/")[-1]
        if self.images:
            return self.images[0].image_url.split("/")[-1]
        return ""

from sqlalchemy import ForeignKey, Boolean
class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(String, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("photos.id", ondelete="CASCADE"), index=True)
    image_url = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)

    product = relationship("PhotoDB", back_populates="images")

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