from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.core.database import db_store
from app.core.security import AuthUser, get_current_user
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag_assistant import answer_rag_query, stream_rag_query

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat_with_shadow(
    req: ChatRequest,
    current_user: AuthUser = Depends(get_current_user),
):
    """Grounded RAG assistant with strict anti-hallucination citations."""
    memories = db_store.get_all_memories(current_user.id)
    return await answer_rag_query(req.message, memories)


@router.post("/stream")
async def chat_stream_with_shadow(
    req: ChatRequest,
    current_user: AuthUser = Depends(get_current_user),
):
    """Server-Sent Events (SSE) streaming grounded response."""
    memories = db_store.get_all_memories(current_user.id)
    return StreamingResponse(
        stream_rag_query(req.message, memories),
        media_type="text/event-stream"
    )
