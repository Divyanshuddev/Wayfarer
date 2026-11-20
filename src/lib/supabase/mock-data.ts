import { Collection, Memory, MemoryLink, Profile, Reminder } from "@/types/database";

export const initialProfile: Profile = {
  id: "usr_00000000-0000-0000-0000-000000000001",
  email: "archivist@shadow.ai",
  full_name: "Kaelen Vance",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  bio: "Preserving the ephemeral nuances of everyday existence.",
  ai_tone: "grounded",
  theme_preference: "dark-purple",
  storage_used_bytes: 4892014,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-11-20T00:00:00Z",
};

export const initialCollections: Collection[] = [
  {
    id: "col-1",
    user_id: initialProfile.id,
    name: "Travel & Wandering",
    description: "Footsteps in distant cities, smells of morning rain, train tickets and vistas.",
    icon: "compass",
    color: "#a855f7",
    is_smart: false,
    filter_criteria: null,
    memory_count: 3,
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-09-12T10:00:00Z",
  },
  {
    id: "col-2",
    user_id: initialProfile.id,
    name: "Architectural Epiphanies",
    description: "Breakthrough ideas on systems architecture, AI agency, and memory persistence.",
    icon: "cpu",
    color: "#8b5cf6",
    is_smart: false,
    filter_criteria: null,
    memory_count: 2,
    created_at: "2024-03-01T09:30:00Z",
    updated_at: "2024-10-15T14:20:00Z",
  },
  {
    id: "col-3",
    user_id: initialProfile.id,
    name: "Conversations with Maya",
    description: "Dialogue on philosophy, design aesthetics, and late-night espresso debriefs.",
    icon: "message-circle",
    color: "#ec4899",
    is_smart: true,
    filter_criteria: {
      people: ["Maya Lin"],
    },
    memory_count: 2,
    created_at: "2024-04-12T16:00:00Z",
    updated_at: "2024-11-01T11:00:00Z",
  },
  {
    id: "col-4",
    user_id: initialProfile.id,
    name: "Deep Reading Notes",
    description: "Quotes, marginalia, and critical reflections from books read this year.",
    icon: "book-open",
    color: "#3b82f6",
    is_smart: false,
    filter_criteria: null,
    memory_count: 2,
    created_at: "2024-01-20T12:00:00Z",
    updated_at: "2024-10-25T18:00:00Z",
  },
];

export const initialMemories: Memory[] = [
  {
    id: "mem-001",
    user_id: initialProfile.id,
    title: "Kyoto Twilight & The Hidden Moss Garden",
    content: `Spent three quiet hours at Giou-ji temple just north of Arashiyama. The afternoon rain had just stopped, leaving beads of crystal water clinging to the velvet emerald moss carpet. 

Sat on the engawa veranda listening to water drops echoing in the bamboo grove behind the thatched hall. Spoke with an elderly gardener who shared that the garden has over 120 varieties of moss, some cultivated uninterrupted since the Heian period.

Key insight: True mastery requires cultivating stillness before arranging stones. The silence here wasn't empty; it was dense with memory.`,
    summary: "Reflective afternoon at Giou-ji temple in Kyoto observing rain on 120 moss varieties with thoughts on Heian tranquility.",
    category: "event",
    sentiment: "reflective",
    memory_date: "2024-10-14T17:45:00Z",
    is_pinned: true,
    is_favorite: true,
    location_name: "Giou-ji Temple, Kyoto, Japan",
    location_coordinates: { lat: 35.0211, lng: 135.6721 },
    weather: "Post-rain mist, 18°C",
    tags: ["travel", "kyoto", "mindfulness", "japan", "gardens"],
    people: ["Elderly Gardener"],
    source_type: "quick_note",
    collection_ids: ["col-1"],
    attachments: [
      {
        id: "att-001",
        memory_id: "mem-001",
        user_id: initialProfile.id,
        file_path: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
        file_name: "kyoto-moss-temple.jpg",
        file_type: "image/jpeg",
        file_size: 2450120,
        extracted_text: "Handwritten temple entry slip: Giou-ji Autumn 2024",
        created_at: "2024-10-14T17:48:00Z",
      },
    ],
    created_at: "2024-10-14T17:50:00Z",
    updated_at: "2024-10-14T17:50:00Z",
  },
  {
    id: "mem-002",
    user_id: initialProfile.id,
    title: "Late Night Strategy with Alex on Agent Memory Systems",
    content: `Dinner at Blue Bottle Roastery with Alex Chen. We debated vector retrieval versus symbolic knowledge graphs for long-term AI memory persistence.

Alex's thesis: Raw embeddings without entity-linking degrade over long spans because temporal decay isn't encoded in pure cosine distances. A memory from 3 years ago about coffee might eclipse yesterday's urgent discussion on the same topic.

We sketched a hybrid retrieval pattern:
1. High-dimensional semantic projection for associative serendipity
2. Temporal decay curves calibrated by sentiment salience
3. Direct entity links for precise biographical grounding

Agreed to prototype this by mid-November before our quarterly summit.`,
    summary: "Strategy debate with Alex Chen on hybrid vector retrieval, temporal decay curves, and entity-linking for long-term AI memory.",
    category: "work",
    sentiment: "positive",
    memory_date: "2024-11-04T22:15:00Z",
    is_pinned: true,
    is_favorite: true,
    location_name: "Blue Bottle Roastery, San Francisco",
    location_coordinates: { lat: 37.7818, lng: -122.4093 },
    weather: "Crisp fog, 13°C",
    tags: ["tech", "ai", "rag", "architecture", "san-francisco"],
    people: ["Alex Chen"],
    source_type: "quick_note",
    collection_ids: ["col-2"],
    created_at: "2024-11-04T22:30:00Z",
    updated_at: "2024-11-04T22:30:00Z",
  },
  {
    id: "mem-003",
    user_id: initialProfile.id,
    title: "Maya's Concept on 'Negative Space in Interface Design'",
    content: `Met Maya Lin at the Nordic Bakery on Hayes St. She brought her sketchbook filled with ink studies exploring how white space functions not as absence, but as a deliberate pauses—like rests in a musical score.

She argued that modern software suffers from informational claustrophobia. Interfaces scream for clicks instead of creating room for the user to breathe and recall their own intentions.

Key takeaway for Shadow: Keep the interface obsidian and dark, with luminescence only where memory sparks. Let the silence do the work.

Remember: Maya's birthday is coming up on December 12th! Need to source that vintage typography specimen book from Munich.`,
    summary: "Discussion with Maya Lin on interface negative space as musical rests, plus reminder for her birthday on Dec 12.",
    category: "conversation",
    sentiment: "reflective",
    memory_date: "2024-10-28T14:00:00Z",
    is_pinned: false,
    is_favorite: true,
    location_name: "Nordic Bakery, Hayes Valley",
    location_coordinates: { lat: 37.7765, lng: -122.4241 },
    weather: "Overcast autumn, 16°C",
    tags: ["design", "minimalism", "philosophy", "conversations"],
    people: ["Maya Lin"],
    source_type: "quick_note",
    collection_ids: ["col-3"],
    created_at: "2024-10-28T14:30:00Z",
    updated_at: "2024-10-28T14:30:00Z",
  },
  {
    id: "mem-004",
    user_id: initialProfile.id,
    title: "Finished 'The Architecture of Happiness' by Alain de Botton",
    content: `Completed the final chapter on the flight back from Zurich. 

De Botton writes: 'What we search for in a work of art is not mere beauty, but an echo of the virtues we lack.' We don't just love buildings or rooms for their physical geometry; we love them when they speak to the person we wish we were when we occupy them.

Applied to digital spaces: What emotional shelter does our software build? Does it foster calmness and clarity, or agitation?

Favorite quote: 'Belief in the significance of architecture is premised on the notion that we are, for better or worse, different people in different places.'`,
    summary: "Notes on Alain de Botton's book exploring how spaces shape internal virtue and emotional shelter in architecture and software.",
    category: "reading",
    sentiment: "reflective",
    memory_date: "2024-09-18T19:20:00Z",
    is_pinned: false,
    is_favorite: false,
    location_name: "Flight LX38, Swiss Air",
    location_coordinates: null,
    weather: "Cruising altitude 36,000 ft",
    tags: ["books", "philosophy", "architecture", "reading"],
    people: ["Alain de Botton"],
    source_type: "quick_note",
    collection_ids: ["col-4"],
    created_at: "2024-09-18T20:00:00Z",
    updated_at: "2024-09-18T20:00:00Z",
  },
  {
    id: "mem-005",
    user_id: initialProfile.id,
    title: "Espresso Tasting Notes: Sidama Bensa Natural",
    content: `Dialed in 18g in, 42g out in 28 seconds on 9 bars. 
Tasting notes: Vibrant bergamot aroma followed immediately by stewed wild blueberry, candied lemon rind, and a remarkably clean lilac floral finish. Very silky body with zero astringency.

Roaster: Tim Wendelboe (roasted Oct 2).
Grinder setting: 3.4 on the P64 SSP MP burrs. Water composition: 45ppm GH / 20ppm KH.`,
    summary: "Espresso extraction profile and tasting notes for Tim Wendelboe Ethiopian Sidama Bensa Natural.",
    category: "thought",
    sentiment: "positive",
    memory_date: "2024-10-20T08:30:00Z",
    is_pinned: false,
    is_favorite: false,
    location_name: "Home Espresso Station",
    location_coordinates: null,
    weather: "Bright morning sunshine, 15°C",
    tags: ["coffee", "espresso", "sensory", "rituals"],
    people: [],
    source_type: "quick_note",
    attachments: [
      {
        id: "att-002",
        memory_id: "mem-005",
        user_id: initialProfile.id,
        file_path: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
        file_name: "espresso-crema.jpg",
        file_type: "image/jpeg",
        file_size: 1820400,
        extracted_text: "Roaster Bag label: Sidama Bensa Anaerobic Natural Process",
        created_at: "2024-10-20T08:32:00Z",
      },
    ],
    created_at: "2024-10-20T08:35:00Z",
    updated_at: "2024-10-20T08:35:00Z",
  },
  {
    id: "mem-006",
    user_id: initialProfile.id,
    title: "Dr. Aris Thorne on Epigenetic Memory & Biological Clocks",
    content: `Attended a closed symposium at UCSF with Dr. Aris Thorne. He presented compelling findings on DNA methylation marks functioning as physical biological memories of acute environmental shocks.

Key takeaway: Cells don't merely run code; they carry scar-tissue records of past winters, fevers, and stress. 

Thorne remarked during Q&A: 'Memory is the fundamental mechanism by which a biological system resists entropy.' When a system can no longer record what broke it yesterday, it dies tomorrow.`,
    summary: "Symposium notes from Dr. Aris Thorne on epigenetic DNA methylation marks and memory as an anti-entropy mechanism.",
    category: "reading",
    sentiment: "reflective",
    memory_date: "2024-08-15T15:00:00Z",
    is_pinned: false,
    is_favorite: true,
    location_name: "UCSF Mission Bay, San Francisco",
    location_coordinates: { lat: 37.7681, lng: -122.3912 },
    weather: "Windy, 17°C",
    tags: ["science", "biology", "genetics", "philosophy"],
    people: ["Dr. Aris Thorne"],
    source_type: "document",
    created_at: "2024-08-15T16:00:00Z",
    updated_at: "2024-08-15T16:00:00Z",
  },
  {
    id: "mem-007",
    user_id: initialProfile.id,
    title: "Morning 10k Run through Pacific Heights to Marina",
    content: `Ran along Broadway down to Crissy Field and back. Crisp coastal air, fog rolling under the Golden Gate Bridge like frozen smoke. 

Felt strong pacing: 4:48/km steady. Heart rate averaged 146 bpm. The rhythm of footfalls clears out the cognitive debris from the week better than any journal prompt. 

Noted the smell of eucalyptus trees near the Presidio gates.`,
    summary: "10k morning run through Pacific Heights to Crissy Field with brisk pace and Golden Gate fog views.",
    category: "event",
    sentiment: "positive",
    memory_date: "2024-11-10T07:15:00Z",
    is_pinned: false,
    is_favorite: false,
    location_name: "Crissy Field, San Francisco",
    location_coordinates: { lat: 37.8049, lng: -122.4665 },
    weather: "Foggy & chilly, 11°C",
    tags: ["fitness", "running", "morning", "health"],
    people: [],
    source_type: "quick_note",
    created_at: "2024-11-10T08:40:00Z",
    updated_at: "2024-11-10T08:40:00Z",
  },
];

export const initialMemoryLinks: MemoryLink[] = [
  {
    id: "lnk-001",
    user_id: initialProfile.id,
    source_memory_id: "mem-002",
    target_memory_id: "mem-003",
    link_type: "related",
    confidence_score: 0.92,
    reasoning: "Both memories explore how interface space and memory architectures shape human cognition and focus.",
    created_at: "2024-11-05T01:00:00Z",
  },
  {
    id: "lnk-002",
    user_id: initialProfile.id,
    source_memory_id: "mem-003",
    target_memory_id: "mem-004",
    link_type: "related",
    confidence_score: 0.88,
    reasoning: "Exploration of negative space and architectural virtue; how physical and digital environments shelter the soul.",
    created_at: "2024-10-29T10:00:00Z",
  },
  {
    id: "lnk-003",
    user_id: initialProfile.id,
    source_memory_id: "mem-001",
    target_memory_id: "mem-003",
    link_type: "follows",
    confidence_score: 0.84,
    reasoning: "The Kyoto aesthetic of intentional stillness and moss gardens directly informs Maya's philosophy on negative space in UI.",
    created_at: "2024-10-28T16:00:00Z",
  },
  {
    id: "lnk-004",
    user_id: initialProfile.id,
    source_memory_id: "mem-002",
    target_memory_id: "mem-006",
    link_type: "references",
    confidence_score: 0.79,
    reasoning: "AI memory persistence architectures mirror biological mechanisms against entropy discussed by Dr. Thorne.",
    created_at: "2024-11-05T02:00:00Z",
  },
];

export const initialReminders: Reminder[] = [
  {
    id: "rem-001",
    user_id: initialProfile.id,
    memory_id: "mem-003",
    title: "Maya's 30th Birthday (Order Munich typography specimen book)",
    due_date: "2024-12-12T09:00:00Z",
    reminder_type: "birthday",
    is_completed: false,
    recurrence_rule: "yearly",
    memory_title: "Maya's Concept on 'Negative Space in Interface Design'",
    created_at: "2024-10-28T14:35:00Z",
  },
  {
    id: "rem-002",
    user_id: initialProfile.id,
    memory_id: "mem-002",
    title: "Deliver Agent Memory Prototype before Quarterly Summit with Alex",
    due_date: "2024-11-28T18:00:00Z",
    reminder_type: "follow_up",
    is_completed: false,
    recurrence_rule: "none",
    memory_title: "Late Night Strategy with Alex on Agent Memory Systems",
    created_at: "2024-11-04T22:35:00Z",
  },
  {
    id: "rem-003",
    user_id: initialProfile.id,
    memory_id: "mem-001",
    title: "Annual Kyoto Anniversary Reflection: Giou-ji Stillness",
    due_date: "2025-10-14T09:00:00Z",
    reminder_type: "memory_recurrence",
    is_completed: false,
    recurrence_rule: "yearly",
    memory_title: "Kyoto Twilight & The Hidden Moss Garden",
    created_at: "2024-10-14T18:00:00Z",
  },
];
