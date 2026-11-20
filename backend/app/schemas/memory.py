from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MemoryType(str, Enum):
    NOTE = "note"
    PHOTO = "photo"
    VIDEO = "video"
    DOCUMENT = "document"
    VOICE = "voice"
    CONVERSATION = "conversation"
    LINK = "link"
    EVENT = "event"


class MemoryCategory(str, Enum):
    PEOPLE_EXPERIENCES = "People & Experiences"
    IDEAS_PROJECTS = "Ideas & Projects"
    PLACES_TRAVEL = "Places & Travel"
    DOCUMENTS_RECEIPTS = "Documents & Receipts"
    MEDIA_RECOMMENDATIONS = "Media & Recommendations"
    HEALTH_WELLNESS = "Health & Wellness"
    CONVERSATIONS = "Conversations"
    LIFE_MILESTONES = "Life Milestones"


class PrivacyLevel(str, Enum):
    PRIVATE = "private"
    LOCKED = "locked"


class ExtractedEntities(BaseModel):
    people: List[str] = Field(default_factory=list)
    places: List[str] = Field(default_factory=list)
    dates: List[str] = Field(default_factory=list)
    topics: List[str] = Field(default_factory=list)
    details: List[str] = Field(default_factory=list)


class MemoryAttachmentBase(BaseModel):
    storage_path: str
    file_name: str
    file_type: str
    file_size: int = 0
    extracted_text: Optional[str] = None


class MemoryAttachment(MemoryAttachmentBase):
    id: str
    memory_id: str
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MemoryConnection(BaseModel):
    id: str
    source_memory_id: str
    target_memory_id: str
    connection_reason: Optional[str] = None
    similarity_score: float = 0.8
    target_memory_title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MemoryBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = ""
    memory_type: MemoryType = MemoryType.NOTE
    memory_date: datetime = Field(default_factory=datetime.utcnow)
    location: Optional[str] = None
    category: str = "Ideas & Projects"
    tags: List[str] = Field(default_factory=list)
    ai_summary: Optional[str] = ""
    extracted_entities: ExtractedEntities = Field(default_factory=ExtractedEntities)
    personal_notes: Optional[str] = None
    source_url: Optional[str] = None
    privacy_level: PrivacyLevel = PrivacyLevel.PRIVATE
    is_pinned: bool = False
    collection_ids: List[str] = Field(default_factory=list)


class MemoryCreate(MemoryBase):
    pass


class MemoryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    memory_type: Optional[MemoryType] = None
    memory_date: Optional[datetime] = None
    location: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    ai_summary: Optional[str] = None
    extracted_entities: Optional[ExtractedEntities] = None
    personal_notes: Optional[str] = None
    source_url: Optional[str] = None
    privacy_level: Optional[PrivacyLevel] = None
    is_pinned: Optional[bool] = None
    collection_ids: Optional[List[str]] = None


class MemoryResponse(MemoryBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    attachments: List[MemoryAttachment] = Field(default_factory=list)
    connections: List[MemoryConnection] = Field(default_factory=list)


class AIExtractionOutput(BaseModel):
    title: str
    ai_summary: str
    category: str
    tags: List[str] = Field(default_factory=list)
    extracted_entities: ExtractedEntities = Field(default_factory=ExtractedEntities)
    detected_reminders: List[dict] = Field(default_factory=list)
