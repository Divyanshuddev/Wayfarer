from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class QuestionCreate(BaseModel):
    destination: str = Field(..., min_length=2)
    trip_id: Optional[str] = None
    question: str = Field(..., min_length=5)
    category: str = "hotel_price"  # hotel_price, safety, food, transport, itinerary
    author_name: str = "Curious Traveler"


class AnswerCreate(BaseModel):
    answer: str = Field(..., min_length=5)
    author_name: str = "Verified Traveler"
    author_visited: bool = True
    hotel_name: Optional[str] = None
    hotel_price_per_night: Optional[str] = None


class QuestionWithAnswersResponse(BaseModel):
    id: str
    trip_id: Optional[str] = None
    destination: str
    author_name: str
    question: str
    category: str
    created_at: datetime
    answers: List["AnswerResponse"] = Field(default_factory=list)


class AnswerResponse(BaseModel):
    id: str
    question_id: str
    author_name: str
    author_visited: bool
    answer: str
    hotel_name: Optional[str] = None
    hotel_price_per_night: Optional[str] = None
    helpful_votes: int = 0
    created_at: datetime


class AITravelAdviceRequest(BaseModel):
    destination: str
    query: str
    budget: Optional[str] = None


class AITravelAdviceResponse(BaseModel):
    destination: str
    answer: str
    estimated_hotel_price: str
    pros: List[str]
    cons: List[str]
    best_time: str
    safety_rating: str
