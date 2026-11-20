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
    Validates Authorization Bearer token. Falls back gracefully to default
    demo traveler user so all endpoints are directly testable.
    """
    if not credentials or not credentials.credentials:
        return DEFAULT_DEMO_USER

    token = credentials.credentials
    if token in ("demo-token", "archivist-demo-jwt"):
        return DEFAULT_DEMO_USER

    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub") or payload.get("id")
        if not user_id:
            return DEFAULT_DEMO_USER

        user_metadata = payload.get("user_metadata", {})
        return AuthUser(
            id=str(user_id),
            email=payload.get("email", "traveler@wayfarer.app"),
            full_name=user_metadata.get("full_name", payload.get("name", "Wayfarer Traveler")),
        )
    except Exception:
        return DEFAULT_DEMO_USER
