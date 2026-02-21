from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse, HTMLResponse

from src.security import get_current_username
from src.path import FRONTEND_DIR

router = APIRouter()

# --- HTML Endpoints ---
@router.get("/", response_class=HTMLResponse)
async def read_main():
    return FileResponse(FRONTEND_DIR / "main.html")

@router.get("/main.html", response_class=HTMLResponse)
async def read_home_alias():
    return FileResponse(FRONTEND_DIR / "main.html")

@router.get("/home.html", response_class=HTMLResponse)
async def read_home():
    return FileResponse(FRONTEND_DIR / "home.html")

@router.get("/admin", response_class=HTMLResponse)
async def read_admin(username: str = Depends(get_current_username)):
    return FileResponse(FRONTEND_DIR / "admin.html")

@router.get("/admin.html", response_class=HTMLResponse)
async def read_admin_alias(username: str = Depends(get_current_username)):
    return FileResponse(FRONTEND_DIR / "admin.html")

@router.get("/checkout", response_class=HTMLResponse)
async def read_checkout():
    return FileResponse(FRONTEND_DIR / "checkout.html")

@router.get("/checkout.html", response_class=HTMLResponse)
async def read_checkout_alias():
    return FileResponse(FRONTEND_DIR / "checkout.html")

@router.get("/product-detail", response_class=HTMLResponse)
async def read_product_detail():
    return FileResponse(FRONTEND_DIR / "product-detail.html")

@router.get("/product-detail.html", response_class=HTMLResponse)
async def read_product_detail_alias():
    return FileResponse(FRONTEND_DIR / "product-detail.html")

@router.get("/about.html", response_class=HTMLResponse)
async def read_about():
    return FileResponse(FRONTEND_DIR / "about.html")

@router.get("/contact.html", response_class=HTMLResponse)
async def read_contact():
    return FileResponse(FRONTEND_DIR / "contact.html")
