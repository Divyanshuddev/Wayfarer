from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ReminderType(str, Enum):
    BIRTHDAY = "birthday"
    ANNIVERSARY = "anniversary"
    FOLLOW_UP = "follow_up"
    EVENT = "event"
    CUSTOM = "custom"


class RecurrenceRule(str, Enum):
    NONE = "none"
    YEARLY = "yearly"
    MONTHLY = "monthly"
    WEEKLY = "weekly"


class ReminderBase(BaseModel):
    title: str = Field(..., max_length=200)
    notes: Optional[str] = None
    remind_at: datetime
    reminder_type: ReminderType = ReminderType.CUSTOM
    memory_id: Optional[str] = None
    memory_title: Optional[str] = None
    recurrence: RecurrenceRule = RecurrenceRule.NONE
    is_completed: bool = False


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    remind_at: Optional[datetime] = None
    reminder_type: Optional[ReminderType] = None
    is_completed: Optional[bool] = None
    recurrence: Optional[RecurrenceRule] = None


class ReminderResponse(ReminderBase):
    id: str
    user_id: str
    created_at: datetime


class CollectionBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = ""
    icon: str = "folder"
    accent_shade: str = "#8B5CF6"


class CollectionCreate(CollectionBase):
    pass


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    accent_shade: Optional[str] = None


class CollectionResponse(CollectionBase):
    id: str
    user_id: str
    memory_count: int = 0
    last_viewed_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserProfile(BaseModel):
    id: str
    full_name: str = "Shadow Archivist"
    avatar_url: Optional[str] = None
    theme: str = "dark"
    ai_auto_organize: bool = True
    ai_auto_link: bool = True
    default_privacy: str = "private"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    theme: Optional[str] = None
    ai_auto_organize: Optional[bool] = None
    ai_auto_link: Optional[bool] = None
    default_privacy: Optional[str] = None
