import json
import re
from datetime import datetime
from typing import List, Optional
try:
    from app.core.openai_client import get_openai_client
    from app.schemas.memory import AIExtractionOutput, ExtractedEntities, MemoryCategory
except ImportError:
    from backend.app.core.openai_client import get_openai_client
    from backend.app.schemas.memory import AIExtractionOutput, ExtractedEntities, MemoryCategory


def extract_entities_heuristic(text: str) -> AIExtractionOutput:
    """Fast, local rule-based NLP extraction when OpenAI is not configured."""
    cleaned = text.strip()
    lines = [line.strip() for line in cleaned.split("\n") if line.strip()]
    first_line = lines[0] if lines else "Untitled Memory"
    title = first_line[:65] + "..." if len(first_line) > 65 else first_line

    lower = cleaned.lower()

    # Category classification based on the 8 exact categories
    category = "Ideas & Projects"
    if any(k in lower for k in ["talked to", "said", "meeting", "spoke with", "interview", "discussion", "dialogue"]):
        category = "Conversations"
    elif any(k in lower for k in ["kyoto", "flight", "trip", "hotel", "travel", "japan", "berlin", "paris", "visit"]):
        category = "Places & Travel"
    elif any(k in lower for k in ["receipt", "invoice", "tax", "contract", "pdf", "agreement", "lease", "warranty"]):
        category = "Documents & Receipts"
    elif any(k in lower for k in ["watched", "movie", "film", "podcast", "book", "read", "album", "music", "recommend"]):
        category = "Media & Recommendations"
    elif any(k in lower for k in ["run", "workout", "gym", "health", "doctor", "sleep", "diet", "prescription", "heart rate"]):
        category = "Health & Wellness"
    elif any(k in lower for k in ["birthday", "anniversary", "graduat", "wedding", "born", "promot", "milestone"]):
        category = "Life Milestones"
    elif any(k in lower for k in ["friend", "dinner", "party", "family", "moment", "alex", "maya", "rahul"]):
        category = "People & Experiences"

    # Tag extraction
    tags = set(re.findall(r"#([a-zA-Z0-9_-]+)", cleaned))
    potential_tags = [
        "ai", "tech", "design", "travel", "coffee", "books", "minimalism",
        "architecture", "fitness", "running", "science", "kyoto", "japan",
        "san-francisco", "philosophy", "espresso", "biology", "systems", "startup"
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

    # Places mentioned
    places = set()
    place_candidates = ["Kyoto", "San Francisco", "Zurich", "Berlin", "Tokyo", "Munich", "Pacific Heights", "Hayes Valley"]
    for pc in place_candidates:
        if pc.lower() in lower:
            places.add(pc)

    # Detected reminders
    detected_reminders = []
    if "birthday" in lower:
        detected_reminders.append({
            "title": f"Birthday mentioned in: {title}",
            "remind_at": datetime.utcnow().isoformat(),
            "reminder_type": "birthday"
        })
    elif any(k in lower for k in ["remember to", "need to", "follow up", "deadline", "by friday", "by next"]):
        detected_reminders.append({
            "title": f"Follow-up: {title}",
            "remind_at": datetime.utcnow().isoformat(),
            "reminder_type": "follow_up"
        })

    ai_summary = " ".join(lines[:2])[:160] + ("..." if len(cleaned) > 160 else "")

    entities = ExtractedEntities(
        people=list(people)[:5],
        places=list(places)[:3],
        dates=[],
        topics=list(tags)[:5],
        details=[line[:80] for line in lines[1:3]]
    )

    return AIExtractionOutput(
        title=title,
        ai_summary=ai_summary,
        category=category,
        tags=list(tags)[:6],
        extracted_entities=entities,
        detected_reminders=detected_reminders,
    )


async def organize_memory_content(text: str) -> AIExtractionOutput:
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
  "ai_summary": "1-2 sentence core distillation (max 180 chars)",
  "category": "People & Experiences" | "Ideas & Projects" | "Places & Travel" | "Documents & Receipts" | "Media & Recommendations" | "Health & Wellness" | "Conversations" | "Life Milestones",
  "tags": ["lowercase-kebab-tag", ...],
  "extracted_entities": {
    "people": ["Full Name", ...],
    "places": ["Location/City", ...],
    "dates": ["Date references", ...],
    "topics": ["Key theme", ...],
    "details": ["Specific nuance or data point", ...]
  },
  "detected_reminders": [{"title": "...", "remind_at": "...", "reminder_type": "birthday"|"anniversary"|"follow_up"|"event"|"custom"}]
}"""
                },
                {"role": "user", "content": text}
            ]
        )
        data = json.loads(response.choices[0].message.content or "{}")
        raw_ent = data.get("extracted_entities", {})
        entities = ExtractedEntities(
            people=raw_ent.get("people", []),
            places=raw_ent.get("places", []),
            dates=raw_ent.get("dates", []),
            topics=raw_ent.get("topics", []),
            details=raw_ent.get("details", []),
        )
        return AIExtractionOutput(
            title=data.get("title", text[:50]),
            ai_summary=data.get("ai_summary", text[:150]),
            category=data.get("category", "Ideas & Projects"),
            tags=data.get("tags", []),
            extracted_entities=entities,
            detected_reminders=data.get("detected_reminders", []),
        )
    except Exception as e:
        print(f"OpenAI organizer error: {e}")
        return extract_entities_heuristic(text)
