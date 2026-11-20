from datetime import datetime
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
from app.core.database import db_store
from app.core.security import AuthUser, get_current_user
from app.schemas.memory import (
    MemoryAttachment,
    MemoryCategory,
    MemoryCreate,
    MemoryResponse,
    MemorySentiment,
    MemorySourceType,
    MemoryUpdate,
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
    sentiment: Optional[str] = None,
    tag: Optional[str] = None,
    person: Optional[str] = None,
    is_pinned: Optional[bool] = None,
    is_favorite: Optional[bool] = None,
    current_user: AuthUser = Depends(get_current_user),
):
    mems = db_store.get_all_memories(current_user.id)
    if category and category != "all":
        mems = [m for m in mems if m.category.value == category]
    if sentiment and sentiment != "all":
        mems = [m for m in mems if m.sentiment.value == sentiment]
    if tag:
        mems = [m for m in mems if tag in m.tags]
    if person:
        mems = [m for m in mems if person in m.people]
    if is_pinned is not None:
        mems = [m for m in mems if m.is_pinned == is_pinned]
    if is_favorite is not None:
        mems = [m for m in mems if m.is_favorite == is_favorite]
    return mems


@router.post("", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED)
async def create_memory(
    memory_in: MemoryCreate,
    current_user: AuthUser = Depends(get_current_user),
):
    return db_store.create_memory(current_user.id, memory_in)


@router.post("/upload", response_model=MemoryResponse)
async def upload_memory_with_file(
    content: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    category: Optional[str] = Form("thought"),
    sentiment: Optional[str] = Form("neutral"),
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    current_user: AuthUser = Depends(get_current_user),
):
    """Handles multipart upload of audio, image OCR, PDF, or scraped web link."""
    extracted_text = ""
    source_type = MemorySourceType.QUICK_NOTE
    attachments = []

    if file:
        file_bytes = await file.read()
        filename = file.filename or "upload"
        mime = file.content_type or ""

        if mime.startswith("audio/") or filename.endswith((".wav", ".mp3", ".m4a")):
            source_type = MemorySourceType.VOICE
            extracted_text = await transcribe_audio_file(file_bytes, filename)
        elif mime.startswith("image/") or filename.endswith((".jpg", ".jpeg", ".png", ".webp")):
            source_type = MemorySourceType.IMAGE_OCR
            extracted_text = await perform_vision_ocr(file_bytes, mime)
        elif mime == "application/pdf" or filename.endswith(".pdf"):
            source_type = MemorySourceType.DOCUMENT
            extracted_text = extract_text_from_pdf(file_bytes)

        import base64
        b64 = f"data:{mime};base64,{base64.b64encode(file_bytes).decode('utf-8')}"
        attachments.append(
            MemoryAttachment(
                id=f"att-{uuid.uuid4().hex[:8]}",
                memory_id="",
                user_id=current_user.id,
                file_path=b64,
                file_name=filename,
                file_type=mime,
                file_size=len(file_bytes),
                extracted_text=extracted_text,
                created_at=datetime.utcnow(),
            )
        )

    elif url:
        scraped = await scrape_url_content(url)
        extracted_text = scraped["content"]
        if not title:
            title = scraped["title"]

    full_body = f"{content or ''}\n\n{extracted_text}".strip()
    if not full_body:
        full_body = "Memory recorded without content"

    # AI entity extraction
    organized = await organize_memory_content(full_body)

    mem_create = MemoryCreate(
        title=title or organized.title,
        content=full_body,
        summary=organized.summary,
        category=MemoryCategory(category) if category in MemoryCategory.__members__.values() else organized.category,
        sentiment=MemorySentiment(sentiment) if sentiment in MemorySentiment.__members__.values() else organized.sentiment,
        memory_date=datetime.utcnow(),
        is_pinned=False,
        is_favorite=False,
        tags=organized.tags,
        people=organized.people,
        source_type=source_type,
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
                    due_date=datetime.utcnow(),
                    reminder_type=ReminderType.BIRTHDAY if "birthday" in r.get("reminder_type", "") else ReminderType.FOLLOW_UP,
                    is_completed=False,
                    recurrence_rule=RecurrenceRule.YEARLY if "birthday" in r.get("reminder_type", "") else RecurrenceRule.NONE,
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
    embed = await create_embedding(f"{extracted.title} {extracted.summary} {text} {' '.join(extracted.tags)}")

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
