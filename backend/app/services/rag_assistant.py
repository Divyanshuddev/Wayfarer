from typing import AsyncGenerator, List, Tuple
try:
    from app.core.openai_client import get_openai_client
    from app.schemas.chat import ChatResponse, MemoryCitation
    from app.schemas.memory import MemoryResponse
    from app.services.embedding_service import STOP_WORDS, cosine_similarity, generate_deterministic_embedding
except ImportError:
    from backend.app.core.openai_client import get_openai_client
    from backend.app.schemas.chat import ChatResponse, MemoryCitation
    from backend.app.schemas.memory import MemoryResponse
    from backend.app.services.embedding_service import STOP_WORDS, cosine_similarity, generate_deterministic_embedding

STRICT_GROUNDING_SYSTEM_PROMPT = """You are Shadow, an AI personal memory assistant. Tagline: "Your life, remembered."
Your sole purpose is to help the user recall and navigate facts from their private archive.

CRITICAL ANTI-HALLUCINATION RULES:
1. ONLY answer using facts explicitly documented in the RETRIEVED MEMORIES section below.
2. NEVER guess, assume, or fabricate any names, dates, places, numbers, or details.
3. Every referenced fact must cite its source memory using this format: [Memory #<id>: "<title>"].
4. STRICT ABSENCE RULE: If the answer cannot be found in the provided memories, or if NO relevant memories exist, you MUST reply:
   "I could not find any saved memories or details in your archive regarding this question."
   Do NOT attempt to guess, extrapolate from world knowledge, or give general advice."""


def retrieve_relevant_memories(
    query: str,
    all_memories: List[MemoryResponse],
    threshold: float = 0.35,
    max_k: int = 5
) -> List[Tuple[MemoryResponse, float]]:
    """Hybrid lexical and semantic retrieval with stop-word filtering."""
    query_clean = query.strip().lower()
    query_tokens = [
        t for t in query_clean.replace("?", " ").replace("!", " ").replace(".", " ").split()
        if len(t) > 2 and t not in STOP_WORDS
    ]

    if not query_tokens:
        return []

    query_vec = generate_deterministic_embedding(query)
    scored: List[Tuple[MemoryResponse, float]] = []

    for m in all_memories:
        people_str = " ".join(m.extracted_entities.people)
        places_str = " ".join(m.extracted_entities.places)
        full_text = f"{m.title} {m.description} {m.ai_summary} {' '.join(m.tags)} {people_str} {places_str} {m.location or ''}".lower()

        token_matches = 0
        lexical_score = 0.0

        if query_clean in full_text:
            lexical_score += 0.6
            token_matches += len(query_tokens)
        else:
            for token in query_tokens:
                if token in m.title.lower():
                    token_matches += 1
                    lexical_score += 0.4
                elif any(token in t.lower() for t in m.tags):
                    token_matches += 1
                    lexical_score += 0.35
                elif any(token in p.lower() for p in m.extracted_entities.people):
                    token_matches += 1
                    lexical_score += 0.45
                elif any(token in pl.lower() for pl in m.extracted_entities.places):
                    token_matches += 1
                    lexical_score += 0.4
                elif token in full_text:
                    token_matches += 1
                    lexical_score += 0.2

        mem_vec = generate_deterministic_embedding(full_text)
        semantic_score = cosine_similarity(query_vec, mem_vec)

        combined = min(1.0, max(0.0, lexical_score * 0.6 + semantic_score * 0.4))

        if token_matches > 0 and combined >= threshold:
            scored.append((m, combined))

    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:max_k]


async def answer_rag_query(query: str, all_memories: List[MemoryResponse]) -> ChatResponse:
    """Answers a user memory query strictly grounded with citations."""
    relevant = retrieve_relevant_memories(query, all_memories)

    if not relevant:
        return ChatResponse(
            answer="I could not find any saved memories or details in your archive regarding this question.",
            citations=[],
            is_grounded=True,
            unfound=True
        )

    retrieved_mems = [item[0] for item in relevant]
    citations = [
        MemoryCitation(
            memory_id=m.id,
            title=m.title,
            date=m.memory_date.strftime("%b %d, %Y"),
            snippet=m.ai_summary or m.description[:140]
        )
        for m in retrieved_mems
    ]

    client = get_openai_client()
    if not client:
        # High-fidelity deterministic grounded synthesizer
        top = retrieved_mems[0]
        date_str = top.memory_date.strftime("%B %d, %Y")
        answer = f'According to your memory from {date_str}, [Memory #{top.id}: "{top.title}"]:\n\n"{top.ai_summary or top.description[:220]}"'
        if top.location:
            answer += f"\n\n• Location: {top.location}"
        if top.extracted_entities.people:
            answer += f"\n• People present: {', '.join(top.extracted_entities.people)}"

        if len(retrieved_mems) > 1:
            second = retrieved_mems[1]
            answer += f'\n\nYou also captured a related note in [Memory #{second.id}: "{second.title}"]: "{second.ai_summary or second.description[:160]}"'

        return ChatResponse(
            answer=answer,
            citations=citations,
            is_grounded=True,
            unfound=False
        )

    context_str = "\n\n".join(
        f"--- MEMORY #{m.id} ---\n"
        f"Title: {m.title}\n"
        f"Date: {m.memory_date.isoformat()}\n"
        f"Category: {m.category} | Type: {m.memory_type.value}\n"
        f"Location: {m.location or 'Unspecified'}\n"
        f"People: {', '.join(m.extracted_entities.people) or 'None'}\n"
        f"Tags: {', '.join(m.tags) or 'None'}\n"
        f"Description:\n{m.description}\n"
        f"-------------------------"
        for m in retrieved_mems
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.1,
            messages=[
                {"role": "system", "content": STRICT_GROUNDING_SYSTEM_PROMPT},
                {"role": "user", "content": f"RETRIEVED MEMORIES:\n{context_str}\n\nUSER QUESTION: \"{query}\""}
            ]
        )
        ans = response.choices[0].message.content or "I could not find any saved memories or details in your archive regarding this question."
        is_unfound = "could not find any saved memories" in ans
        return ChatResponse(
            answer=ans,
            citations=[] if is_unfound else citations,
            is_grounded=True,
            unfound=is_unfound
        )
    except Exception as e:
        print(f"RAG query exception: {e}")
        top = retrieved_mems[0]
        return ChatResponse(
            answer=f'According to your memory [Memory #{top.id}: "{top.title}"]: {top.ai_summary or top.description[:160]}',
            citations=citations,
            is_grounded=True,
            unfound=False
        )


async def stream_rag_query(query: str, all_memories: List[MemoryResponse]) -> AsyncGenerator[str, None]:
    """Streams SSE tokens for live typewriter response in frontend."""
    res = await answer_rag_query(query, all_memories)
    import json
    import asyncio

    # Yield citations header event
    citations_data = [c.model_dump() for c in res.citations]
    yield f"data: {json.dumps({'type': 'citations', 'citations': citations_data, 'unfound': res.unfound})}\n\n"

    # Stream text in chunks
    words = res.answer.split(" ")
    for i in range(0, len(words), 3):
        chunk = " ".join(words[i:i+3]) + (" " if i + 3 < len(words) else "")
        yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"
        await asyncio.sleep(0.04)

    yield f"data: {json.dumps({'type': 'done'})}\n\n"
