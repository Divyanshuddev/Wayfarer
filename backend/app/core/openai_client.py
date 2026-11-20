from typing import Optional
from openai import AsyncOpenAI
from app.core.config import settings


class OpenAIClientSingleton:
    _instance: Optional[AsyncOpenAI] = None

    @classmethod
    def get_client(cls) -> Optional[AsyncOpenAI]:
        if cls._instance is None and settings.OPENAI_API_KEY:
            # Check for placeholder key
            if not settings.OPENAI_API_KEY.startswith("sk-") or "your-openai-api-key" in settings.OPENAI_API_KEY:
                return None
            cls._instance = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return cls._instance

    @classmethod
    def is_configured(cls) -> bool:
        return cls.get_client() is not None


def get_openai_client() -> Optional[AsyncOpenAI]:
    return OpenAIClientSingleton.get_client()
