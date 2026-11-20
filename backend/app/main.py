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
    print("=" * 60)
    print("🌍 WAYFARER – COMMUNITY TRIP INTEL & TRAVELER Q&A PLATFORM READY")
    print("• API Routes mounted at: /api/v1")
    print("• Trip Sharing, Pros/Cons, Hotel Inquiries & AI Travel Intel: ACTIVE")
    print("=" * 60)
    yield


app = FastAPI(
    title="Wayfarer Travel Community API",
    description="Real trip details, honest pros & cons, hotel price inquiries, and traveler community Q&A.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "online", "app": "Wayfarer Travel Community", "version": "2.0.0"}
