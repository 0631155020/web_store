from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.declarative import declarative_base
from src.tg_bot import send_telegram_notification
from src.database import init_db, engine
from src.routers import main_router
from contextlib import asynccontextmanager
from src.path import FRONTEND_DIR
from src import models
from fastapi.middleware.cors import CORSMiddleware
import os

# models.Base.metadata.create_all(engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

# Allow CORS for React development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(main_router)
