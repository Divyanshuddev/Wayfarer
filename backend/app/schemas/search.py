from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.memory import MemoryCategory, MemoryResponse, MemorySentiment


class SearchFilters(BaseModel):
    category: Optional[MemoryCategory] = None
    sentiment: Optional[MemorySentiment] = None
    tag: Optional[str] = None
    person: Optional[str] = None
    has_attachments: Optional[bool] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None


class SearchQuery(BaseModel):
    query: str = Field(..., min_length=1)
    filters: Optional[SearchFilters] = None
    limit: int = 20


class SearchResultItem(BaseModel):
    memory: MemoryResponse
    similarity: float
    match_reason: str
    highlighted_snippet: str


class SearchResponse(BaseModel):
    query: str
    count: int
    results: List[SearchResultItem]
