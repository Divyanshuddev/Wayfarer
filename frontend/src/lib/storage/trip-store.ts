import { Trip, TripAnswer, TripQuestion } from "@/types/trip";

const STORAGE_KEYS = {
  TRIPS: "wayfarer_trips_v2",
  QUESTIONS: "wayfarer_questions_v2",
  USER: "wayfarer_user_v2",
};

// Start with 0 dummy records - completely driven by real user posts!
export const INITIAL_TRIPS: Trip[] = [];
export const INITIAL_QUESTIONS: TripQuestion[] = [];

class TripStore {
  private trips: Trip[] = [];
  private questions: TripQuestion[] = [];
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    } else {
      this.trips = [];
      this.questions = [];
    }
  }

  private init() {
    if (this.initialized) return;
    try {
      const storedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
      const storedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      this.trips = storedTrips ? JSON.parse(storedTrips) : [];
      this.questions = storedQuestions ? JSON.parse(storedQuestions) : [];
    } catch {
      this.trips = [];
      this.questions = [];
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
