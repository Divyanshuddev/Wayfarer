from datetime import datetime
from enum import Enum
from typing import Any, List, Optional
from pydantic import BaseModel, Field


class MemoryCategory(str, Enum):
    THOUGHT = "thought"
    EVENT = "event"
    CONVERSATION = "conversation"
    MEDIA = "media"
    READING = "reading"
    WORK = "work"
    PERSONAL = "personal"
    LOCATION = "location"
    IDEA = "idea"


class MemorySentiment(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    REFLECTIVE = "reflective"


class MemorySourceType(str, Enum):
    QUICK_NOTE = "quick_note"
    VOICE = "voice"
    IMAGE_OCR = "image_ocr"
    DOCUMENT = "document"
    CHAT = "chat"


class LinkType(str, Enum):
    RELATED = "related"
    CAUSED = "caused"
    FOLLOWS = "follows"
    REFERENCES = "references"
    OPPOSITE = "opposite"


class MemoryAttachmentBase(BaseModel):
    file_path: str
    file_name: str
    file_type: str
    file_size: int = 0
    extracted_text: Optional[str] = None


class MemoryAttachment(MemoryAttachmentBase):
    id: str
    memory_id: str
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MemoryLink(BaseModel):
    id: str
    source_memory_id: str
    target_memory_id: str
    link_type: LinkType = LinkType.RELATED
    confidence_score: float = 0.8
    reasoning: str
    target_memory_title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MemoryBase(BaseModel):
    title: str = Field(..., max_length=200)
    content: str
    summary: Optional[str] = ""
    category: MemoryCategory = MemoryCategory.THOUGHT
    sentiment: MemorySentiment = MemorySentiment.NEUTRAL
    memory_date: datetime = Field(default_factory=datetime.utcnow)
    is_pinned: bool = False
    is_favorite: bool = False
    location_name: Optional[str] = None
    weather: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    people: List[str] = Field(default_factory=list)
    source_type: MemorySourceType = MemorySourceType.QUICK_NOTE
    collection_ids: List[str] = Field(default_factory=list)


class MemoryCreate(MemoryBase):
    pass


class MemoryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    category: Optional[MemoryCategory] = None
    sentiment: Optional[MemorySentiment] = None
    memory_date: Optional[datetime] = None
    is_pinned: Optional[bool] = None
    is_favorite: Optional[bool] = None
    location_name: Optional[str] = None
    weather: Optional[str] = None
    tags: Optional[List[str]] = None
    people: Optional[List[str]] = None
    collection_ids: Optional[List[str]] = None


class MemoryResponse(MemoryBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    attachments: List[MemoryAttachment] = Field(default_factory=list)
    links: List[MemoryLink] = Field(default_factory=list)


class ExtractedEntities(BaseModel):
    title: str
    summary: str
    category: MemoryCategory
    sentiment: MemorySentiment
    tags: List[str] = Field(default_factory=list)
    people: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    memory_date: Optional[str] = None
    detected_reminders: List[dict] = Field(default_factory=list)
