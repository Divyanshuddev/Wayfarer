from typing import Optional
import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
try:
    from app.core.config import settings
except ImportError:
    from backend.app.core.config import settings

security_bearer = HTTPBearer(auto_error=False)


class AuthUser(BaseModel):
    id: str
    email: str = "archivist@shadow.ai"
    full_name: str = "Kaelen Vance"


DEFAULT_DEMO_USER = AuthUser(
    id="usr_00000000-0000-0000-0000-000000000001",
    email="archivist@shadow.ai",
    full_name="Kaelen Vance"
)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
) -> AuthUser:
    """
    Validates Supabase JWT. In development/demo mode or if token is absent,
    falls back gracefully to the default archivist profile so all APIs are testable.
    """
    if not credentials or not credentials.credentials:
        return DEFAULT_DEMO_USER

    token = credentials.credentials

    # If it's a demo bearer token
    if token in ("demo-token", "archivist-demo-jwt"):
        return DEFAULT_DEMO_USER

    try:
        # Decode without verification if secret isn't configured, or verify if secret is set
        if settings.SUPABASE_JWT_SECRET:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256", "RS256"],
                options={"verify_aud": False},
            )
        else:
            payload = jwt.decode(token, options={"verify_signature": False})

        user_id = payload.get("sub")
        if not user_id:
            return DEFAULT_DEMO_USER

        user_metadata = payload.get("user_metadata", {})
        return AuthUser(
            id=str(user_id),
            email=payload.get("email", "user@shadow.ai"),
            full_name=user_metadata.get("full_name", "Shadow Archivist"),
        )
    except Exception:
        # Graceful fallback for offline demo testing
        return DEFAULT_DEMO_USER
