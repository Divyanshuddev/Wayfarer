import json
import re
from datetime import datetime
from typing import List, Optional
from app.core.openai_client import get_openai_client
from app.schemas.memory import ExtractedEntities, MemoryCategory, MemorySentiment


def extract_entities_heuristic(text: str) -> ExtractedEntities:
    """Fast, local rule-based NLP extraction when OpenAI is not configured."""
    cleaned = text.strip()
    lines = [line.strip() for line in cleaned.split("\n") if line.strip()]
    first_line = lines[0] if lines else "Untitled Memory"
    title = first_line[:65] + "..." if len(first_line) > 65 else first_line

    lower = cleaned.lower()

    # Category classification
    category = MemoryCategory.THOUGHT
    if any(k in lower for k in ["dr.", "spoke with", "talked to", "said", "meeting", "dinner with", "chat with"]):
        category = MemoryCategory.CONVERSATION
    elif any(k in lower for k in ["read", "book", "quote", "chapter", "author", "article", "paper"]):
        category = MemoryCategory.READING
    elif any(k in lower for k in ["visited", "flight", "trip", "hotel", "ran", "walked", "temple", "concert", "museum"]):
        category = MemoryCategory.EVENT
    elif any(k in lower for k in ["project", "strategy", "roadmap", "deploy", "architecture", "client", "code"]):
        category = MemoryCategory.WORK
    elif any(k in lower for k in ["idea", "concept", "what if", "invention", "hypothesis"]):
        category = MemoryCategory.IDEA
    elif any(k in lower for k in ["watched", "movie", "film", "podcast", "album", "song", "episode"]):
        category = MemoryCategory.MEDIA
    elif any(k in lower for k in ["kyoto", "san francisco", "berlin", "paris", "tokyo", "cafe", "roastery"]):
        category = MemoryCategory.LOCATION

    # Sentiment classification
    positive_words = ["great", "wonderful", "mastery", "silence", "delight", "love", "clarity", "vibrant", "strong", "clean", "beautiful"]
    reflective_words = ["ponder", "stillness", "entropy", "virtue", "meaning", "memory", "philosoph", "insight", "heian", "quiet", "negative space"]
    negative_words = ["failed", "stress", "broken", "exhausted", "pain", "sad", "disaster", "urgent", "frustrated"]

    pos_score = sum(1 for w in positive_words if w in lower)
    ref_score = sum(1 for w in reflective_words if w in lower)
    neg_score = sum(1 for w in negative_words if w in lower)

    sentiment = MemorySentiment.NEUTRAL
    if ref_score >= 2 or (ref_score > pos_score and ref_score > neg_score):
        sentiment = MemorySentiment.REFLECTIVE
    elif pos_score > neg_score and pos_score > 0:
        sentiment = MemorySentiment.POSITIVE
    elif neg_score > pos_score:
        sentiment = MemorySentiment.NEGATIVE

    # Tag extraction
    tags = set(re.findall(r"#([a-zA-Z0-9_-]+)", cleaned))
    potential_tags = [
        "ai", "tech", "design", "travel", "coffee", "books", "minimalism",
        "architecture", "fitness", "running", "science", "kyoto", "japan",
        "san-francisco", "philosophy", "espresso", "biology", "systems"
    ]
    for pt in potential_tags:
        if pt in lower:
            tags.add(pt)

    # People mentioned
    people = set()
    matches = re.findall(r"(?:with|and|Dr\.|meeting)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)", cleaned)
    for m in matches:
        if m not in ["The", "A", "An", "He", "She", "It", "My", "Our"]:
            people.add(m)

    # Detected reminders
    detected_reminders = []
    if "birthday" in lower:
        detected_reminders.append({
            "title": f"Birthday mentioned in: {title}",
            "due_date": datetime.utcnow().isoformat(),
            "reminder_type": "birthday"
        })
    elif any(k in lower for k in ["remember to", "need to", "follow up", "deadline", "by friday", "by next"]):
        detected_reminders.append({
            "title": f"Follow-up: {title}",
            "due_date": datetime.utcnow().isoformat(),
            "reminder_type": "follow_up"
        })

    summary = " ".join(lines[:2])[:160] + ("..." if len(cleaned) > 160 else "")

    return ExtractedEntities(
        title=title,
        summary=summary,
        category=category,
        sentiment=sentiment,
        tags=list(tags)[:6],
        people=list(people)[:5],
        location=None,
        memory_date=None,
        detected_reminders=detected_reminders
    )


async def organize_memory_content(text: str) -> ExtractedEntities:
    """Uses GPT-4o-mini structured JSON outputs or heuristic fallback."""
    client = get_openai_client()
    if not client:
        return extract_entities_heuristic(text)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.1,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": """You are Shadow's cognitive memory organization engine.
Extract structured metadata strictly according to this JSON schema:
{
  "title": "Concise evocative title (max 60 chars)",
  "summary": "1-2 sentence core distillation (max 180 chars)",
  "category": "thought" | "event" | "conversation" | "media" | "reading" | "work" | "personal" | "location" | "idea",
  "sentiment": "positive" | "neutral" | "negative" | "reflective",
  "tags": ["lowercase-kebab-tag", ...],
  "people": ["Full Name", ...],
  "location": "Location name or null",
  "memory_date": "ISO date string if mentioned, else null",
  "detected_reminders": [{"title": "...", "due_date": "...", "reminder_type": "birthday"|"anniversary"|"follow_up"|"custom"}]
}"""
                },
                {"role": "user", "content": text}
            ]
        )
        data = json.loads(response.choices[0].message.content or "{}")
        return ExtractedEntities(
            title=data.get("title", text[:50]),
            summary=data.get("summary", text[:150]),
            category=data.get("category", MemoryCategory.THOUGHT),
            sentiment=data.get("sentiment", MemorySentiment.NEUTRAL),
            tags=data.get("tags", []),
            people=data.get("people", []),
            location=data.get("location"),
            memory_date=data.get("memory_date"),
            detected_reminders=data.get("detected_reminders", [])
        )
    except Exception as e:
        print(f"OpenAI organizer error: {e}")
        return extract_entities_heuristic(text)
