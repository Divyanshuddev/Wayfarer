from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class TripImage(BaseModel):
    id: str
    url: str
    caption: Optional[str] = None
    place_type: str = "scenery"  # hotel, food, spot, scenery, activity


class TripQuestion(BaseModel):
    id: str
    trip_id: Optional[str] = None
    destination: str
    author_name: str
    question: str
    category: str = "hotel_price"  # hotel_price, safety, food, transport, itinerary
    created_at: datetime = Field(default_factory=datetime.utcnow)
    answers_count: int = 0


class TripAnswer(BaseModel):
    id: str
    question_id: str
    author_name: str
    author_visited: bool = True
    answer: str
    hotel_name: Optional[str] = None
    hotel_price_per_night: Optional[str] = None
    helpful_votes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TripCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    destination: str = Field(..., min_length=2, max_length=100)
    country: str = Field(..., min_length=2, max_length=100)
    travel_dates: str
    duration_days: int = Field(default=3, ge=1, le=90)
    travel_style: str = "Couple"  # Solo, Couple, Family, Backpacking, Luxury, Friends
    budget_total: str = "$800"
    hotel_price_range: str = "$60 - $120 / night"
    summary: str = Field(..., min_length=10)
    itinerary: Optional[str] = None
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    best_time_to_visit: Optional[str] = None
    local_food_recommendations: List[str] = Field(default_factory=list)
    hotel_recommendations: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    cover_image: Optional[str] = None


class TripResponse(BaseModel):
    id: str
    user_id: str
    author_name: str
    author_avatar: Optional[str] = None
    title: str
    destination: str
    country: str
    travel_dates: str
    duration_days: int
    travel_style: str
    budget_total: str
    hotel_price_range: str
    summary: str
    itinerary: Optional[str] = None
    pros: List[str]
    cons: List[str]
    best_time_to_visit: Optional[str] = None
    local_food_recommendations: List[str] = Field(default_factory=list)
    hotel_recommendations: List[str] = Field(default_factory=list)
    images: List[TripImage] = Field(default_factory=list)
    cover_image: str
    likes_count: int = 0
    questions_count: int = 0
    created_at: datetime
