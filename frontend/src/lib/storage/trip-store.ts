import { Trip, TripAnswer, TripQuestion } from "@/types/trip";

const STORAGE_KEYS = {
  TRIPS: "wayfarer_trips_v1",
  QUESTIONS: "wayfarer_questions_v1",
  USER: "wayfarer_user_v1",
};

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
      { id: "img-3", url: "https://images.unsplash.com/photo-1578637387939-43c525550085?w=800&auto=format&fit=crop&q=80", caption: "Matcha & wagashi dessert in Arashiyama", place_type: "food" },
      { id: "img-4", url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop&q=80", caption: "Fushimi Inari vermillion torii gates", place_type: "spot" },
    ],
    cover_image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80",
    likes_count: 142,
    questions_count: 2,
    created_at: "2024-10-24T12:00:00Z",
  },
  {
    id: "trip-02",
    user_id: "usr-traveler-2",
    author_name: "Julian Chen",
    author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    title: "Ubud & Canggu, Bali: Jungle Infinity Villas, Nomad Cafes & Sunset Surf",
    destination: "Bali",
    country: "Indonesia",
    travel_dates: "Sep 01 - Sep 14, 2024",
    duration_days: 14,
    travel_style: "Backpacking",
    budget_total: "$920",
    hotel_price_range: "$25 - $70 / night",
    summary: "Two weeks split between the spiritual jungle of Ubud and the surf breaks of Canggu. Rented a scooter for $5/day, drank fresh dragonfruit smoothies every morning, and worked remotely from bamboo co-working spaces.",
    itinerary: "Week 1: Ubud waterfalls (Tegenungan, Tibumana), yoga pavilions, Campuhan Ridge walk, and monkey forest.\nWeek 2: Canggu beach sunsets, beginner surf lessons at Echo Beach, and night markets in Pererenan.",
    pros: [
      "Unbeatable value: luxury private villas with infinity pools for under $65/night",
      "Vibrant digital nomad community with ultra-fast starlink wifi cafes",
      "Superb healthy dining: acai bowls, vegan feasts, and $2 Nasi Goreng warungs",
      "Incredible tropical scenery and lush terraced rice fields",
    ],
    cons: [
      "Traffic between Canggu, Seminyak, and Ubud can be brutal (scooter is required)",
      "Watch out for Bali Belly—always drink bottled/filtered water and avoid raw ice from roadside carts",
      "Humid tropical weather; sudden torrential downpours in afternoon",
      "Can feel over-touristy in downtown Seminyak",
    ],
    best_time_to_visit: "May to September (dry season with pleasant ocean breezes).",
    local_food_recommendations: [
      "Warung Bu Mi (authentic Canggu buffet warung for $3)",
      "Clear Cafe Ubud (treehouse seating with healthy juices)",
      "Milk & Madu (best sourdough breakfast & coffee)",
    ],
    hotel_recommendations: [
      "Samyama Jungle Villa Ubud ($52/night, overlooking ravine pool)",
      "Kos One Hostel Canggu ($24/night, famous pool party hub)",
      "Bambu Indah ($180/night, eco-luxury bamboo treehouse)",
    ],
    images: [
      { id: "img-21", url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80", caption: "Tegalalang Rice Terraces sunrise", place_type: "scenery" },
      { id: "img-22", url: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&auto=format&fit=crop&q=80", caption: "Jungle infinity pool villa", place_type: "hotel" },
      { id: "img-23", url: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=80", caption: "Canggu sunset surf", place_type: "activity" },
    ],
    cover_image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80",
    likes_count: 189,
    questions_count: 1,
    created_at: "2024-09-18T14:30:00Z",
  },
  {
    id: "trip-03",
    user_id: "usr-traveler-3",
    author_name: "Elena Rostova",
    author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    title: "Amalfi Coast & Positano: Cliffside Pasta, Lemon Groves & Capri Charters",
    destination: "Amalfi Coast",
    country: "Italy",
    travel_dates: "Jun 10 - Jun 16, 2024",
    duration_days: 6,
    travel_style: "Luxury",
    budget_total: "$2,800",
    hotel_price_range: "$180 - $350 / night",
    summary: "A dream coastal escape driving vintage Vespas along hairpin sea cliffs, dining on fresh seafood linguine with limoncello spritz, and chartering a wooden gozzo boat around the Capri sea caves.",
    itinerary: "Day 1: Ferry from Salerno into Positano, sunset drinks at Franco's Bar.\nDay 2: Path of the Gods hike (Sentiero degli Dei) from Bomerano.\nDay 3: Private wooden boat charter to Capri and the Faraglioni rocks.\nDay 4: Ravello gardens (Villa Cimbrone & Villa Rufolo).\nDay 5: Beach day at Fiordo di Furore.\nDay 6: Limoncello tasting in Amalfi town & departure.",
    pros: [
      "Unrivaled Mediterranean views: pastel cliffside homes hanging over turquoise sea",
      "World-class food: handmade lemon pasta, buffalo mozzarella, and fresh catch of the day",
      "Hikes like Path of the Gods offer once-in-a-lifetime panoramas",
      "Glamorous European summer energy with wonderful ferry connections",
    ],
    cons: [
      "Extremely expensive accommodation, especially in peak months (June - August)",
      "Very crowded ferry docks and steep stone stairs everywhere",
      "Driving a rental car is terrifying on narrow cliff roads; take public ferries instead",
      "Beach clubs require $40 - $70 sunbed reservations days ahead",
    ],
    best_time_to_visit: "May or September (fewer tourists, warm water, and lower room rates).",
    local_food_recommendations: [
      "Da Vincenzo Positano (seafood scialatielli)",
      "Trattoria da Gemma in Amalfi (lemon risotto)",
      "Bar Franco (sunset cocktail with panoramic cliff view)",
    ],
    hotel_recommendations: [
      "Hotel Poseidon ($280/night, vintage rooftop terrace)",
      "Casa Angelina ($450/night, ultra-modern luxury in Praiano)",
      "B&B Dimora Del Podesta ($140/night, cozy family-run gem)",
    ],
    images: [
      { id: "img-31", url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80", caption: "Positano pastel village cascading into the sea", place_type: "spot" },
      { id: "img-32", url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&auto=format&fit=crop&q=80", caption: "Wooden boat cruise past Capri Faraglioni", place_type: "activity" },
      { id: "img-33", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80", caption: "Handmade seafood pasta & local white wine", place_type: "food" },
    ],
    cover_image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&auto=format&fit=crop&q=80",
    likes_count: 214,
    questions_count: 1,
    created_at: "2024-06-20T10:15:00Z",
  },
  {
    id: "trip-04",
    user_id: "usr-traveler-4",
    author_name: "Marcus Vance",
    author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    title: "Swiss Alps & Zermatt: Glacier Hikes, Alpine Fondue & The Matterhorn",
    destination: "Zermatt",
    country: "Switzerland",
    travel_dates: "Aug 05 - Aug 11, 2024",
    duration_days: 6,
    travel_style: "Solo",
    budget_total: "$1,850",
    hotel_price_range: "$130 - $220 / night",
    summary: "Epic solo mountain trek through the Swiss Alps. Woke up at 5 AM to catch the sunrise reflection of the Matterhorn in Stellisee lake, rode the Gornergrat cogwheel train, and ate piping hot cheese fondue in car-free Zermatt village.",
    itinerary: "Day 1: Train from Zurich Airport to car-free Zermatt.\nDay 2: Five Lakes Walk (5-Seenweg) starting at Blauherd.\nDay 3: Gornergrat railway at 3,089m elevation.\nDay 4: Glacier Paradise cable car & ice palace.\nDay 5: Alpine meadows hike down through Findeln.\nDay 6: Panoramic Swiss rail return to Geneva.",
    pros: [
      "Pristine mountain air, mirror-like alpine lakes, and world-class trail markings",
      "Switzerland's rail and cable car network is like clockwork; you never need a car",
      "Zermatt is completely car-free—quiet, clean, and peaceful electric taxis only",
      "Glacier views that will stay in your memory forever",
    ],
    cons: [
      "Food and dining are notoriously expensive ($35+ for basic burger, $45 fondue)",
      "High mountain weather can change in 15 minutes; layers and rain shell are mandatory",
      "Cable car passes add up fast (get the Swiss Travel Pass to save 50%)",
      "Altitude above 3,000m can cause mild headaches on day 1",
    ],
    best_time_to_visit: "July to early September for hiking and wildflowers, or January to March for skiing.",
    local_food_recommendations: [
      "Chez Vrony in Findeln (legendary alpine fondue & dried beef)",
      "Fuchs Bakery (famous Matterhorn chocolate bread)",
      "Walliserkanne (traditional raclette dinner)",
    ],
    hotel_recommendations: [
      "Hotel Zermama ($145/night, hipster alpine boutique)",
      "Matterhorn Hostel ($45/night, best social budget stay)",
      "The Omnia ($390/night, cliffside luxury chalet)",
    ],
    images: [
      { id: "img-41", url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80", caption: "Matterhorn mirrored in Stellisee lake at sunrise", place_type: "spot" },
      { id: "img-42", url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&auto=format&fit=crop&q=80", caption: "Alpine hiking trail through pine forest", place_type: "activity" },
    ],
    cover_image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&auto=format&fit=crop&q=80",
    likes_count: 176,
    questions_count: 0,
    created_at: "2024-08-14T16:40:00Z",
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
      {
        id: "ans-02",
        question_id: "q-01",
        author_name: "Kenji Sato (Local Guide)",
        author_visited: true,
        answer: "A great money-saving tip: Stay near Kyoto Main Station rather than central Gion. Hotels there are modern, cost about $60-80/night, and you have direct subway lines to all major temples.",
        hotel_name: "Hotel Vischio Kyoto",
        hotel_price_per_night: "$72 / night",
        helpful_votes: 19,
        created_at: "2024-10-27T09:40:00Z",
      },
    ],
  },
  {
    id: "q-02",
    trip_id: "trip-02",
    destination: "Bali",
    author_name: "David Miller",
    question: "Is it safe to rent a scooter in Ubud if I have never driven one in Asia before?",
    category: "safety",
    created_at: "2024-09-20T15:30:00Z",
    answers: [
      {
        id: "ans-03",
        question_id: "q-02",
        author_name: "Julian Chen (Visited Sep 2024)",
        author_visited: true,
        answer: "Honestly, I wouldn't recommend learning in downtown Ubud or Canggu—traffic has narrow roads, dogs, and potholes. Instead, practice on quiet side streets in Penestanan or hire a Gojek/Grab bike driver for $1-$2 per ride. It's super cheap and stress-free!",
        hotel_name: null,
        hotel_price_per_night: null,
        helpful_votes: 42,
        created_at: "2024-09-20T18:00:00Z",
      },
    ],
  },
  {
    id: "q-03",
    trip_id: "trip-03",
    destination: "Amalfi Coast",
    author_name: "Chloe Dupuis",
    question: "Are hotel prices in Positano worth it, or is it better to base ourselves in Sorrento or Amalfi town?",
    category: "hotel_price",
    created_at: "2024-07-02T08:20:00Z",
    answers: [
      {
        id: "ans-04",
        question_id: "q-03",
        author_name: "Elena Rostova (Visited Jun 2024)",
        author_visited: true,
        answer: "Positano hotels average $250 - $400/night in summer. If you want the iconic view from your balcony, do 1-2 nights in Positano, but for the rest of your trip stay in Amalfi town or Praiano where rooms are $120-$160/night and you avoid dragging luggage up 300 steps!",
        hotel_name: "B&B Dimora Del Podesta (Praiano)",
        hotel_price_per_night: "$140 / night",
        helpful_votes: 28,
        created_at: "2024-07-02T10:45:00Z",
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
      this.trips = storedTrips ? JSON.parse(storedTrips) : [...INITIAL_TRIPS];
      this.questions = storedQuestions ? JSON.parse(storedQuestions) : [...INITIAL_QUESTIONS];
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

  public subscribe(listener: () => void) {
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
