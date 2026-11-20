from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.memory import MemoryCategory, MemorySentiment


class ReminderType(str, Enum):
    BIRTHDAY = "birthday"
    ANNIVERSARY = "anniversary"
    FOLLOW_UP = "follow_up"
    MEMORY_RECURRENCE = "memory_recurrence"
    CUSTOM = "custom"


class RecurrenceRule(str, Enum):
    NONE = "none"
    YEARLY = "yearly"
    MONTHLY = "monthly"
    WEEKLY = "weekly"


class ReminderBase(BaseModel):
    title: str = Field(..., max_length=200)
    due_date: datetime
    reminder_type: ReminderType = ReminderType.CUSTOM
    memory_id: Optional[str] = None
    memory_title: Optional[str] = None
    recurrence_rule: RecurrenceRule = RecurrenceRule.NONE
    is_completed: bool = False


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    due_date: Optional[datetime] = None
    reminder_type: Optional[ReminderType] = None
    is_completed: Optional[bool] = None
    recurrence_rule: Optional[RecurrenceRule] = None


class ReminderResponse(ReminderBase):
    id: str
    user_id: str
    created_at: datetime


class CollectionFilterCriteria(BaseModel):
    tags: Optional[List[str]] = None
    category: Optional[MemoryCategory] = None
    people: Optional[List[str]] = None
    sentiment: Optional[MemorySentiment] = None


class CollectionBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = ""
    icon: str = "folder"
    color: str = "#8b5cf6"
    is_smart: bool = False
    filter_criteria: Optional[CollectionFilterCriteria] = None


class CollectionCreate(CollectionBase):
    pass


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_smart: Optional[bool] = None
    filter_criteria: Optional[CollectionFilterCriteria] = None


class CollectionResponse(CollectionBase):
    id: str
    user_id: str
    memory_count: int = 0
    created_at: datetime
    updated_at: datetime


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    ai_tone: str = "grounded"
    theme_preference: str = "dark-purple"
    storage_used_bytes: int = 0
    created_at: datetime
    updated_at: datetime


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    ai_tone: Optional[str] = None
    theme_preference: Optional[str] = None
