import httpx
import os
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/novaposhta")

# --- Nova Poshta API ---
NOVA_POSHTA_API_KEY = os.getenv("NOVA_POSHTA_API_KEY")
NOVA_POSHTA_API_URL = "https://api.novaposhta.ua/v2.0/json/"

@router.get("/all-cities")
async def get_all_cities():
    async with httpx.AsyncClient() as client:
        response = await client.post(NOVA_POSHTA_API_URL, json={
            "apiKey": NOVA_POSHTA_API_KEY,
            "modelName": "Address",
            "calledMethod": "getCities",
            "methodProperties": {}
        })
        return response.json()

@router.post("/warehouses")
async def find_warehouses(request: dict):
    city_ref = request.get("cityRef")
    if not city_ref:
        raise HTTPException(status_code=400, detail="City ref is required")

    all_warehouses = []
    page = 1
    limit = 500

    async with httpx.AsyncClient() as client:
        while True:
            response = await client.post(NOVA_POSHTA_API_URL, json={
                "apiKey": NOVA_POSHTA_API_KEY,
                "modelName": "Address",
                "calledMethod": "getWarehouses",
                "methodProperties": {
                    "CityRef": city_ref,
                    "Page": str(page),
                    "Limit": str(limit)
                }
            })
            data = response.json()
            if data["success"] and data["data"]:
                all_warehouses.extend(data["data"])
                if len(data["data"]) < limit:
                    break
                page += 1
            else:
                break

    return {"success": True, "data": all_warehouses, "errors": [], "warnings": [], "info": []}