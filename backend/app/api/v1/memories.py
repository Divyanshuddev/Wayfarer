from datetime import datetime
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
from app.core.database import db_store
from app.core.security import AuthUser, get_current_user
from app.schemas.memory import (
    ExtractedEntities,
    MemoryAttachment,
    MemoryCategory,
    MemoryCreate,
    MemoryResponse,
    MemoryType,
    MemoryUpdate,
    PrivacyLevel,
)
from app.services.ai_organizer import organize_memory_content
from app.services.attachment_parser import (
    extract_text_from_pdf,
    perform_vision_ocr,
    scrape_url_content,
    transcribe_audio_file,
)
from app.services.embedding_service import create_embedding

router = APIRouter()


class MemoryProcessRequest(BaseModel):
    content: Optional[str] = ""
    image_url: Optional[str] = None
    url: Optional[str] = None


@router.get("", response_model=List[MemoryResponse])
async def list_memories(
    category: Optional[str] = None,
    memory_type: Optional[str] = None,
    tag: Optional[str] = None,
    person: Optional[str] = None,
    is_pinned: Optional[bool] = None,
    current_user: AuthUser = Depends(get_current_user),
):
    mems = db_store.get_all_memories(current_user.id)
    if category and category != "all":
        mems = [m for m in mems if m.category == category]
    if memory_type and memory_type != "all":
        mems = [m for m in mems if m.memory_type.value == memory_type]
    if tag:
        mems = [m for m in mems if tag in m.tags]
    if person:
        mems = [m for m in mems if person in m.extracted_entities.people]
    if is_pinned is not None:
        mems = [m for m in mems if m.is_pinned == is_pinned]
    return mems


@router.post("", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED)
async def create_memory(
    memory_in: MemoryCreate,
    current_user: AuthUser = Depends(get_current_user),
):
    return db_store.create_memory(current_user.id, memory_in)


@router.post("/upload", response_model=MemoryResponse)
async def upload_memory_with_file(
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    memory_type: Optional[str] = Form("note"),
    category: Optional[str] = Form("Ideas & Projects"),
    location: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    personal_notes: Optional[str] = Form(None),
    current_user: AuthUser = Depends(get_current_user),
):
    """Handles multipart upload of audio, image OCR, PDF, or scraped web link."""
    extracted_text = ""
    m_type = MemoryType.NOTE
    attachments = []

    if file:
        file_bytes = await file.read()
        filename = file.filename or "upload"
        mime = file.content_type or ""

        if mime.startswith("audio/") or filename.endswith((".wav", ".mp3", ".m4a")):
            m_type = MemoryType.VOICE
            extracted_text = await transcribe_audio_file(file_bytes, filename)
        elif mime.startswith("image/") or filename.endswith((".jpg", ".jpeg", ".png", ".webp")):
            m_type = MemoryType.PHOTO
            extracted_text = await perform_vision_ocr(file_bytes, mime)
        elif mime.startswith("video/") or filename.endswith((".mp4", ".mov", ".webm")):
            m_type = MemoryType.VIDEO
        elif mime == "application/pdf" or filename.endswith(".pdf"):
            m_type = MemoryType.DOCUMENT
            extracted_text = extract_text_from_pdf(file_bytes)

        import base64
        b64 = f"data:{mime};base64,{base64.b64encode(file_bytes).decode('utf-8')}"
        attachments.append(
            MemoryAttachment(
                id=f"att-{uuid.uuid4().hex[:8]}",
                memory_id="",
                user_id=current_user.id,
                storage_path=b64,
                file_name=filename,
                file_type=mime,
                file_size=len(file_bytes),
                extracted_text=extracted_text,
                created_at=datetime.utcnow(),
            )
        )

    elif url:
        m_type = MemoryType.LINK
        scraped = await scrape_url_content(url)
        extracted_text = scraped["content"]
        if not title:
            title = scraped["title"]

    full_body = f"{description or ''}\n\n{extracted_text}".strip()
    if not full_body:
        full_body = "Memory recorded without description"

    # AI entity extraction
    organized = await organize_memory_content(full_body)

    mem_create = MemoryCreate(
        title=title or organized.title,
        description=full_body,
        memory_type=MemoryType(memory_type) if memory_type in MemoryType.__members__.values() else m_type,
        category=category or organized.category,
        location=location or (organized.extracted_entities.places[0] if organized.extracted_entities.places else None),
        tags=organized.tags,
        ai_summary=organized.ai_summary,
        extracted_entities=organized.extracted_entities,
        personal_notes=personal_notes,
        source_url=url,
        privacy_level=PrivacyLevel.PRIVATE,
        is_pinned=False,
        collection_ids=[]
    )

    created_mem = db_store.create_memory(current_user.id, mem_create, attachments)

    # Auto-schedule reminders if detected
    if organized.detected_reminders:
        from app.schemas.collections_reminders import ReminderResponse, ReminderType, RecurrenceRule
        for r in organized.detected_reminders:
            db_store.create_reminder(
                current_user.id,
                ReminderResponse(
                    id=f"rem-{uuid.uuid4().hex[:8]}",
                    user_id=current_user.id,
                    memory_id=created_mem.id,
                    title=r.get("title", f"Reminder: {created_mem.title}"),
                    notes=f"Auto-created from memory: {created_mem.title}",
                    remind_at=datetime.utcnow(),
                    reminder_type=ReminderType.BIRTHDAY if "birthday" in r.get("reminder_type", "") else ReminderType.FOLLOW_UP,
                    recurrence=RecurrenceRule.YEARLY if "birthday" in r.get("reminder_type", "") else RecurrenceRule.NONE,
                    is_completed=False,
                    memory_title=created_mem.title,
                    created_at=datetime.utcnow(),
                )
            )

    return created_mem


@router.post("/process")
async def process_raw_memory(req: MemoryProcessRequest):
    """Processes memory text/image/url through the AI extraction pipeline."""
    text = req.content or ""
    if req.url:
        scraped = await scrape_url_content(req.url)
        text = f"{text}\n\n{scraped['content']}".strip()

    extracted = await organize_memory_content(text)
    embed = await create_embedding(f"{extracted.title} {extracted.ai_summary} {text} {' '.join(extracted.tags)}")

    return {
        "success": True,
        "extracted": extracted,
        "embedding": embed,
        "processed_at": datetime.utcnow().isoformat()
    }


@router.get("/{memory_id}", response_model=MemoryResponse)
async def get_memory(memory_id: str, current_user: AuthUser = Depends(get_current_user)):
    mem = db_store.get_memory(memory_id)
    if not mem or mem.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Memory not found in vault")
    return mem


@router.put("/{memory_id}", response_model=MemoryResponse)
async def update_memory(
    memory_id: str,
    updates: MemoryUpdate,
    current_user: AuthUser = Depends(get_current_user),
):
    mem = db_store.get_memory(memory_id)
    if not mem or mem.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Memory not found")
    updated = db_store.update_memory(memory_id, updates.model_dump(exclude_unset=True))
    return updated


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(memory_id: str, current_user: AuthUser = Depends(get_current_user)):
    mem = db_store.get_memory(memory_id)
    if not mem or mem.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Memory not found")
    db_store.delete_memory(memory_id)
    return None
