export interface TripImage {
  id: string;
  url: string;
  caption?: string;
  place_type?: "hotel" | "food" | "spot" | "scenery" | "activity";
}

export interface TripQuestion {
  id: string;
  trip_id?: string | null;
  destination: string;
  author_name: string;
  question: string;
  category: "hotel_price" | "safety" | "food" | "transport" | "itinerary";
  created_at: string;
  answers: TripAnswer[];
}

export interface TripAnswer {
  id: string;
  question_id: string;
  author_name: string;
  author_visited: boolean;
  answer: string;
  hotel_name?: string | null;
  hotel_price_per_night?: string | null;
  helpful_votes: number;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  title: string;
  destination: string;
  country: string;
  travel_dates: string;
  duration_days: number;
  travel_style: "Solo" | "Couple" | "Family" | "Backpacking" | "Luxury" | "Friends";
  budget_total: string;
  hotel_price_range: string;
  summary: string;
  itinerary?: string;
  pros: string[];
  cons: string[];
  best_time_to_visit?: string;
  local_food_recommendations: string[];
  hotel_recommendations: string[];
  images: TripImage[];
  cover_image: string;
  likes_count: number;
  questions_count: number;
  created_at: string;
}

export interface AITravelAdvice {
  destination: string;
  answer: string;
  estimated_hotel_price: string;
  pros: string[];
  cons: string[];
  best_time: string;
  safety_rating: string;
}
