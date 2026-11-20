import random
from fastapi import APIRouter, Depends
from app.core.database import db_store
from app.core.security import AuthUser, get_current_user

router = APIRouter()


@router.get("")
async def get_dashboard(current_user: AuthUser = Depends(get_current_user)):
    memories = db_store.get_all_memories(current_user.id)
    reminders = db_store.get_reminders(current_user.id)

    total = len(memories)
    favorites = sum(1 for m in memories if m.is_favorite)
    pinned = sum(1 for m in memories if m.is_pinned)
    with_attachments = sum(1 for m in memories if m.attachments)

    category_counts = {}
    sentiment_counts = {}
    for m in memories:
        category_counts[m.category.value] = category_counts.get(m.category.value, 0) + 1
        sentiment_counts[m.sentiment.value] = sentiment_counts.get(m.sentiment.value, 0) + 1

    # Rediscover highlight
    rediscover = None
    if memories:
        pool = [m for m in memories if m.sentiment.value == "reflective" or m.is_favorite] or memories
        mem = random.choice(pool)
        prompts = [
            "How has your perspective on this moment evolved since you captured it?",
            "Does this insight still hold true for you today, or has experience reshaped it?",
            "What was the quietest feeling in the room when this happened?",
            "If you could revisit this conversation or place today, what would you notice first?",
        ]
        rediscover = {
            "memory": mem,
            "reflection_prompt": random.choice(prompts)
        }

    return {
        "stats": {
            "total_memories": total,
            "favorites": favorites,
            "pinned": pinned,
            "with_attachments": with_attachments,
            "grounding_score": 100,
            "category_counts": category_counts,
            "sentiment_counts": sentiment_counts,
        },
        "rediscover": rediscover,
        "recent_memories": memories[:4],
        "upcoming_reminders": reminders[:4]
    }
