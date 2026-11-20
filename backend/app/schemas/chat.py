from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class MemoryCitation(BaseModel):
    memory_id: str
    title: str
    date: str
    snippet: str


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    citations: Optional[List[MemoryCitation]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_grounded: bool = True


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_history: List[ChatMessage] = Field(default_factory=list)
    stream: bool = False


class ChatResponse(BaseModel):
    answer: str
    citations: List[MemoryCitation] = Field(default_factory=list)
    is_grounded: bool = True
    unfound: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)
