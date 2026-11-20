import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from app.core.database import db_store, INITIAL_MEMORIES, INITIAL_COLLECTIONS, INITIAL_REMINDERS, INITIAL_PROFILE
from app.core.security import AuthUser, get_current_user
from app.schemas.collections_reminders import UserProfile, UserProfileUpdate

router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: AuthUser = Depends(get_current_user)):
    return db_store.get_profile()


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    updates: UserProfileUpdate,
    current_user: AuthUser = Depends(get_current_user),
):
    return db_store.update_profile(updates.model_dump(exclude_unset=True))


@router.get("/export")
async def export_vault_archive(current_user: AuthUser = Depends(get_current_user)):
    """Exports entire user archive as portable JSON."""
    memories = [m.model_dump(mode="json") for m in db_store.get_all_memories(current_user.id)]
    collections = [c.model_dump(mode="json") for c in db_store.get_collections(current_user.id)]
    reminders = [r.model_dump(mode="json") for r in db_store.get_reminders(current_user.id)]
    profile = db_store.get_profile().model_dump(mode="json")

    export_payload = {
        "format": "shadow-memory-archive",
        "version": "1.0",
        "exported_at": datetime.utcnow().isoformat(),
        "profile": profile,
        "memories": memories,
        "collections": collections,
        "reminders": reminders,
    }

    return JSONResponse(
        content=export_payload,
        headers={
            "Content-Disposition": f'attachment; filename="shadow-archive-{datetime.utcnow().strftime("%Y-%m-%d")}.json"'
        }
    )


@router.post("/import")
async def import_vault_archive(
    file: UploadFile = File(...),
    current_user: AuthUser = Depends(get_current_user),
):
    """Imports memories, collections, and reminders from a Shadow JSON backup."""
    content = await file.read()
    try:
        data = json.loads(content.decode("utf-8"))
        mems = data.get("memories", [])
        from app.schemas.memory import MemoryResponse
        for m in mems:
            mem_obj = MemoryResponse(**m)
            db_store.memories[mem_obj.id] = mem_obj
        return {"success": True, "imported_memories_count": len(mems)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse archive JSON: {e}")


@router.post("/reset")
async def reset_vault_archive(current_user: AuthUser = Depends(get_current_user)):
    """Resets to initial curated sample archive."""
    db_store.memories = {m.id: m for m in INITIAL_MEMORIES}
    db_store.collections = {c.id: c for c in INITIAL_COLLECTIONS}
    db_store.reminders = {r.id: r for r in INITIAL_REMINDERS}
    db_store.profile = INITIAL_PROFILE
    return {"success": True, "message": "Archive restored to initial curated state"}
