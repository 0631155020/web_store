import os
from sqlalchemy.exc import OperationalError
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


# --- Database Configuration ---
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    raise ValueError("DATABASE_URL is not set in environment variables")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- Database Initialization with Retry ---
def init_db():
    retries = 5
    delay = 5  # seconds
    for i in range(retries):
        try:
            # Check connection
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            print("Database connection successful.")
            return
        except OperationalError as e:
            print(f"Database connection failed: {e}. Retrying in {delay} seconds...")
            time.sleep(delay)
        except Exception as e:
            print(f"An unexpected error occurred: {e}. Retrying in {delay} seconds...")
            time.sleep(delay)
    print("Could not connect to the database after several retries. Exiting.")
    raise Exception("Could not connect to the database.")