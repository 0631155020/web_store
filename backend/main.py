import json
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# --- Настройка CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все источники (для простоты)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Пути к файлам и директориям ---
# Определяем пути относительно расположения скрипта main.py внутри контейнера (/app)
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR / "data"
UPLOADS_DIR = SCRIPT_DIR / "uploads"
FRONTEND_DIR = SCRIPT_DIR / "frontend"
PHOTOS_JSON_PATH = DATA_DIR / "photos.json"

# --- Создание директорий, если их нет ---
DATA_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)

# --- Инициализация JSON-файла, если он не существует ---
if not PHOTOS_JSON_PATH.exists():
    with open(PHOTOS_JSON_PATH, "w") as f:
        json.dump([], f)

# --- Монтирование статических файлов ---
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


# --- Модели Pydantic ---
class Photo(BaseModel):
    id: str
    filename: str
    description: Optional[str] = None
    path: str
    price: Optional[float] = 0.0

# --- Функции для работы с данными ---
def read_photos_db() -> List[dict]:
    with open(PHOTOS_JSON_PATH, "r") as f:
        return json.load(f)

def write_photos_db(data: List[dict]):
    with open(PHOTOS_JSON_PATH, "w") as f:
        json.dump(data, f, indent=4)

# --- Эндпоинты API ---
@app.post("/photos", response_model=Photo)
async def upload_photo(
    description: Optional[str] = None,
    price: float = 0.0,
    file: UploadFile = File(...)
):
    photos = read_photos_db()
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOADS_DIR / unique_filename

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    new_photo = Photo(
        id=str(uuid.uuid4()),
        filename=file.filename,
        description=description,
        path=f"/uploads/{unique_filename}",
        price=price
    )

    photos.append(new_photo.dict())
    write_photos_db(photos)

    return new_photo

@app.get("/photos", response_model=List[Photo])
def get_all_photos():
    return read_photos_db()

@app.get("/photos/{photo_id}", response_model=Photo)
def get_photo_by_id(photo_id: str):
    photos = read_photos_db()
    photo = next((p for p in photos if p["id"] == photo_id), None)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo

@app.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    file_path = UPLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# --- Эндпоинт для отдачи главной страницы ---
@app.get("/", response_class=HTMLResponse)
async def read_root():
    return FileResponse(FRONTEND_DIR / "index.html")
