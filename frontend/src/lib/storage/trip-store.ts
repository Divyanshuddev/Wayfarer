import { Trip, TripAnswer, TripQuestion } from "@/types/trip";

const STORAGE_KEYS = {
  TRIPS: "wayfarer_trips_v3",
  QUESTIONS: "wayfarer_questions_v3",
  USER: "wayfarer_user_v3",
};

// First authentic trip with 5 high-resolution photos, real pros/cons, and hotel rates
export const INITIAL_TRIPS: Trip[] = [
  {
    id: "trip-01",
    user_id: "usr-traveler-1",
    author_name: "Aria Montgomery",
    author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    title: "Kyoto in Autumn: Golden Temples, Bamboo Groves & Traditional Ryokans",
    destination: "Kyoto",
    country: "Japan",
    travel_dates: "Oct 14 - Oct 21, 2024",
    duration_days: 7,
    travel_style: "Couple",
    budget_total: "$1,450",
    hotel_price_range: "$75 - $140 / night",
    summary: "A breathtaking 7-day journey exploring Gion geisha districts, Arashiyama bamboo forests, and morning matcha ceremonies. We stayed in an authentic wooden machiya and sampled Michelin-rated ramen.",
    itinerary: "Day 1: Arrival & evening walk through Pontocho Alley.\nDay 2: Fushimi Inari gates at 6:30 AM before crowds.\nDay 3: Arashiyama bamboo grove & Tenryu-ji.\nDay 4: Day trip to Nara deer park.\nDay 5: Gion tea ceremony & Kiyomizu-dera sunset.\nDay 6: Nishiki Market food tour.\nDay 7: Zen meditation at Ryoan-ji & departure.",
    pros: [
      "Extremely safe, spotless, and easy to navigate via bus & metro",
      "Incredible culinary scene ranging from $8 street soba to multi-course Kaiseki",
      "Serene zen gardens that feel truly magical early in the morning",
      "Locals are remarkably polite and welcoming to travelers",
    ],
    cons: [
      "Arashiyama and Kiyomizu-dera get intensely crowded between 11 AM and 4 PM",
      "Traditional ryokans book out 3-4 months in advance",
      "Many authentic cafes are cash-only (7-Eleven ATMs are a lifesaver)",
      "Lots of walking uphill and cobblestone steps—bring good sneakers",
    ],
    best_time_to_visit: "Mid-October to late November for maple leaves, or late March for cherry blossoms.",
    local_food_recommendations: [
      "Honke Owariya (550-year-old soba restaurant)",
      "Gion Duck Noodles (hidden alleyway broth)",
      "Nishiki Market grilled dango & wagyu skewers",
    ],
    hotel_recommendations: [
      "Ryokan Yamazaki ($95/night, authentic tatami & garden)",
      "The Pocket Hotel Kyoto Shijo ($55/night, clean modern pod style)",
      "Sowaka Gion ($220/night, luxury restored villa)",
    ],
    images: [
      { id: "img-1", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80", caption: "Golden Pavilion (Kinkaku-ji) reflection", place_type: "spot" },
      { id: "img-2", url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80", caption: "Traditional Gion wooden street at dusk", place_type: "spot" },
      { id: "img-3", url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop&q=80", caption: "Arashiyama bamboo groves", place_type: "scenery" },
      { id: "img-4", url: "https://images.unsplash.com/photo-1578637387939-43c525550085?w=800&auto=format&fit=crop&q=80", caption: "Matcha & wagashi dessert in Arashiyama", place_type: "food" },
      { id: "img-5", url: "https://images.unsplash.com/photo-1478436127897-769e00d0c715?w=800&auto=format&fit=crop&q=80", caption: "Fushimi Inari vermillion torii gates at sunrise", place_type: "spot" },
    ],
    cover_image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80",
    likes_count: 142,
    questions_count: 1,
    created_at: "2024-10-24T12:00:00Z",
  },
];

export const INITIAL_QUESTIONS: TripQuestion[] = [
  {
    id: "q-01",
    trip_id: "trip-01",
    destination: "Kyoto",
    author_name: "Sarah Jenkins",
    question: "What is the realistic price for a nice hotel or ryokan for a couple in Kyoto during November?",
    category: "hotel_price",
    created_at: "2024-10-26T11:00:00Z",
    answers: [
      {
        id: "ans-01",
        question_id: "q-01",
        author_name: "Aria Montgomery (Visited Oct 2024)",
        author_visited: true,
        answer: "Expect to pay around $85 - $130/night for a clean, boutique Japanese hotel near Shijo/Karasuma station. If you want an authentic ryokan with dinner included, plan for $200 - $320/night. Book at least 2 months ahead because November is peak autumn foliage!",
        hotel_name: "Ryokan Yamazaki or Pocket Hotel Shijo",
        hotel_price_per_night: "$95 / night",
        helpful_votes: 34,
        created_at: "2024-10-26T13:15:00Z",
      },
    ],
  },
];

class TripStore {
  private trips: Trip[] = [];
  private questions: TripQuestion[] = [];
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    } else {
      this.trips = [...INITIAL_TRIPS];
      this.questions = [...INITIAL_QUESTIONS];
    }
  }

  private init() {
    if (this.initialized) return;
    try {
      const storedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
      const storedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      this.trips = storedTrips && JSON.parse(storedTrips).length > 0 ? JSON.parse(storedTrips) : [...INITIAL_TRIPS];
      this.questions = storedQuestions && JSON.parse(storedQuestions).length > 0 ? JSON.parse(storedQuestions) : [...INITIAL_QUESTIONS];
    } catch {
      this.trips = [...INITIAL_TRIPS];
      this.questions = [...INITIAL_QUESTIONS];
    }
    this.initialized = true;
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(this.trips));
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(this.questions));
    } catch (e) {
      console.warn("Storage save failed:", e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- TRIPS CRUD ---
  public getTrips(destination?: string, style?: string, query?: string): Trip[] {
    let result = [...this.trips];
    if (destination && destination !== "all") {
      const d = destination.toLowerCase();
      result = result.filter(
        (t) => t.destination.toLowerCase().includes(d) || t.country.toLowerCase().includes(d)
      );
    }
    if (style && style !== "all") {
      result = result.filter((t) => t.travel_style.toLowerCase() === style.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q) ||
          t.country.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.pros.some((p) => p.toLowerCase().includes(q)) ||
          t.cons.some((c) => c.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getTrip(id: string): Trip | undefined {
    return this.trips.find((t) => t.id === id);
  }

  public addTrip(data: Omit<Trip, "id" | "likes_count" | "questions_count" | "created_at">): Trip {
    const id = `trip-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newTrip: Trip = {
      ...data,
      id,
      likes_count: 1,
      questions_count: 0,
      created_at: new Date().toISOString(),
    };
    this.trips.unshift(newTrip);
    this.save();
    return newTrip;
  }

  public likeTrip(id: string): boolean {
    const trip = this.getTrip(id);
    if (trip) {
      trip.likes_count += 1;
      this.save();
      return true;
    }
    return false;
  }

  // --- QUESTIONS & ANSWERS CRUD ---
  public getQuestions(destination?: string, tripId?: string): TripQuestion[] {
    let list = [...this.questions];
    if (tripId) {
      list = list.filter((q) => q.trip_id === tripId);
    } else if (destination && destination !== "all") {
      const d = destination.toLowerCase();
      list = list.filter((q) => q.destination.toLowerCase().includes(d));
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addQuestion(question: {
    destination: string;
    trip_id?: string | null;
    question: string;
    category?: TripQuestion["category"];
    author_name?: string;
  }): TripQuestion {
    const id = `q-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newQ: TripQuestion = {
      id,
      trip_id: question.trip_id || null,
      destination: question.destination,
      author_name: question.author_name || "Curious Traveler",
      question: question.question,
      category: question.category || "hotel_price",
      created_at: new Date().toISOString(),
      answers: [],
    };
    this.questions.unshift(newQ);

    if (question.trip_id) {
      const trip = this.getTrip(question.trip_id);
      if (trip) trip.questions_count += 1;
    }

    this.save();
    return newQ;
  }

  public addAnswer(
    questionId: string,
    answer: {
      author_name?: string;
      author_visited?: boolean;
      answer: string;
      hotel_name?: string | null;
      hotel_price_per_night?: string | null;
    }
  ): TripAnswer | null {
    const q = this.questions.find((item) => item.id === questionId);
    if (!q) return null;

    const ansId = `ans-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newAns: TripAnswer = {
      id: ansId,
      question_id: questionId,
      author_name: answer.author_name || "Fellow Traveler",
      author_visited: answer.author_visited ?? true,
      answer: answer.answer,
      hotel_name: answer.hotel_name || null,
      hotel_price_per_night: answer.hotel_price_per_night || null,
      helpful_votes: 1,
      created_at: new Date().toISOString(),
    };
    q.answers.push(newAns);
    this.save();
    return newAns;
  }

  public voteAnswer(questionId: string, answerId: string): boolean {
    const q = this.questions.find((item) => item.id === questionId);
    if (!q) return false;
    const ans = q.answers.find((a) => a.id === answerId);
    if (ans) {
      ans.helpful_votes += 1;
      this.save();
      return true;
    }
    return false;
  }
}

export const tripStore = new TripStore();
