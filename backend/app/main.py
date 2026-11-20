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
    print("Ψ SHADOW – YOUR DIGITAL MEMORY FASTAPI BACKEND READY")
    print(f"• API Routes mounted at: {settings.API_V1_STR}")
    print("• Strict Anti-Hallucination Grounding: ACTIVE")
    print("=" * 60)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Your life, remembered. AI-powered grounded personal memory assistant backend.",
    version="1.0.0",
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

# Mount API V1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Shadow Digital Memory Backend",
        "version": "1.0.0",
        "grounding_engine": "active"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
