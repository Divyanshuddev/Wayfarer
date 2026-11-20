from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.core.database import trip_db
from app.schemas.trip import TripCreate, TripResponse
from app.schemas.qa import QuestionCreate, QuestionWithAnswersResponse

router = APIRouter()


@router.get("", response_model=List[TripResponse])
async def list_trips(
    destination: Optional[str] = Query(None, description="Filter by destination or country"),
    style: Optional[str] = Query(None, description="Filter by travel style (Solo, Couple, Family, etc.)"),
    query: Optional[str] = Query(None, description="Search keyword across title, pros, cons, and summary"),
):
    """Retrieve community trips with search and category filters."""
    return trip_db.get_all_trips(destination=destination, style=style, query=query)


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str):
    """Get complete details, photo gallery, pros & cons, and recommendations for a trip."""
    trip = trip_db.get_trip_by_id(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found in community database")
    return trip


@router.post("", response_model=TripResponse, status_code=201)
async def create_trip(payload: TripCreate):
    """Post a new trip with pros, cons, hotel price range, and photos."""
    return trip_db.create_trip(payload)


@router.post("/{trip_id}/like", response_model=TripResponse)
async def like_trip(trip_id: str):
    """Upvote/like a helpful travel post."""
    trip = trip_db.like_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.get("/{trip_id}/questions", response_model=List[QuestionWithAnswersResponse])
async def get_trip_questions(trip_id: str):
    """Get all traveler Q&A related to this trip and destination."""
    return trip_db.get_questions(trip_id=trip_id)


@router.post("/{trip_id}/questions", response_model=QuestionWithAnswersResponse, status_code=201)
async def ask_trip_question(trip_id: str, payload: QuestionCreate):
    """Ask a question about this trip (e.g. hotel prices, food, safety, transport)."""
    payload.trip_id = trip_id
    return trip_db.add_question(payload)
