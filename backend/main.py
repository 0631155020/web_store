import json
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI()

# --- Пути к файлам и директориям ---
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = BASE_DIR / "uploads"
PHOTOS_JSON_PATH = DATA_DIR / "photos.json"

# --- Создание директорий, если их нет ---
DATA_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)

# --- Инициализация JSON-файла, если он не существует ---
if not PHOTOS_JSON_PATH.exists():
    with open(PHOTOS_JSON_PATH, "w") as f:
        json.dump([], f)

# --- Модели Pydantic ---
class Photo(BaseModel):
    id: str
    filename: str
    description: Optional[str] = None
    path: str

# --- Функции для работы с данными ---
def read_photos_db() -> List[dict]:
    with open(PHOTOS_JSON_PATH, "r") as f:
        return json.load(f)

def write_photos_db(data: List[dict]):
    with open(PHOTOS_JSON_PATH, "w") as f:
        json.dump(data, f, indent=4)

# --- Эндпоинты API ---
@app.post("/photos", response_model=Photo)
async def upload_photo(description: Optional[str] = None, file: UploadFile = File(...)):
    """
    Загружает новую фотографию.
    """
    photos = read_photos_db()

    # --- Генерация уникального имени файла ---
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOADS_DIR / unique_filename

    # --- Сохранение файла ---
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # --- Создание новой записи о фото ---
    new_photo = Photo(
        id=str(uuid.uuid4()),
        filename=file.filename,
        description=description,
        path=f"/uploads/{unique_filename}",
    )

    photos.append(new_photo.dict())
    write_photos_db(photos)

    return new_photo

@app.get("/photos", response_model=List[Photo])
def get_all_photos():
    """
    Возвращает список всех фотографий.
    """
    return read_photos_db()

@app.get("/photos/{photo_id}", response_model=Photo)
def get_photo_by_id(photo_id: str):
    """
    Возвращает информацию о конкретной фотографии по её ID.
    """
    photos = read_photos_db()
    photo = next((p for p in photos if p["id"] == photo_id), None)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo

# --- Эндпоинт для отдачи статических файлов (изображений) ---
@app.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """
    Отдаёт загруженный файл изображения.
    """
    file_path = UPLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
