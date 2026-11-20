import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.api.v1.router import api_router
    from app.core.config import settings
except ImportError:
    from backend.app.api.v1.router import api_router
    from backend.app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    port = os.environ.get("PORT", "8001")
    print("=" * 65)
    print(f"🌍 WAYFARER – TRAVEL COMMUNITY & HOTEL INTEL API (Port: {port})")
    print("• API Routes mounted at: /api/v1")
    print("• Ready for Vercel Frontend & Render Cloud Deployment")
    print("=" * 65)
    yield


app = FastAPI(
    title="Wayfarer Travel Community API",
    description="Real trip details, honest pros & cons, hotel price inquiries, and traveler community Q&A.",
    version="2.0.0",
    lifespan=lifespan,
)

# Robust CORS Configuration: handles localhost dev, Render backend, and any Vercel domain
cors_env = os.environ.get("CORS_ORIGINS", "")
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]
if cors_env:
    for item in cors_env.split(","):
        trimmed = item.strip()
        if trimmed and trimmed not in origins:
            origins.append(trimmed)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "app": "Wayfarer Travel Community API",
        "version": "2.0.0",
        "environment": "production" if os.environ.get("RENDER") else "development",
    }


@app.get("/")
async def root():
    return {
        "app": "Wayfarer Travel Community API",
        "docs": "/docs",
        "health": "/health",
        "api_v1": "/api/v1",
    }
