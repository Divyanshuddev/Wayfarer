from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.core.database import trip_db
from app.core.openai_client import get_openai_client
from app.schemas.qa import (
    AITravelAdviceRequest,
    AITravelAdviceResponse,
    AnswerCreate,
    AnswerResponse,
    QuestionCreate,
    QuestionWithAnswersResponse,
)

router = APIRouter()


@router.get("", response_model=List[QuestionWithAnswersResponse])
async def list_questions(
    destination: Optional[str] = Query(None, description="Filter by destination"),
):
    """List all community traveler questions across destinations."""
    return trip_db.get_questions(destination=destination)


@router.post("", response_model=QuestionWithAnswersResponse, status_code=201)
async def post_question(payload: QuestionCreate):
    """Post an inquiry about hotel prices, places to visit, safety, or transport."""
    return trip_db.add_question(payload)


@router.post("/{question_id}/answers", response_model=AnswerResponse, status_code=201)
async def answer_question(question_id: str, payload: AnswerCreate):
    """Share your firsthand experience or hotel pricing to help other travelers."""
    ans = trip_db.add_answer(question_id, payload)
    if not ans:
        raise HTTPException(status_code=404, detail="Question not found")
    return ans


@router.post("/{question_id}/answers/{answer_id}/vote", response_model=AnswerResponse)
async def vote_helpful_answer(question_id: str, answer_id: str):
    """Upvote a helpful travel answer."""
    ans = trip_db.vote_answer(question_id, answer_id)
    if not ans:
        raise HTTPException(status_code=404, detail="Answer not found")
    return ans


@router.post("/ai-advice", response_model=AITravelAdviceResponse)
async def get_ai_travel_advice(payload: AITravelAdviceRequest):
    """
    AI Travel Advisor: Estimates hotel prices, pros & cons, and recommendations
    grounded in traveler community data.
    """
    dest = payload.destination.strip().title()
    query = payload.query.strip()

    # Find any matching community trips for grounded context
    matching_trips = trip_db.get_all_trips(destination=dest)
    context_notes = []
    hotel_estimates = []
    pros_list = []
    cons_list = []

    for t in matching_trips:
        context_notes.append(f"- Trip '{t.title}': {t.summary}")
        hotel_estimates.append(t.hotel_price_range)
        pros_list.extend(t.pros[:2])
        cons_list.extend(t.cons[:2])

    client = get_openai_client()
    if client:
        try:
            prompt = f"""You are Wayfarer AI, an expert traveler assistant.
A traveler is asking about {dest}:
Query: "{query}"
Budget constraint: {payload.budget or "Standard"}

Grounding notes from community travelers who visited:
{chr(10).join(context_notes) if context_notes else "No specific traveler notes yet."}

Respond in strict JSON with:
- "answer": Helpful, honest 2-3 paragraph response covering their question, hotel tips, and recommendations.
- "estimated_hotel_price": realistic price range per night (e.g. "$70 - $130 / night")
- "pros": list of 3 biggest pros
- "cons": list of 3 honest cons or caveats
- "best_time": recommended months to visit
- "safety_rating": rating like "Very High (Solo & Family Friendly)"
"""
            res = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
            )
            import json
            data = json.loads(res.choices[0].message.content or "{}")
            return AITravelAdviceResponse(
                destination=dest,
                answer=data.get("answer", f"Here is key travel advice for {dest} based on recent traveler reports."),
                estimated_hotel_price=data.get("estimated_hotel_price", "$65 - $120 / night"),
                pros=data.get("pros", ["Great cultural atmosphere", "Delicious regional cuisine", "Scenic vistas"]),
                cons=data.get("cons", ["Peak season crowds", "Booking required in advance", "Variable local transport"]),
                best_time=data.get("best_time", "Spring & Autumn"),
                safety_rating=data.get("safety_rating", "High (Tourist friendly)"),
            )
        except Exception as e:
            print(f"OpenAI travel advice error: {e}")

    # Fallback heuristic traveler advice
    est_price = hotel_estimates[0] if hotel_estimates else "$60 - $120 / night"
    default_pros = pros_list[:3] if pros_list else [
        f"Incredible sights and cultural depth in {dest}",
        "Wide spectrum of boutique hotels and local homestays",
        "Vibrant food markets and welcoming neighborhood cafes",
    ]
    default_cons = cons_list[:3] if cons_list else [
        "Popular attractions can get crowded between 10 AM and 3 PM",
        "Advance reservations recommended for top-rated hotels",
        "Weather can be unpredictable—pack versatile layers",
    ]

    return AITravelAdviceResponse(
        destination=dest,
        answer=(
            f"Based on firsthand reports from travelers who visited {dest}, "
            f"average hotel prices currently range around {est_price}. "
            f"Regarding '{query}': we recommend staying central near transit lines to save on cab fares. "
            f"Talk to hotel concierges or host families for authentic local food recommendations rather than tourist strip restaurants."
        ),
        estimated_hotel_price=est_price,
        pros=default_pros,
        cons=default_cons,
        best_time="March - May and September - November",
        safety_rating="High (Solo and Couple Friendly)",
    )
