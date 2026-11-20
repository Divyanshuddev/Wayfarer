from fastapi import APIRouter
from app.api.v1 import (
    chat,
    collections,
    dashboard,
    memories,
    reminders,
    search,
    settings,
)

api_router = APIRouter()

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(memories.router, prefix="/memories", tags=["memories"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(collections.router, prefix="/collections", tags=["collections"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["reminders"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
