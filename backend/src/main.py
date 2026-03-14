from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.declarative import declarative_base
from src.tg_bot import send_telegram_notification
from src.database import init_db, engine
from src.routers import main_router
from contextlib import asynccontextmanager
from src.path import FRONTEND_DIR
from src import models


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

app.include_router(main_router)