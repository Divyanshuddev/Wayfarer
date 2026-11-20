from fastapi import APIRouter
from app.core.database import trip_db

router = APIRouter()


@router.get("")
async def get_travel_dashboard():
    """Aggregated travel stats, trending destinations, and active traveler discussions."""
    trips = trip_db.get_all_trips()
    questions = trip_db.get_questions()

    destinations = {}
    for t in trips:
        if t.destination not in destinations:
            destinations[t.destination] = {
                "destination": t.destination,
                "country": t.country,
                "trips_count": 0,
                "hotel_price_range": t.hotel_price_range,
                "cover_image": t.cover_image,
                "avg_budget": t.budget_total,
            }
        destinations[t.destination]["trips_count"] += 1

    total_answers = sum(len(q.answers) for q in questions)

    return {
        "stats": {
            "total_trips": len(trips),
            "total_destinations": len(destinations),
            "total_questions": len(questions),
            "total_answers": total_answers,
            "community_rating": "4.9 / 5.0",
        },
        "trending_destinations": list(destinations.values())[:6],
        "featured_trips": trips[:4],
        "recent_questions": questions[:4],
    }
