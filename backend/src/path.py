# --- File and Directory Paths ---
from pathlib import Path
import os


BASE_DIR = Path(os.getenv("BASE_DIR", Path(__file__).resolve().parent.parent))
UPLOADS_DIR = BASE_DIR / "uploads"
FRONTEND_DIR = BASE_DIR / "frontend"
UPLOADS_DIR.mkdir(exist_ok=True)