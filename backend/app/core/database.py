from datetime import datetime
from typing import Dict, List, Optional
import uuid
try:
    from app.core.config import settings
    from app.schemas.collections_reminders import (
        CollectionResponse,
        ReminderResponse,
        ReminderType,
        RecurrenceRule,
        UserProfile,
    )
    from app.schemas.memory import (
        ExtractedEntities,
        MemoryAttachment,
        MemoryCategory,
        MemoryConnection,
        MemoryCreate,
        MemoryResponse,
        MemoryType,
        PrivacyLevel,
    )
    from app.services.embedding_service import discover_memory_links
except ImportError:
    from backend.app.core.config import settings
    from backend.app.schemas.collections_reminders import (
        CollectionResponse,
        ReminderResponse,
        ReminderType,
        RecurrenceRule,
        UserProfile,
    )
    from backend.app.schemas.memory import (
        ExtractedEntities,
        MemoryAttachment,
        MemoryCategory,
        MemoryConnection,
        MemoryCreate,
        MemoryResponse,
        MemoryType,
        PrivacyLevel,
    )
    from backend.app.services.embedding_service import discover_memory_links

# Initial seed profile
INITIAL_PROFILE = UserProfile(
    id="usr_00000000-0000-0000-0000-000000000001",
    full_name="Kaelen Vance",
    avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    theme="dark",
    ai_auto_organize=True,
    ai_auto_link=True,
    default_privacy="private",
    created_at=datetime(2024, 1, 1),
)

# Initial seed collections
INITIAL_COLLECTIONS = [
    CollectionResponse(
        id="col-1",
        user_id=INITIAL_PROFILE.id,
        name="Travel & Wandering",
        description="Footsteps in distant cities, smells of morning rain, train tickets and vistas.",
        icon="compass",
        accent_shade="#A855F7",
        memory_count=3,
        last_viewed_at=datetime(2024, 11, 20, 10, 0),
        created_at=datetime(2024, 2, 10, 10, 0),
    ),
    CollectionResponse(
        id="col-2",
        user_id=INITIAL_PROFILE.id,
        name="Architectural Epiphanies",
        description="Breakthrough ideas on systems architecture, AI agency, and memory persistence.",
        icon="cpu",
        accent_shade="#8B5CF6",
        memory_count=2,
        last_viewed_at=datetime(2024, 11, 19, 14, 20),
        created_at=datetime(2024, 3, 1, 9, 30),
    ),
    CollectionResponse(
        id="col-3",
        user_id=INITIAL_PROFILE.id,
        name="Conversations with Maya",
        description="Dialogue on philosophy, design aesthetics, and late-night espresso debriefs.",
        icon="message-circle",
        accent_shade="#EC4899",
        memory_count=2,
        last_viewed_at=datetime(2024, 11, 18, 11, 0),
        created_at=datetime(2024, 4, 12, 16, 0),
    ),
    CollectionResponse(
        id="col-4",
        user_id=INITIAL_PROFILE.id,
        name="Deep Reading Notes",
        description="Quotes, marginalia, and critical reflections from books read this year.",
        icon="book-open",
        accent_shade="#3B82F6",
        memory_count=2,
        last_viewed_at=datetime(2024, 11, 15, 18, 0),
        created_at=datetime(2024, 1, 20, 12, 0),
    ),
]

# Initial seed memories
INITIAL_MEMORIES = [
    MemoryResponse(
        id="mem-001",
        user_id=INITIAL_PROFILE.id,
        title="Kyoto Twilight & The Hidden Moss Garden",
        description="""Spent three quiet hours at Giou-ji temple just north of Arashiyama. The afternoon rain had just stopped, leaving beads of crystal water clinging to the velvet emerald moss carpet. 

Sat on the engawa veranda listening to water drops echoing in the bamboo grove behind the thatched hall. Spoke with an elderly gardener who shared that the garden has over 120 varieties of moss, some cultivated uninterrupted since the Heian period.

Key insight: True mastery requires cultivating stillness before arranging stones. The silence here wasn't empty; it was dense with memory.""",
        ai_summary="Reflective afternoon at Giou-ji temple in Kyoto observing rain on 120 moss varieties with thoughts on Heian tranquility.",
        memory_type=MemoryType.PHOTO,
        category="Places & Travel",
        memory_date=datetime(2024, 10, 14, 17, 45),
        is_pinned=True,
        location="Giou-ji Temple, Kyoto, Japan",
        tags=["travel", "kyoto", "mindfulness", "japan", "gardens"],
        extracted_entities=ExtractedEntities(
            people=["Elderly Gardener"],
            places=["Giou-ji Temple", "Kyoto", "Arashiyama"],
            dates=["Autumn 2024"],
            topics=["gardens", "mastery", "zen"],
            details=["Over 120 varieties of moss cultivated since Heian period"]
        ),
        personal_notes="Must revisit in winter when snow blankets the thatch.",
        privacy_level=PrivacyLevel.PRIVATE,
        collection_ids=["col-1"],
        attachments=[
            MemoryAttachment(
                id="att-001",
                memory_id="mem-001",
                user_id=INITIAL_PROFILE.id,
                storage_path="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
                file_name="kyoto-moss-temple.jpg",
                file_type="image/jpeg",
                file_size=2450120,
                extracted_text="Handwritten temple entry slip: Giou-ji Autumn 2024",
                created_at=datetime(2024, 10, 14, 17, 48),
            )
        ],
        connections=[],
        created_at=datetime(2024, 10, 14, 17, 50),
        updated_at=datetime(2024, 10, 14, 17, 50),
    ),
    MemoryResponse(
        id="mem-002",
        user_id=INITIAL_PROFILE.id,
        title="Late Night Strategy with Alex on Agent Memory Systems",
        description="""Dinner at Blue Bottle Roastery with Alex Chen. We debated vector retrieval versus symbolic knowledge graphs for long-term AI memory persistence.

Alex's thesis: Raw embeddings without entity-linking degrade over long spans because temporal decay isn't encoded in pure cosine distances. A memory from 3 years ago about coffee might eclipse yesterday's urgent discussion on the same topic.

We sketched a hybrid retrieval pattern:
1. High-dimensional semantic projection for associative serendipity
2. Temporal decay curves calibrated by sentiment salience
3. Direct entity links for precise biographical grounding

Agreed to prototype this by mid-November before our quarterly summit.""",
        ai_summary="Strategy debate with Alex Chen on hybrid vector retrieval, temporal decay curves, and entity-linking for long-term AI memory.",
        memory_type=MemoryType.NOTE,
        category="Ideas & Projects",
        memory_date=datetime(2024, 11, 4, 22, 15),
        is_pinned=True,
        location="Blue Bottle Roastery, San Francisco",
        tags=["tech", "ai", "rag", "architecture", "san-francisco"],
        extracted_entities=ExtractedEntities(
            people=["Alex Chen"],
            places=["Blue Bottle Roastery", "San Francisco"],
            dates=["Mid-November summit"],
            topics=["agent memory", "vector retrieval", "temporal decay"],
            details=["Sketch 3-stage hybrid retrieval pattern"]
        ),
        personal_notes="Alex will test the benchmark dataset on weekend.",
        privacy_level=PrivacyLevel.PRIVATE,
        collection_ids=["col-2"],
        attachments=[],
        connections=[],
        created_at=datetime(2024, 11, 4, 22, 30),
        updated_at=datetime(2024, 11, 4, 22, 30),
    ),
    MemoryResponse(
        id="mem-003",
        user_id=INITIAL_PROFILE.id,
        title="Maya's Concept on 'Negative Space in Interface Design'",
        description="""Met Maya Lin at the Nordic Bakery on Hayes St. She brought her sketchbook filled with ink studies exploring how white space functions not as absence, but as deliberate pauses—like rests in a musical score.

She argued that modern software suffers from informational claustrophobia. Interfaces scream for clicks instead of creating room for the user to breathe and recall their own intentions.

Key takeaway for Shadow: Keep the interface obsidian and dark, with luminescence only where memory sparks. Let the silence do the work.

Remember: Maya's birthday is coming up on December 12th! Need to source that vintage typography specimen book from Munich.""",
        ai_summary="Discussion with Maya Lin on interface negative space as musical rests, plus reminder for her birthday on Dec 12.",
        memory_type=MemoryType.CONVERSATION,
        category="Conversations",
        memory_date=datetime(2024, 10, 28, 14, 0),
        is_pinned=False,
        location="Nordic Bakery, Hayes Valley",
        tags=["design", "minimalism", "philosophy", "conversations"],
        extracted_entities=ExtractedEntities(
            people=["Maya Lin"],
            places=["Nordic Bakery", "Hayes Valley", "Munich"],
            dates=["December 12"],
            topics=["negative space", "interface design", "typography"],
            details=["Vintage typography specimen book from Munich for 30th birthday"]
        ),
        personal_notes="Maya loved the cardamom bun.",
        privacy_level=PrivacyLevel.PRIVATE,
        collection_ids=["col-3"],
        attachments=[],
        connections=[],
        created_at=datetime(2024, 10, 28, 14, 30),
        updated_at=datetime(2024, 10, 28, 14, 30),
    ),
    MemoryResponse(
        id="mem-004",
        user_id=INITIAL_PROFILE.id,
        title="Finished 'The Architecture of Happiness' by Alain de Botton",
        description="""Completed the final chapter on the flight back from Zurich. 

De Botton writes: 'What we search for in a work of art is not mere beauty, but an echo of the virtues we lack.' We don't just love buildings or rooms for their physical geometry; we love them when they speak to the person we wish we were when we occupy them.

Applied to digital spaces: What emotional shelter does our software build? Does it foster calmness and clarity, or agitation?

Favorite quote: 'Belief in the significance of architecture is premised on the notion that we are, for better or worse, different people in different places.'""",
        ai_summary="Notes on Alain de Botton's book exploring how spaces shape internal virtue and emotional shelter in architecture and software.",
        memory_type=MemoryType.DOCUMENT,
        category="Media & Recommendations",
        memory_date=datetime(2024, 9, 18, 19, 20),
        is_pinned=False,
        location="Flight LX38, Swiss Air",
        tags=["books", "philosophy", "architecture", "reading"],
        extracted_entities=ExtractedEntities(
            people=["Alain de Botton"],
            places=["Zurich"],
            dates=["September 2024"],
            topics=["architecture", "happiness", "virtues", "design philosophy"],
            details=["De Botton: Architecture as emotional shelter for the self"]
        ),
        personal_notes="Re-read chapter 4 before starting the living room redesign.",
        privacy_level=PrivacyLevel.PRIVATE,
        collection_ids=["col-4"],
        attachments=[],
        connections=[],
        created_at=datetime(2024, 9, 18, 20, 0),
        updated_at=datetime(2024, 9, 18, 20, 0),
    ),
    MemoryResponse(
        id="mem-005",
        user_id=INITIAL_PROFILE.id,
        title="Espresso Tasting Notes: Sidama Bensa Natural",
        description="""Dialed in 18g in, 42g out in 28 seconds on 9 bars. 
Tasting notes: Vibrant bergamot aroma followed immediately by stewed wild blueberry, candied lemon rind, and a remarkably clean lilac floral finish. Very silky body with zero astringency.

Roaster: Tim Wendelboe (roasted Oct 2).
Grinder setting: 3.4 on the P64 SSP MP burrs. Water composition: 45ppm GH / 20ppm KH.""",
        ai_summary="Espresso extraction profile and tasting notes for Tim Wendelboe Ethiopian Sidama Bensa Natural.",
        memory_type=MemoryType.NOTE,
        category="People & Experiences",
        memory_date=datetime(2024, 10, 20, 8, 30),
        is_pinned=False,
        location="Home Espresso Station",
        tags=["coffee", "espresso", "sensory", "rituals"],
        extracted_entities=ExtractedEntities(
            people=["Tim Wendelboe"],
            places=["Home Station", "Ethiopia"],
            dates=["Oct 20"],
            topics=["espresso", "extraction", "taste profile"],
            details=["18g in, 42g out, 28 seconds, 9 bars pressure, P64 setting 3.4"]
        ),
        personal_notes="Best shot of the bag yet.",
        privacy_level=PrivacyLevel.PRIVATE,
        collection_ids=[],
        attachments=[
            MemoryAttachment(
                id="att-002",
                memory_id="mem-005",
                user_id=INITIAL_PROFILE.id,
                storage_path="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
                file_name="espresso-crema.jpg",
                file_type="image/jpeg",
                file_size=1820400,
                extracted_text="Roaster Bag label: Sidama Bensa Anaerobic Natural Process",
                created_at=datetime(2024, 10, 20, 8, 32),
            )
        ],
        connections=[],
        created_at=datetime(2024, 10, 20, 8, 35),
        updated_at=datetime(2024, 10, 20, 8, 35),
    ),
    MemoryResponse(
        id="mem-006",
        user_id=INITIAL_PROFILE.id,
        title="Dr. Aris Thorne on Epigenetic Memory & Biological Clocks",
        description="""Attended a closed symposium at UCSF with Dr. Aris Thorne. He presented compelling findings on DNA methylation marks functioning as physical biological memories of acute environmental shocks.

Key takeaway: Cells don't merely run code; they carry scar-tissue records of past winters, fevers, and stress. 

Thorne remarked during Q&A: 'Memory is the fundamental mechanism by which a biological system resists entropy.' When a system can no longer record what broke it yesterday, it dies tomorrow.""",
        ai_summary="Symposium notes from Dr. Aris Thorne on epigenetic DNA methylation marks and memory as an anti-entropy mechanism.",
        memory_type=MemoryType.DOCUMENT,
        category="Ideas & Projects",
        memory_date=datetime(2024, 8, 15, 15, 0),
        is_pinned=False,
        location="UCSF Mission Bay, San Francisco",
        tags=["science", "biology", "genetics", "philosophy"],
        extracted_entities=ExtractedEntities(
            people=["Dr. Aris Thorne"],
            places=["UCSF Mission Bay", "San Francisco"],
            dates=["August 15, 2024"],
            topics=["epigenetics", "entropy", "cellular memory"],
            details=["DNA methylation marks as physical biological memories of acute shock"]
        ),
        personal_notes="Look up Thorne's 2023 paper in Nature Neuroscience.",
        privacy_level=PrivacyLevel.PRIVATE,
        collection_ids=[],
        attachments=[],
        connections=[],
        created_at=datetime(2024, 8, 15, 16, 0),
        updated_at=datetime(2024, 8, 15, 16, 0),
    ),
    MemoryResponse(
        id="mem-007",
        user_id=INITIAL_PROFILE.id,
        title="Morning 10k Run through Pacific Heights to Marina",
        description="""Ran along Broadway down to Crissy Field and back. Crisp coastal air, fog rolling under the Golden Gate Bridge like frozen smoke. 

Felt strong pacing: 4:48/km steady. Heart rate averaged 146 bpm. The rhythm of footfalls clears out the cognitive debris from the week better than any journal prompt. 

Noted the smell of eucalyptus trees near the Presidio gates.""",
        ai_summary="10k morning run through Pacific Heights to Crissy Field with brisk pace and Golden Gate fog views.",
        memory_type=MemoryType.EVENT,
        category="Health & Wellness",
        memory_date=datetime(2024, 11, 10, 7, 15),
        is_pinned=False,
        location="Crissy Field, San Francisco",
        tags=["fitness", "running", "morning", "health"],
        extracted_entities=ExtractedEntities(
            people=[],
            places=["Crissy Field", "Pacific Heights", "Golden Gate Bridge", "San Francisco"],
            dates=["Nov 10, 2024"],
            topics=["running", "cardio", "clarity"],
            details=["Pacing 4:48/km steady, average HR 146 bpm"]
        ),
        personal_notes="Left calf slightly tight on the uphill return.",
        privacy_level=PrivacyLevel.PRIVATE,
        collection_ids=[],
        attachments=[],
        connections=[],
        created_at=datetime(2024, 11, 10, 8, 40),
        updated_at=datetime(2024, 11, 10, 8, 40),
    ),
]

# Initial seed reminders
INITIAL_REMINDERS = [
    ReminderResponse(
        id="rem-001",
        user_id=INITIAL_PROFILE.id,
        memory_id="mem-003",
        title="Maya's 30th Birthday (Order Munich typography specimen book)",
        notes="Order Munich vintage book before Nov 30",
        remind_at=datetime(2024, 12, 12, 9, 0),
        reminder_type=ReminderType.BIRTHDAY,
        recurrence=RecurrenceRule.YEARLY,
        is_completed=False,
        memory_title="Maya's Concept on 'Negative Space in Interface Design'",
        created_at=datetime(2024, 10, 28, 14, 35),
    ),
    ReminderResponse(
        id="rem-002",
        user_id=INITIAL_PROFILE.id,
        memory_id="mem-002",
        title="Deliver Agent Memory Prototype before Quarterly Summit with Alex",
        notes="Prepare hybrid retrieval slides",
        remind_at=datetime(2024, 11, 28, 18, 0),
        reminder_type=ReminderType.FOLLOW_UP,
        recurrence=RecurrenceRule.NONE,
        is_completed=False,
        memory_title="Late Night Strategy with Alex on Agent Memory Systems",
        created_at=datetime(2024, 11, 4, 22, 35),
    ),
    ReminderResponse(
        id="rem-003",
        user_id=INITIAL_PROFILE.id,
        memory_id="mem-001",
        title="Annual Kyoto Anniversary Reflection: Giou-ji Stillness",
        notes="Look back on lessons of Heian stillness",
        remind_at=datetime(2025, 10, 14, 9, 0),
        reminder_type=ReminderType.EVENT,
        recurrence=RecurrenceRule.YEARLY,
        is_completed=False,
        memory_title="Kyoto Twilight & The Hidden Moss Garden",
        created_at=datetime(2024, 10, 14, 18, 0),
    ),
]


class MemoryRepository:
    def __init__(self):
        self.memories: Dict[str, MemoryResponse] = {m.id: m for m in INITIAL_MEMORIES}
        self.collections: Dict[str, CollectionResponse] = {c.id: c for c in INITIAL_COLLECTIONS}
        self.reminders: Dict[str, ReminderResponse] = {r.id: r for r in INITIAL_REMINDERS}
        self.profile: UserProfile = INITIAL_PROFILE

        # Initial link discovery
        for m in self.memories.values():
            m.connections = discover_memory_links(m, list(self.memories.values()))

    def get_all_memories(self, user_id: str) -> List[MemoryResponse]:
        mems = [m for m in self.memories.values() if m.user_id == user_id]
        return sorted(mems, key=lambda x: x.memory_date, reverse=True)

    def get_memory(self, memory_id: str) -> Optional[MemoryResponse]:
        return self.memories.get(memory_id)

    def create_memory(self, user_id: str, data: MemoryCreate, attachments: List[MemoryAttachment] = None) -> MemoryResponse:
        now = datetime.utcnow()
        mem_id = f"mem-{uuid.uuid4().hex[:8]}"
        new_mem = MemoryResponse(
            id=mem_id,
            user_id=user_id,
            title=data.title,
            description=data.description or "",
            memory_type=data.memory_type,
            memory_date=data.memory_date,
            location=data.location,
            category=data.category,
            tags=data.tags,
            ai_summary=data.ai_summary or (data.description[:160] if data.description else ""),
            extracted_entities=data.extracted_entities,
            personal_notes=data.personal_notes,
            source_url=data.source_url,
            privacy_level=data.privacy_level,
            is_pinned=data.is_pinned,
            collection_ids=data.collection_ids,
            attachments=attachments or [],
            connections=[],
            created_at=now,
            updated_at=now,
        )
        new_mem.connections = discover_memory_links(new_mem, list(self.memories.values()))
        self.memories[mem_id] = new_mem
        return new_mem

    def update_memory(self, memory_id: str, updates: dict) -> Optional[MemoryResponse]:
        mem = self.memories.get(memory_id)
        if not mem:
            return None
        data = mem.model_dump()
        for k, v in updates.items():
            if v is not None:
                data[k] = v
        data["updated_at"] = datetime.utcnow()
        updated = MemoryResponse(**data)
        self.memories[memory_id] = updated
        return updated

    def delete_memory(self, memory_id: str) -> bool:
        if memory_id in self.memories:
            del self.memories[memory_id]
            # Remove linked reminders
            to_del = [rid for rid, r in self.reminders.items() if r.memory_id == memory_id]
            for rid in to_del:
                del self.reminders[rid]
            return True
        return False

    def get_collections(self, user_id: str) -> List[CollectionResponse]:
        cols = [c for c in self.collections.values() if c.user_id == user_id]
        res = []
        for c in cols:
            count = sum(1 for m in self.memories.values() if c.id in m.collection_ids)
            c_copy = c.model_copy()
            c_copy.memory_count = count
            res.append(c_copy)
        return res

    def get_collection(self, col_id: str) -> Optional[CollectionResponse]:
        return self.collections.get(col_id)

    def create_collection(self, user_id: str, col: CollectionResponse) -> CollectionResponse:
        self.collections[col.id] = col
        return col

    def delete_collection(self, col_id: str) -> bool:
        if col_id in self.collections:
            del self.collections[col_id]
            for m in self.memories.values():
                if col_id in m.collection_ids:
                    m.collection_ids.remove(col_id)
            return True
        return False

    def get_reminders(self, user_id: str) -> List[ReminderResponse]:
        rems = [r for r in self.reminders.values() if r.user_id == user_id]
        return sorted(rems, key=lambda x: x.remind_at)

    def create_reminder(self, user_id: str, reminder: ReminderResponse) -> ReminderResponse:
        self.reminders[reminder.id] = reminder
        return reminder

    def toggle_reminder(self, reminder_id: str) -> Optional[ReminderResponse]:
        rem = self.reminders.get(reminder_id)
        if rem:
            rem.is_completed = not rem.is_completed
            return rem
        return None

    def delete_reminder(self, reminder_id: str) -> bool:
        if reminder_id in self.reminders:
            del self.reminders[reminder_id]
            return True
        return False

    def get_profile(self) -> UserProfile:
        return self.profile

    def update_profile(self, updates: dict) -> UserProfile:
        p_data = self.profile.model_dump()
        for k, v in updates.items():
            if v is not None:
                p_data[k] = v
        self.profile = UserProfile(**p_data)
        return self.profile


db_store = MemoryRepository()
