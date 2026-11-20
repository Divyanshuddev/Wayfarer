from typing import Optional
from fastapi import APIRouter, Depends
from app.core.database import db_store
from app.core.security import AuthUser, get_current_user
from app.schemas.search import SearchFilters, SearchQuery, SearchResponse, SearchResultItem
from app.services.embedding_service import STOP_WORDS, cosine_similarity, generate_deterministic_embedding

router = APIRouter()


@router.get("", response_model=SearchResponse)
async def search_memories_get(
    q: str = "",
    category: Optional[str] = None,
    memory_type: Optional[str] = None,
    tag: Optional[str] = None,
    person: Optional[str] = None,
    current_user: AuthUser = Depends(get_current_user),
):
    return perform_hybrid_search(
        q,
        SearchFilters(
            category=category if category != "all" else None,
            memory_type=memory_type if memory_type != "all" else None,
            tag=tag,
            person=person,
        ),
        current_user.id,
    )


@router.post("", response_model=SearchResponse)
async def search_memories_post(
    req: SearchQuery,
    current_user: AuthUser = Depends(get_current_user),
):
    return perform_hybrid_search(req.query, req.filters, current_user.id, req.limit)


def perform_hybrid_search(
    query_text: str,
    filters: Optional[SearchFilters],
    user_id: str,
    limit: int = 20,
) -> SearchResponse:
    memories = db_store.get_all_memories(user_id)

    # Metadata filtering
    if filters:
        if filters.category:
            memories = [m for m in memories if m.category == filters.category]
        if filters.memory_type:
            memories = [m for m in memories if m.memory_type.value == filters.memory_type]
        if filters.tag:
            memories = [m for m in memories if filters.tag in m.tags]
        if filters.person:
            memories = [m for m in memories if filters.person in m.extracted_entities.people]
        if filters.has_attachments:
            memories = [m for m in memories if m.attachments]

    q_clean = query_text.strip().lower()
    if not q_clean:
        return SearchResponse(
            query="",
            count=len(memories),
            results=[
                SearchResultItem(
                    memory=m,
                    similarity=1.0,
                    match_reason="Filter match",
                    highlighted_snippet=m.ai_summary or m.description[:140],
                )
                for m in memories[:limit]
            ],
        )

    query_tokens = [
        t for t in q_clean.replace("?", " ").replace("!", " ").replace(".", " ").split()
        if len(t) > 2 and t not in STOP_WORDS
    ]

    query_vec = generate_deterministic_embedding(q_clean)
    results = []

    for m in memories:
        people_str = " ".join(m.extracted_entities.people)
        places_str = " ".join(m.extracted_entities.places)
        topics_str = " ".join(m.extracted_entities.topics)
        full_text = f"{m.title} {m.description} {m.ai_summary} {' '.join(m.tags)} {people_str} {places_str} {topics_str} {m.location or ''}".lower()
        reasons = []
        token_matches = 0
        lexical_score = 0.0

        if q_clean in full_text:
            reasons.append(f'Contains exact phrase "{query_text}"')
            lexical_score += 0.6
            token_matches += 2

        for t in query_tokens:
            if t in m.title.lower():
                token_matches += 1
                lexical_score += 0.4
                reasons.append(f'Title matches "{t}"')
            elif any(t in tag.lower() for tag in m.tags):
                token_matches += 1
                lexical_score += 0.35
                reasons.append(f"Tag #{t}")
            elif any(t in p.lower() for p in m.extracted_entities.people):
                token_matches += 1
                lexical_score += 0.45
                reasons.append(f"Person: {t}")
            elif any(t in pl.lower() for pl in m.extracted_entities.places):
                token_matches += 1
                lexical_score += 0.4
                reasons.append(f"Place: {t}")
            elif t in full_text:
                token_matches += 1
                lexical_score += 0.2

        mem_vec = generate_deterministic_embedding(full_text)
        semantic_score = cosine_similarity(query_vec, mem_vec)

        combined = min(1.0, max(0.0, lexical_score * 0.6 + semantic_score * 0.4))

        if reasons or (query_tokens and token_matches > 0) or semantic_score >= 0.45:
            reason_text = " • ".join(reasons[:2]) if reasons else f"Semantic similarity ({int(semantic_score * 100)}%)"
            
            # Highlight snippet
            snippet = m.ai_summary or m.description[:160]
            match_token = query_tokens[0] if query_tokens else q_clean
            idx = m.description.lower().find(match_token)
            if idx > -1:
                start = max(0, idx - 50)
                end = min(len(m.description), idx + 120)
                snippet = ("..." if start > 0 else "") + m.description[start:end] + ("..." if end < len(m.description) else "")

            results.append(
                SearchResultItem(
                    memory=m,
                    similarity=round(combined, 3),
                    match_reason=reason_text,
                    highlighted_snippet=snippet,
                )
            )

    results.sort(key=lambda x: x.similarity, reverse=True)
    return SearchResponse(
        query=query_text,
        count=len(results),
        results=results[:limit],
    )
