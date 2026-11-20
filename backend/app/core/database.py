from datetime import datetime
from typing import Dict, List, Optional
import uuid

try:
    from app.schemas.trip import TripCreate, TripImage, TripResponse
    from app.schemas.qa import AnswerCreate, AnswerResponse, QuestionCreate, QuestionWithAnswersResponse
except ImportError:
    from backend.app.schemas.trip import TripCreate, TripImage, TripResponse
    from backend.app.schemas.qa import AnswerCreate, AnswerResponse, QuestionCreate, QuestionWithAnswersResponse


SAMPLE_TRIPS = [
    TripResponse(
        id="trip-01",
        user_id="usr-traveler-1",
        author_name="Aria Montgomery",
        author_avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        title="Kyoto in Autumn: Golden Temples, Bamboo Groves & Traditional Ryokans",
        destination="Kyoto",
        country="Japan",
        travel_dates="Oct 14 - Oct 21, 2024",
        duration_days=7,
        travel_style="Couple",
        budget_total="$1,450",
        hotel_price_range="$75 - $140 / night",
        summary="A breathtaking 7-day journey exploring Gion geisha districts, Arashiyama bamboo forests, and morning matcha ceremonies. We stayed in an authentic wooden machiya and sampled Michelin-rated ramen.",
        itinerary="Day 1: Arrival & evening walk through Pontocho Alley.\nDay 2: Fushimi Inari gates at 6:30 AM before crowds.\nDay 3: Arashiyama bamboo grove & Tenryu-ji.\nDay 4: Day trip to Nara deer park.\nDay 5: Gion tea ceremony & Kiyomizu-dera sunset.\nDay 6: Nishiki Market food tour.\nDay 7: Zen meditation at Ryoan-ji & departure.",
        pros=[
            "Extremely safe, spotless, and easy to navigate via bus & metro",
            "Incredible culinary scene ranging from $8 street soba to multi-course Kaiseki",
            "Serene zen gardens that feel truly magical early in the morning",
            "Locals are remarkably polite and welcoming to travelers",
        ],
        cons=[
            "Arashiyama and Kiyomizu-dera get intensely crowded between 11 AM and 4 PM",
            "Traditional ryokans book out 3-4 months in advance",
            "Many authentic cafes are cash-only (7-Eleven ATMs are a lifesaver)",
            "Lots of walking uphill and cobblestone steps—bring good sneakers",
        ],
        best_time_to_visit="Mid-October to late November for maple leaves, or late March for cherry blossoms.",
        local_food_recommendations=[
            "Honke Owariya (550-year-old soba restaurant)",
            "Gion Duck Noodles (hidden alleyway broth)",
            "Nishiki Market grilled dango & wagyu skewers",
        ],
        hotel_recommendations=[
            "Ryokan Yamazaki ($95/night, authentic tatami & garden)",
            "The Pocket Hotel Kyoto Shijo ($55/night, clean modern pod style)",
            "Sowaka Gion ($220/night, luxury restored villa)",
        ],
        images=[
            TripImage(id="img-1", url="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80", caption="Golden Pavilion (Kinkaku-ji) reflection", place_type="spot"),
            TripImage(id="img-2", url="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80", caption="Traditional Gion wooden street at dusk", place_type="spot"),
            TripImage(id="img-3", url="https://images.unsplash.com/photo-1578637387939-43c525550085?w=800&auto=format&fit=crop&q=80", caption="Matcha & wagashi dessert in Arashiyama", place_type="food"),
            TripImage(id="img-4", url="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop&q=80", caption="Fushimi Inari vermillion torii gates", place_type="spot"),
        ],
        cover_image="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80",
        likes_count=142,
        questions_count=6,
        created_at=datetime(2024, 10, 24, 12, 0),
    ),
    TripResponse(
        id="trip-02",
        user_id="usr-traveler-2",
        author_name="Julian Chen",
        author_avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        title="Ubud & Canggu, Bali: Private Jungle Villas, Digital Nomad Life & Surf",
        destination="Bali",
        country="Indonesia",
        travel_dates="Sep 01 - Sep 14, 2024",
        duration_days=14,
        travel_style="Backpacking",
        budget_total="$920",
        hotel_price_range="$25 - $70 / night",
        summary="Two weeks split between the spiritual jungle of Ubud and the surf breaks of Canggu. Rented a scooter for $5/day, drank fresh dragonfruit smoothies every morning, and worked remotely from bamboo co-working spaces.",
        itinerary="Week 1: Ubud waterfalls (Tegenungan, Tibumana), yoga pavilions, Campuhan Ridge walk, and monkey forest.\nWeek 2: Canggu beach sunsets, beginner surf lessons at Echo Beach, and night markets in Pererenan.",
        pros=[
            "Unbeatable value: luxury private villas with infinity pools for under $65/night",
            "Vibrant digital nomad community with ultra-fast starlink wifi cafes",
            "Superb healthy dining: acai bowls, vegan feasts, and $2 Nasi Goreng warungs",
            "Incredible tropical scenery and lush terraced rice fields",
        ],
        cons=[
            "Traffic between Canggu, Seminyak, and Ubud can be brutal (scooter is required)",
            "Watch out for Bali Belly—always drink bottled/filtered water and avoid raw ice from roadside carts",
            "Humid tropical weather; sudden torrential downpours in afternoon",
            "Can feel over-touristy in downtown Seminyak",
        ],
        best_time_to_visit="May to September (dry season with pleasant ocean breezes).",
        local_food_recommendations=[
            "Warung Bu Mi (authentic Canggu buffet warung for $3)",
            "Clear Cafe Ubud (treehouse seating with healthy juices)",
            "Milk & Madu (best sourdough breakfast & coffee)",
        ],
        hotel_recommendations=[
            "Samyama Jungle Villa Ubud ($52/night, overlooking ravine pool)",
            "Kos One Hostel Canggu ($24/night, famous pool party hub)",
            "Bambu Indah ($180/night, eco-luxury bamboo treehouse)",
        ],
        images=[
            TripImage(id="img-21", url="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80", caption="Tegalalang Rice Terraces sunrise", place_type="scenery"),
            TripImage(id="img-22", url="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&auto=format&fit=crop&q=80", caption="Jungle infinity pool villa", place_type="hotel"),
            TripImage(id="img-23", url="https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=80", caption="Canggu sunset surf", place_type="activity"),
        ],
        cover_image="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80",
        likes_count=189,
        questions_count=9,
        created_at=datetime(2024, 9, 18, 14, 30),
    ),
    TripResponse(
        id="trip-03",
        user_id="usr-traveler-3",
        author_name="Elena Rostova",
        author_avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        title="Amalfi Coast & Positano: Cliffside Pasta, Lemon Groves & Capri Boat Charters",
        destination="Amalfi Coast",
        country="Italy",
        travel_dates="Jun 10 - Jun 16, 2024",
        duration_days=6,
        travel_style="Luxury",
        budget_total="$2,800",
        hotel_price_range="$180 - $350 / night",
        summary="A dream coastal escape driving vintage Vespas along hairpin sea cliffs, dining on fresh seafood linguine with limoncello spritz, and chartering a wooden gozzo boat around the Capri sea caves.",
        itinerary="Day 1: Ferry from Salerno into Positano, sunset drinks at Franco's Bar.\nDay 2: Path of the Gods hike (Sentiero degli Dei) from Bomerano.\nDay 3: Private wooden boat charter to Capri and the Faraglioni rocks.\nDay 4: Ravello gardens (Villa Cimbrone & Villa Rufolo).\nDay 5: Beach day at Fiordo di Furore.\nDay 6: Limoncello tasting in Amalfi town & departure.",
        pros=[
            "Unrivaled Mediterranean views: pastel cliffside homes hanging over turquoise sea",
            "World-class food: handmade lemon pasta, buffalo mozzarella, and fresh catch of the day",
            "Hikes like Path of the Gods offer once-in-a-lifetime panoramas",
            "Glamorous European summer energy with wonderful ferry connections",
        ],
        cons=[
            "Extremely expensive accommodation, especially in peak months (June - August)",
            "Very crowded ferry docks and steep stone stairs everywhere",
            "Driving a rental car is terrifying on narrow cliff roads; take public ferries instead",
            "Beach clubs require $40 - $70 sunbed reservations days ahead",
        ],
        best_time_to_visit="May or September (fewer tourists, warm water, and lower room rates).",
        local_food_recommendations=[
            "Da Vincenzo Positano (seafood scialatielli)",
            "Trattoria da Gemma in Amalfi (lemon risotto)",
            "Bar Franco (sunset cocktail with panoramic cliff view)",
        ],
        hotel_recommendations=[
            "Hotel Poseidon ($280/night, vintage rooftop terrace)",
            "Casa Angelina ($450/night, ultra-modern luxury in Praiano)",
            "B&B Dimora Del Podesta ($140/night, cozy family-run gem)",
        ],
        images=[
            TripImage(id="img-31", url="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80", caption="Positano pastel village cascading into the sea", place_type="spot"),
            TripImage(id="img-32", url="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&auto=format&fit=crop&q=80", caption="Wooden boat cruise past Capri Faraglioni", place_type="activity"),
            TripImage(id="img-33", url="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80", caption="Handmade seafood pasta & local white wine", place_type="food"),
        ],
        cover_image="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&auto=format&fit=crop&q=80",
        likes_count=214,
        questions_count=12,
        created_at=datetime(2024, 6, 20, 10, 15),
    ),
    TripResponse(
        id="trip-04",
        user_id="usr-traveler-4",
        author_name="Marcus Vance",
        author_avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        title="Swiss Alps & Zermatt: Glacier Hikes, Alpine Fondue & The Matterhorn",
        destination="Zermatt",
        country="Switzerland",
        travel_dates="Aug 05 - Aug 11, 2024",
        duration_days=6,
        travel_style="Solo",
        budget_total="$1,850",
        hotel_price_range="$130 - $220 / night",
        summary="Epic solo mountain trek through the Swiss Alps. Woke up at 5 AM to catch the sunrise reflection of the Matterhorn in Stellisee lake, rode the Gornergrat cogwheel train, and ate piping hot cheese fondue in car-free Zermatt village.",
        itinerary="Day 1: Train from Zurich Airport to car-free Zermatt.\nDay 2: Five Lakes Walk (5-Seenweg) starting at Blauherd.\nDay 3: Gornergrat railway at 3,089m elevation.\nDay 4: Glacier Paradise cable car & ice palace.\nDay 5: Alpine meadows hike down through Findeln.\nDay 6: Panoramic Swiss rail return to Geneva.",
        pros=[
            "Pristine mountain air, mirror-like alpine lakes, and world-class trail markings",
            "Switzerland's rail and cable car network is like clockwork; you never need a car",
            "Zermatt is completely car-free—quiet, clean, and peaceful electric taxis only",
            "Glacier views that will stay in your memory forever",
        ],
        cons=[
            "Food and dining are notoriously expensive ($35+ for basic burger, $45 fondue)",
            "High mountain weather can change in 15 minutes; layers and rain shell are mandatory",
            "Cable car passes add up fast (get the Swiss Travel Pass to save 50%)",
            "Altitude above 3,000m can cause mild headaches on day 1",
        ],
        best_time_to_visit="July to early September for hiking and wildflowers, or January to March for skiing.",
        local_food_recommendations=[
            "Chez Vrony in Findeln (legendary alpine fondue & dried beef)",
            "Fuchs Bakery (famous Matterhorn chocolate bread)",
            "Walliserkanne (traditional raclette dinner)",
        ],
        hotel_recommendations=[
            "Hotel Zermama ($145/night, hipster alpine boutique)",
            "Matterhorn Hostel ($45/night, best social budget stay)",
            "The Omnia ($390/night, cliffside luxury chalet)",
        ],
        images=[
            TripImage(id="img-41", url="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80", caption="Matterhorn mirrored in Stellisee lake at sunrise", place_type="spot"),
            TripImage(id="img-42", url="https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&auto=format&fit=crop&q=80", caption="Alpine hiking trail through pine forest", place_type="activity"),
        ],
        cover_image="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&auto=format&fit=crop&q=80",
        likes_count=176,
        questions_count=5,
        created_at=datetime(2024, 8, 14, 16, 40),
    ),
]

SAMPLE_QUESTIONS: List[QuestionWithAnswersResponse] = [
    QuestionWithAnswersResponse(
        id="q-01",
        trip_id="trip-01",
        destination="Kyoto",
        author_name="Sarah Jenkins",
        question="What is the realistic price for a nice hotel or ryokan for a couple in Kyoto during November?",
        category="hotel_price",
        created_at=datetime(2024, 10, 26, 11, 0),
        answers=[
            AnswerResponse(
                id="ans-01",
                question_id="q-01",
                author_name="Aria Montgomery (Visited Oct 2024)",
                author_visited=True,
                answer="Expect to pay around $85 - $130/night for a clean, boutique Japanese hotel near Shijo/Karasuma station. If you want an authentic ryokan with dinner included, plan for $200 - $320/night. Book at least 2 months ahead because November is peak autumn foliage!",
                hotel_name="Ryokan Yamazaki or Pocket Hotel Shijo",
                hotel_price_per_night="$95 / night",
                helpful_votes=34,
                created_at=datetime(2024, 10, 26, 13, 15),
            ),
            AnswerResponse(
                id="ans-02",
                question_id="q-01",
                author_name="Kenji Sato (Local Guide)",
                author_visited=True,
                answer="A great money-saving tip: Stay near Kyoto Main Station rather than central Gion. Hotels there are modern, cost about $60-80/night, and you have direct subway lines to all major temples.",
                hotel_name="Hotel Vischio Kyoto",
                hotel_price_per_night="$72 / night",
                helpful_votes=19,
                created_at=datetime(2024, 10, 27, 9, 40),
            )
        ]
    ),
    QuestionWithAnswersResponse(
        id="q-02",
        trip_id="trip-02",
        destination="Bali",
        author_name="David Miller",
        question="Is it safe to rent a scooter in Ubud if I have never driven one in Asia before?",
        category="safety",
        created_at=datetime(2024, 9, 20, 15, 30),
        answers=[
            AnswerResponse(
                id="ans-03",
                question_id="q-02",
                author_name="Julian Chen (Visited Sep 2024)",
                author_visited=True,
                answer="Honestly, I wouldn't recommend learning in downtown Ubud or Canggu—traffic has narrow roads, dogs, and potholes. Instead, practice on quiet side streets in Penestanan or hire a Gojek/Grab bike driver for $1-$2 per ride. It's super cheap and stress-free!",
                hotel_name=None,
                hotel_price_per_night=None,
                helpful_votes=42,
                created_at=datetime(2024, 9, 20, 18, 0),
            )
        ]
    ),
    QuestionWithAnswersResponse(
        id="q-03",
        trip_id="trip-03",
        destination="Amalfi Coast",
        author_name="Chloe Dupuis",
        question="Are hotel prices in Positano worth it, or is it better to base ourselves in Sorrento or Amalfi town?",
        category="hotel_price",
        created_at=datetime(2024, 7, 2, 8, 20),
        answers=[
            AnswerResponse(
                id="ans-04",
                question_id="q-03",
                author_name="Elena Rostova (Visited Jun 2024)",
                author_visited=True,
                answer="Positano hotels average $250 - $400/night in summer. If you want the iconic view from your balcony, do 1-2 nights in Positano, but for the rest of your trip stay in Amalfi town or Praiano where rooms are $120-$160/night and you avoid dragging luggage up 300 steps!",
                hotel_name="B&B Dimora Del Podesta (Praiano)",
                hotel_price_per_night="$140 / night",
                helpful_votes=28,
                created_at=datetime(2024, 7, 2, 10, 45),
            )
        ]
    ),
]


class TripRepository:
    def __init__(self):
        self.trips: Dict[str, TripResponse] = {}
        self.questions: Dict[str, QuestionWithAnswersResponse] = {}

    def get_all_trips(self, destination: Optional[str] = None, style: Optional[str] = None, query: Optional[str] = None) -> List[TripResponse]:
        results = list(self.trips.values())
        if destination and destination.lower() != "all":
            results = [t for t in results if destination.lower() in t.destination.lower() or destination.lower() in t.country.lower()]
        if style and style.lower() != "all":
            results = [t for t in results if style.lower() == t.travel_style.lower()]
        if query and query.strip():
            q = query.lower().strip()
            results = [
                t for t in results
                if q in t.title.lower()
                or q in t.destination.lower()
                or q in t.country.lower()
                or q in t.summary.lower()
                or any(q in p.lower() for p in t.pros)
                or any(q in c.lower() for c in t.cons)
            ]
        return sorted(results, key=lambda x: x.created_at, reverse=True)

    def get_trip_by_id(self, trip_id: str) -> Optional[TripResponse]:
        return self.trips.get(trip_id)

    def create_trip(self, data: TripCreate, author_name: str = "Fellow Traveler") -> TripResponse:
        trip_id = f"trip-{uuid.uuid4().hex[:8]}"
        cover = data.cover_image or (data.images[0] if data.images else "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80")
        
        trip_images = [
            TripImage(id=f"img-{i}", url=url, place_type="scenery")
            for i, url in enumerate(data.images)
        ]

        new_trip = TripResponse(
            id=trip_id,
            user_id="usr-current-user",
            author_name=author_name,
            author_avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
            title=data.title,
            destination=data.destination,
            country=data.country,
            travel_dates=data.travel_dates,
            duration_days=data.duration_days,
            travel_style=data.travel_style,
            budget_total=data.budget_total,
            hotel_price_range=data.hotel_price_range,
            summary=data.summary,
            itinerary=data.itinerary,
            pros=data.pros,
            cons=data.cons,
            best_time_to_visit=data.best_time_to_visit,
            local_food_recommendations=data.local_food_recommendations,
            hotel_recommendations=data.hotel_recommendations,
            images=trip_images,
            cover_image=cover,
            likes_count=1,
            questions_count=0,
            created_at=datetime.utcnow(),
        )
        self.trips[trip_id] = new_trip
        return new_trip

    def like_trip(self, trip_id: str) -> Optional[TripResponse]:
        trip = self.trips.get(trip_id)
        if trip:
            trip.likes_count += 1
            return trip
        return None

    def get_questions(self, destination: Optional[str] = None, trip_id: Optional[str] = None) -> List[QuestionWithAnswersResponse]:
        results = list(self.questions.values())
        if trip_id:
            results = [q for q in results if q.trip_id == trip_id]
        elif destination and destination.lower() != "all":
            results = [q for q in results if destination.lower() in q.destination.lower()]
        return sorted(results, key=lambda x: x.created_at, reverse=True)

    def add_question(self, data: QuestionCreate) -> QuestionWithAnswersResponse:
        q_id = f"q-{uuid.uuid4().hex[:8]}"
        new_q = QuestionWithAnswersResponse(
            id=q_id,
            trip_id=data.trip_id,
            destination=data.destination,
            author_name=data.author_name,
            question=data.question,
            category=data.category,
            created_at=datetime.utcnow(),
            answers=[],
        )
        self.questions[q_id] = new_q
        if data.trip_id and data.trip_id in self.trips:
            self.trips[data.trip_id].questions_count += 1
        return new_q

    def add_answer(self, question_id: str, data: AnswerCreate) -> Optional[AnswerResponse]:
        q = self.questions.get(question_id)
        if not q:
            return None
        ans_id = f"ans-{uuid.uuid4().hex[:8]}"
        new_ans = AnswerResponse(
            id=ans_id,
            question_id=question_id,
            author_name=data.author_name,
            author_visited=data.author_visited,
            answer=data.answer,
            hotel_name=data.hotel_name,
            hotel_price_per_night=data.hotel_price_per_night,
            helpful_votes=1,
            created_at=datetime.utcnow(),
        )
        q.answers.append(new_ans)
        return new_ans

    def vote_answer(self, question_id: str, answer_id: str) -> Optional[AnswerResponse]:
        q = self.questions.get(question_id)
        if not q:
            return None
        for a in q.answers:
            if a.id == answer_id:
                a.helpful_votes += 1
                return a
        return None


trip_db = TripRepository()
