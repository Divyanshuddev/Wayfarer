from fastapi import APIRouter
from app.api.v1 import (
    dashboard,
    qa,
    trips,
)

api_router = APIRouter()

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(trips.router, prefix="/trips", tags=["trips"])
api_router.include_router(qa.router, prefix="/qa", tags=["qa"])
