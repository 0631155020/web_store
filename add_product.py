import uuid
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import PhotoDB # Import the model from your main app

# --- Database Configuration ---
DATABASE_URL = "postgresql://user:password@localhost:5432/mydatabase"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_product():
    db = SessionLocal()
    try:
        # Create a new product
        new_photo = PhotoDB(
            id=str(uuid.uuid4()),
            filename="test_image.jpg",
            description="Test Product",
            path="/uploads/test_image.jpg",
            price=10.00,
            sizes=["S", "M", "L"]
        )
        db.add(new_photo)
        db.commit()
        print("Product added successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    add_product()
