from src.database import SessionLocal

# --- Dependency for DB Session ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# when in api they need func get_db then we need to import this func