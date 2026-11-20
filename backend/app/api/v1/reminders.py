from typing import List
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import db_store
from app.core.security import AuthUser, get_current_user
from app.schemas.collections_reminders import (
    ReminderCreate,
    ReminderResponse,
    ReminderUpdate,
)

router = APIRouter()


@router.get("", response_model=List[ReminderResponse])
async def list_reminders(current_user: AuthUser = Depends(get_current_user)):
    return db_store.get_reminders(current_user.id)


@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    rem_in: ReminderCreate,
    current_user: AuthUser = Depends(get_current_user),
):
    new_rem = ReminderResponse(
        id=f"rem-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        title=rem_in.title,
        due_date=rem_in.due_date,
        reminder_type=rem_in.reminder_type,
        memory_id=rem_in.memory_id,
        memory_title=rem_in.memory_title,
        recurrence_rule=rem_in.recurrence_rule,
        is_completed=rem_in.is_completed,
        created_at=datetime.utcnow(),
    )
    return db_store.create_reminder(current_user.id, new_rem)


@router.post("/{reminder_id}/toggle", response_model=ReminderResponse)
async def toggle_reminder(
    reminder_id: str,
    current_user: AuthUser = Depends(get_current_user),
):
    rem = db_store.toggle_reminder(reminder_id)
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return rem


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    reminder_id: str,
    current_user: AuthUser = Depends(get_current_user),
):
    if not db_store.delete_reminder(reminder_id):
        raise HTTPException(status_code=404, detail="Reminder not found")
    return None
