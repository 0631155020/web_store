from fastapi import APIRouter
from src.routers.novap import router as n_router
from src.routers.item import router as i_router

main_router = APIRouter()

main_router.include_router(n_router)
main_router.include_router(i_router)
