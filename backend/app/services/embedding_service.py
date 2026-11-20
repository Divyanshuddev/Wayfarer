import math
import re
from typing import List
import numpy as np
import uuid
try:
    from app.core.openai_client import get_openai_client
    from app.schemas.memory import MemoryConnection, MemoryResponse
except ImportError:
    from backend.app.core.openai_client import get_openai_client
    from backend.app.schemas.memory import MemoryConnection, MemoryResponse

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had",
    "has", "have", "having", "he", "her", "here", "him", "his", "how", "i", "if", "in", "into", "is",
    "it", "its", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
    "only", "or", "other", "our", "ours", "out", "over", "own", "same", "she", "should", "so", "some",
    "such", "than", "that", "the", "their", "theirs", "them", "then", "there", "these", "they", "this",
    "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what",
    "when", "where", "which", "while", "who", "whom", "why", "with", "you", "your", "yours"
}


def generate_deterministic_embedding(text: str, dims: int = 1536) -> List[float]:
    """
    Generates a deterministic 1536-dimensional semantic projection vector.
    Used for local / offline operation when OpenAI API keys are not supplied.
    """
    words = [
        w for w in re.sub(r"[^a-z0-9 ]", " ", text.lower()).split()
        if len(w) > 2 and w not in STOP_WORDS
    ]

    vector = np.zeros(dims, dtype=np.float32)
    for i, word in enumerate(words):
        h = hash(word)
        bucket = abs(h) % dims
        sign = 1.0 if (h % 2 == 0) else -1.0
        weight = 1.0 / (1.0 + math.log1p(i + 1))
        vector[bucket] += sign * weight

        # Spread harmonics across neighboring dimensions
        vector[(bucket * 31) % dims] += sign * 0.3 * weight

    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
    return [round(float(v), 6) for v in vector]


async def create_embedding(text: str) -> List[float]:
    """Generates 1536-dim embedding via text-embedding-3-small or deterministic fallback."""
    client = get_openai_client()
    if client:
        try:
            resp = await client.embeddings.create(
                model="text-embedding-3-small",
                input=text[:8000],
                encoding_format="float"
            )
            return resp.data[0].embedding
        except Exception as e:
            print(f"OpenAI embedding error: {e}")

    return generate_deterministic_embedding(text)


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def discover_memory_links(new_mem: MemoryResponse, existing_mems: List[MemoryResponse]) -> List[MemoryConnection]:
    """
    Auto-discovers bidirectional knowledge graph connections between the new memory and existing memories
    based on shared people, topics, and thematic alignment.
    """
    connections: List[MemoryConnection] = []

    for m in existing_mems:
        if m.id == new_mem.id:
            continue

        new_people = new_mem.extracted_entities.people
        m_people = m.extracted_entities.people
        shared_people = [p for p in new_people if p in m_people]
        shared_tags = [t for t in new_mem.tags if t in m.tags]

        if shared_people:
            connections.append(
                MemoryConnection(
                    id=f"conn-{uuid.uuid4().hex[:8]}",
                    source_memory_id=new_mem.id,
                    target_memory_id=m.id,
                    similarity_score=0.92,
                    connection_reason=f"Shared presence of {', '.join(shared_people)}",
                    target_memory_title=m.title
                )
            )
        elif len(shared_tags) >= 2:
            connections.append(
                MemoryConnection(
                    id=f"conn-{uuid.uuid4().hex[:8]}",
                    source_memory_id=new_mem.id,
                    target_memory_id=m.id,
                    similarity_score=0.85,
                    connection_reason=f"Thematic convergence on tags: {', '.join(shared_tags)}",
                    target_memory_title=m.title
                )
            )
        elif new_mem.category == m.category and shared_tags:
            connections.append(
                MemoryConnection(
                    id=f"conn-{uuid.uuid4().hex[:8]}",
                    source_memory_id=new_mem.id,
                    target_memory_id=m.id,
                    similarity_score=0.78,
                    connection_reason=f"Related intellectual inquiry in {new_mem.category} (#{shared_tags[0]})",
                    target_memory_title=m.title
                )
            )

    return connections
