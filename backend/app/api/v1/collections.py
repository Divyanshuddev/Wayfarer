from typing import List
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import db_store
from app.core.security import AuthUser, get_current_user
from app.schemas.collections_reminders import (
    CollectionCreate,
    CollectionResponse,
    CollectionUpdate,
)

router = APIRouter()


@router.get("", response_model=List[CollectionResponse])
async def list_collections(current_user: AuthUser = Depends(get_current_user)):
    return db_store.get_collections(current_user.id)


@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    col_in: CollectionCreate,
    current_user: AuthUser = Depends(get_current_user),
):
    new_col = CollectionResponse(
        id=f"col-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        name=col_in.name,
        description=col_in.description or "",
        icon=col_in.icon,
        color=col_in.color,
        is_smart=col_in.is_smart,
        filter_criteria=col_in.filter_criteria,
        memory_count=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    return db_store.create_collection(current_user.id, new_col)


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(
    collection_id: str,
    current_user: AuthUser = Depends(get_current_user),
):
    col = db_store.get_collection(collection_id)
    if not col or col.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Collection not found")
    return col


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: str,
    current_user: AuthUser = Depends(get_current_user),
):
    col = db_store.get_collection(collection_id)
    if not col or col.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Collection not found")
    db_store.delete_collection(collection_id)
    return None
