import json
import secrets
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
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
# Определяем пути относительно корня проекта (/app)
APP_DIR = Path("/app")
DATA_DIR = APP_DIR / "data"
UPLOADS_DIR = APP_DIR / "uploads"
FRONTEND_DIR = APP_DIR / "frontend"
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

security = HTTPBasic()

# --- Hardcoded credentials ---
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "password"

def get_current_username(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


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
    file: UploadFile = File(...),
    username: str = Depends(get_current_username)
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

@app.delete("/photos/{photo_id}", status_code=200)
def delete_photo(photo_id: str, username: str = Depends(get_current_username)):
    photos = read_photos_db()
    photo_to_delete = next((p for p in photos if p["id"] == photo_id), None)

    if not photo_to_delete:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Удаляем файл изображения
    file_path = APP_DIR / photo_to_delete['path'].strip("/")
    if file_path.exists():
        file_path.unlink()

    # Удаляем запись о фото из базы данных
    updated_photos = [p for p in photos if p["id"] != photo_id]
    write_photos_db(updated_photos)

    return JSONResponse(content={"message": "Photo deleted successfully"})

@app.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    file_path = UPLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# --- Эндпоинты для отдачи HTML страниц ---
@app.get("/", response_class=HTMLResponse)
async def read_home():
    return FileResponse(FRONTEND_DIR / "home.html")

@app.get("/home.html", response_class=HTMLResponse)
async def read_home_alias():
    return FileResponse(FRONTEND_DIR / "home.html")

@app.get("/admin", response_class=HTMLResponse)
async def read_admin(username: str = Depends(get_current_username)):
    return FileResponse(FRONTEND_DIR / "admin.html")

@app.get("/admin.html", response_class=HTMLResponse)
async def read_admin_alias(username: str = Depends(get_current_username)):
    return FileResponse(FRONTEND_DIR / "admin.html")
