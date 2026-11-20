import { Collection, Memory, MemoryConnection, Profile, Reminder } from "@/types/database";

export const initialProfile: Profile = {
  id: "usr_00000000-0000-0000-0000-000000000001",
  email: "archivist@shadow.ai",
  full_name: "Kaelen Vance",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  bio: "Preserving the ephemeral nuances of everyday existence.",
  theme: "dark",
  ai_auto_organize: true,
  ai_auto_link: true,
  default_privacy: "private",
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
    accent_shade: "#A855F7",
    color: "#A855F7",
    is_smart: false,
    filter_criteria: null,
    memory_count: 3,
    count: 3,
    last_viewed_at: "2024-11-20T10:00:00Z",
    created_at: "2024-02-10T10:00:00Z",
  },
  {
    id: "col-2",
    user_id: initialProfile.id,
    name: "Architectural Epiphanies",
    description: "Breakthrough ideas on systems architecture, AI agency, and memory persistence.",
    icon: "cpu",
    accent_shade: "#8B5CF6",
    color: "#8B5CF6",
    is_smart: false,
    filter_criteria: null,
    memory_count: 2,
    count: 2,
    last_viewed_at: "2024-11-19T14:20:00Z",
    created_at: "2024-03-01T09:30:00Z",
  },
  {
    id: "col-3",
    user_id: initialProfile.id,
    name: "Conversations with Maya",
    description: "Dialogue on philosophy, design aesthetics, and late-night espresso debriefs.",
    icon: "message-circle",
    accent_shade: "#EC4899",
    color: "#EC4899",
    is_smart: true,
    filter_criteria: {
      people: ["Maya Lin"],
    },
    memory_count: 2,
    count: 2,
    last_viewed_at: "2024-11-18T11:00:00Z",
    created_at: "2024-04-12T16:00:00Z",
  },
  {
    id: "col-4",
    user_id: initialProfile.id,
    name: "Deep Reading Notes",
    description: "Quotes, marginalia, and critical reflections from books read this year.",
    icon: "book-open",
    accent_shade: "#3B82F6",
    color: "#3B82F6",
    is_smart: false,
    filter_criteria: null,
    memory_count: 2,
    count: 2,
    last_viewed_at: "2024-11-15T18:00:00Z",
    created_at: "2024-01-20T12:00:00Z",
  },
];

export const initialMemories: Memory[] = [
  {
    id: "mem-001",
    user_id: initialProfile.id,
    title: "Kyoto Twilight & The Hidden Moss Garden",
    description: `Spent three quiet hours at Giou-ji temple just north of Arashiyama. The afternoon rain had just stopped, leaving beads of crystal water clinging to the velvet emerald moss carpet. 

Sat on the engawa veranda listening to water drops echoing in the bamboo grove behind the thatched hall. Spoke with an elderly gardener who shared that the garden has over 120 varieties of moss, some cultivated uninterrupted since the Heian period.

Key insight: True mastery requires cultivating stillness before arranging stones. The silence here wasn't empty; it was dense with memory.`,
    content: `Spent three quiet hours at Giou-ji temple just north of Arashiyama. The afternoon rain had just stopped, leaving beads of crystal water clinging to the velvet emerald moss carpet. 

Sat on the engawa veranda listening to water drops echoing in the bamboo grove behind the thatched hall. Spoke with an elderly gardener who shared that the garden has over 120 varieties of moss, some cultivated uninterrupted since the Heian period.

Key insight: True mastery requires cultivating stillness before arranging stones. The silence here wasn't empty; it was dense with memory.`,
    ai_summary: "Reflective afternoon at Giou-ji temple in Kyoto observing rain on 120 moss varieties with thoughts on Heian tranquility.",
    summary: "Reflective afternoon at Giou-ji temple in Kyoto observing rain on 120 moss varieties with thoughts on Heian tranquility.",
    memory_type: "photo",
    source_type: "photo",
    category: "Places & Travel",
    sentiment: "reflective",
    memory_date: "2024-10-14T17:45:00Z",
    is_pinned: true,
    is_favorite: true,
    location: "Giou-ji Temple, Kyoto, Japan",
    location_name: "Giou-ji Temple, Kyoto, Japan",
    weather: "Post-rain mist, 18°C",
    tags: ["travel", "kyoto", "mindfulness", "japan", "gardens"],
    extracted_entities: {
      people: ["Elderly Gardener"],
      places: ["Giou-ji Temple", "Kyoto", "Arashiyama"],
      dates: ["Autumn 2024"],
      topics: ["gardens", "mastery", "zen"],
      details: ["Over 120 varieties of moss cultivated since Heian period"]
    },
    people: ["Elderly Gardener"],
    personal_notes: "Must revisit in winter when snow blankets the thatch.",
    privacy_level: "private",
    collection_ids: ["col-1"],
    attachments: [
      {
        id: "att-001",
        memory_id: "mem-001",
        user_id: initialProfile.id,
        storage_path: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
        file_path: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
        file_name: "kyoto-moss-temple.jpg",
        file_type: "image/jpeg",
        file_size: 2450120,
        extracted_text: "Handwritten temple entry slip: Giou-ji Autumn 2024",
        created_at: "2024-10-14T17:48:00Z",
      },
    ],
    connections: [],
    created_at: "2024-10-14T17:50:00Z",
    updated_at: "2024-10-14T17:50:00Z",
  },
  {
    id: "mem-002",
    user_id: initialProfile.id,
    title: "Late Night Strategy with Alex on Agent Memory Systems",
    description: `Dinner at Blue Bottle Roastery with Alex Chen. We debated vector retrieval versus symbolic knowledge graphs for long-term AI memory persistence.

Alex's thesis: Raw embeddings without entity-linking degrade over long spans because temporal decay isn't encoded in pure cosine distances. A memory from 3 years ago about coffee might eclipse yesterday's urgent discussion on the same topic.

We sketched a hybrid retrieval pattern:
1. High-dimensional semantic projection for associative serendipity
2. Temporal decay curves calibrated by sentiment salience
3. Direct entity links for precise biographical grounding

Agreed to prototype this by mid-November before our quarterly summit.`,
    content: `Dinner at Blue Bottle Roastery with Alex Chen. We debated vector retrieval versus symbolic knowledge graphs for long-term AI memory persistence.

Alex's thesis: Raw embeddings without entity-linking degrade over long spans because temporal decay isn't encoded in pure cosine distances. A memory from 3 years ago about coffee might eclipse yesterday's urgent discussion on the same topic.

We sketched a hybrid retrieval pattern:
1. High-dimensional semantic projection for associative serendipity
2. Temporal decay curves calibrated by sentiment salience
3. Direct entity links for precise biographical grounding

Agreed to prototype this by mid-November before our quarterly summit.`,
    ai_summary: "Strategy debate with Alex Chen on hybrid vector retrieval, temporal decay curves, and entity-linking for long-term AI memory.",
    summary: "Strategy debate with Alex Chen on hybrid vector retrieval, temporal decay curves, and entity-linking for long-term AI memory.",
    memory_type: "note",
    source_type: "note",
    category: "Ideas & Projects",
    sentiment: "positive",
    memory_date: "2024-11-04T22:15:00Z",
    is_pinned: true,
    is_favorite: true,
    location: "Blue Bottle Roastery, San Francisco",
    location_name: "Blue Bottle Roastery, San Francisco",
    weather: "Crisp fog, 13°C",
    tags: ["tech", "ai", "rag", "architecture", "san-francisco"],
    extracted_entities: {
      people: ["Alex Chen"],
      places: ["Blue Bottle Roastery", "San Francisco"],
      dates: ["Mid-November summit"],
      topics: ["agent memory", "vector retrieval", "temporal decay"],
      details: ["Sketch 3-stage hybrid retrieval pattern"]
    },
    people: ["Alex Chen"],
    personal_notes: "Alex will test benchmark dataset on weekend.",
    privacy_level: "private",
    collection_ids: ["col-2"],
    connections: [],
    created_at: "2024-11-04T22:30:00Z",
    updated_at: "2024-11-04T22:30:00Z",
  },
  {
    id: "mem-003",
    user_id: initialProfile.id,
    title: "Maya's Concept on 'Negative Space in Interface Design'",
    description: `Met Maya Lin at the Nordic Bakery on Hayes St. She brought her sketchbook filled with ink studies exploring how white space functions not as absence, but as a deliberate pauses—like rests in a musical score.

She argued that modern software suffers from informational claustrophobia. Interfaces scream for clicks instead of creating room for the user to breathe and recall their own intentions.

Key takeaway for Shadow: Keep the interface obsidian and dark, with luminescence only where memory sparks. Let the silence do the work.

Remember: Maya's birthday is coming up on December 12th! Need to source that vintage typography specimen book from Munich.`,
    content: `Met Maya Lin at the Nordic Bakery on Hayes St. She brought her sketchbook filled with ink studies exploring how white space functions not as absence, but as a deliberate pauses—like rests in a musical score.

She argued that modern software suffers from informational claustrophobia. Interfaces scream for clicks instead of creating room for the user to breathe and recall their own intentions.

Key takeaway for Shadow: Keep the interface obsidian and dark, with luminescence only where memory sparks. Let the silence do the work.

Remember: Maya's birthday is coming up on December 12th! Need to source that vintage typography specimen book from Munich.`,
    ai_summary: "Discussion with Maya Lin on interface negative space as musical rests, plus reminder for her birthday on Dec 12.",
    summary: "Discussion with Maya Lin on interface negative space as musical rests, plus reminder for her birthday on Dec 12.",
    memory_type: "conversation",
    source_type: "conversation",
    category: "Conversations",
    sentiment: "reflective",
    memory_date: "2024-10-28T14:00:00Z",
    is_pinned: false,
    is_favorite: true,
    location: "Nordic Bakery, Hayes Valley",
    location_name: "Nordic Bakery, Hayes Valley",
    weather: "Overcast autumn, 16°C",
    tags: ["design", "minimalism", "philosophy", "conversations"],
    extracted_entities: {
      people: ["Maya Lin"],
      places: ["Nordic Bakery", "Hayes Valley", "Munich"],
      dates: ["December 12"],
      topics: ["negative space", "interface design", "typography"],
      details: ["Vintage typography specimen book from Munich for 30th birthday"]
    },
    people: ["Maya Lin"],
    personal_notes: "Maya loved the cardamom bun.",
    privacy_level: "private",
    collection_ids: ["col-3"],
    connections: [],
    created_at: "2024-10-28T14:30:00Z",
    updated_at: "2024-10-28T14:30:00Z",
  },
  {
    id: "mem-004",
    user_id: initialProfile.id,
    title: "Finished 'The Architecture of Happiness' by Alain de Botton",
    description: `Completed the final chapter on the flight back from Zurich. 

De Botton writes: 'What we search for in a work of art is not mere beauty, but an echo of the virtues we lack.' We don't just love buildings or rooms for their physical geometry; we love them when they speak to the person we wish we were when we occupy them.

Applied to digital spaces: What emotional shelter does our software build? Does it foster calmness and clarity, or agitation?

Favorite quote: 'Belief in the significance of architecture is premised on the notion that we are, for better or worse, different people in different places.'`,
    content: `Completed the final chapter on the flight back from Zurich. 

De Botton writes: 'What we search for in a work of art is not mere beauty, but an echo of the virtues we lack.' We don't just love buildings or rooms for their physical geometry; we love them when they speak to the person we wish we were when we occupy them.

Applied to digital spaces: What emotional shelter does our software build? Does it foster calmness and clarity, or agitation?

Favorite quote: 'Belief in the significance of architecture is premised on the notion that we are, for better or worse, different people in different places.'`,
    ai_summary: "Notes on Alain de Botton's book exploring how spaces shape internal virtue and emotional shelter in architecture and software.",
    summary: "Notes on Alain de Botton's book exploring how spaces shape internal virtue and emotional shelter in architecture and software.",
    memory_type: "document",
    source_type: "document",
    category: "Media & Recommendations",
    sentiment: "reflective",
    memory_date: "2024-09-18T19:20:00Z",
    is_pinned: false,
    is_favorite: false,
    location: "Flight LX38, Swiss Air",
    location_name: "Flight LX38, Swiss Air",
    weather: "Cruising altitude 36,000 ft",
    tags: ["books", "philosophy", "architecture", "reading"],
    extracted_entities: {
      people: ["Alain de Botton"],
      places: ["Zurich"],
      dates: ["September 2024"],
      topics: ["architecture", "happiness", "virtues", "design philosophy"],
      details: ["De Botton: Architecture as emotional shelter for the self"]
    },
    people: ["Alain de Botton"],
    personal_notes: "Re-read chapter 4 before starting the living room redesign.",
    privacy_level: "private",
    collection_ids: ["col-4"],
    connections: [],
    created_at: "2024-09-18T20:00:00Z",
    updated_at: "2024-09-18T20:00:00Z",
  },
  {
    id: "mem-005",
    user_id: initialProfile.id,
    title: "Espresso Tasting Notes: Sidama Bensa Natural",
    description: `Dialed in 18g in, 42g out in 28 seconds on 9 bars. 
Tasting notes: Vibrant bergamot aroma followed immediately by stewed wild blueberry, candied lemon rind, and a remarkably clean lilac floral finish. Very silky body with zero astringency.

Roaster: Tim Wendelboe (roasted Oct 2).
Grinder setting: 3.4 on the P64 SSP MP burrs. Water composition: 45ppm GH / 20ppm KH.`,
    content: `Dialed in 18g in, 42g out in 28 seconds on 9 bars. 
Tasting notes: Vibrant bergamot aroma followed immediately by stewed wild blueberry, candied lemon rind, and a remarkably clean lilac floral finish. Very silky body with zero astringency.

Roaster: Tim Wendelboe (roasted Oct 2).
Grinder setting: 3.4 on the P64 SSP MP burrs. Water composition: 45ppm GH / 20ppm KH.`,
    ai_summary: "Espresso extraction profile and tasting notes for Tim Wendelboe Ethiopian Sidama Bensa Natural.",
    summary: "Espresso extraction profile and tasting notes for Tim Wendelboe Ethiopian Sidama Bensa Natural.",
    memory_type: "note",
    source_type: "note",
    category: "People & Experiences",
    sentiment: "positive",
    memory_date: "2024-10-20T08:30:00Z",
    is_pinned: false,
    is_favorite: false,
    location: "Home Espresso Station",
    location_name: "Home Espresso Station",
    weather: "Bright morning sunshine, 15°C",
    tags: ["coffee", "espresso", "sensory", "rituals"],
    extracted_entities: {
      people: ["Tim Wendelboe"],
      places: ["Home Station", "Ethiopia"],
      dates: ["Oct 20"],
      topics: ["espresso", "extraction", "taste profile"],
      details: ["18g in, 42g out, 28 seconds, 9 bars pressure, P64 setting 3.4"]
    },
    people: ["Tim Wendelboe"],
    personal_notes: "Best shot of the bag yet.",
    privacy_level: "private",
    attachments: [
      {
        id: "att-002",
        memory_id: "mem-005",
        user_id: initialProfile.id,
        storage_path: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
        file_path: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
        file_name: "espresso-crema.jpg",
        file_type: "image/jpeg",
        file_size: 1820400,
        extracted_text: "Roaster Bag label: Sidama Bensa Anaerobic Natural Process",
        created_at: "2024-10-20T08:32:00Z",
      },
    ],
    connections: [],
    created_at: "2024-10-20T08:35:00Z",
    updated_at: "2024-10-20T08:35:00Z",
  },
  {
    id: "mem-006",
    user_id: initialProfile.id,
    title: "Dr. Aris Thorne on Epigenetic Memory & Biological Clocks",
    description: `Attended a closed symposium at UCSF with Dr. Aris Thorne. He presented compelling findings on DNA methylation marks functioning as physical biological memories of acute environmental shocks.

Key takeaway: Cells don't merely run code; they carry scar-tissue records of past winters, fevers, and stress. 

Thorne remarked during Q&A: 'Memory is the fundamental mechanism by which a biological system resists entropy.' When a system can no longer record what broke it yesterday, it dies tomorrow.`,
    content: `Attended a closed symposium at UCSF with Dr. Aris Thorne. He presented compelling findings on DNA methylation marks functioning as physical biological memories of acute environmental shocks.

Key takeaway: Cells don't merely run code; they carry scar-tissue records of past winters, fevers, and stress. 

Thorne remarked during Q&A: 'Memory is the fundamental mechanism by which a biological system resists entropy.' When a system can no longer record what broke it yesterday, it dies tomorrow.`,
    ai_summary: "Symposium notes from Dr. Aris Thorne on epigenetic DNA methylation marks and memory as an anti-entropy mechanism.",
    summary: "Symposium notes from Dr. Aris Thorne on epigenetic DNA methylation marks and memory as an anti-entropy mechanism.",
    memory_type: "document",
    source_type: "document",
    category: "Ideas & Projects",
    sentiment: "reflective",
    memory_date: "2024-08-15T15:00:00Z",
    is_pinned: false,
    is_favorite: true,
    location: "UCSF Mission Bay, San Francisco",
    location_name: "UCSF Mission Bay, San Francisco",
    weather: "Windy, 17°C",
    tags: ["science", "biology", "genetics", "philosophy"],
    extracted_entities: {
      people: ["Dr. Aris Thorne"],
      places: ["UCSF Mission Bay", "San Francisco"],
      dates: ["August 15, 2024"],
      topics: ["epigenetics", "entropy", "cellular memory"],
      details: ["DNA methylation marks as physical biological memories of acute shock"]
    },
    people: ["Dr. Aris Thorne"],
    personal_notes: "Look up Thorne's 2023 paper in Nature Neuroscience.",
    privacy_level: "private",
    connections: [],
    created_at: "2024-08-15T16:00:00Z",
    updated_at: "2024-08-15T16:00:00Z",
  },
  {
    id: "mem-007",
    user_id: initialProfile.id,
    title: "Morning 10k Run through Pacific Heights to Marina",
    description: `Ran along Broadway down to Crissy Field and back. Crisp coastal air, fog rolling under the Golden Gate Bridge like frozen smoke. 

Felt strong pacing: 4:48/km steady. Heart rate averaged 146 bpm. The rhythm of footfalls clears out the cognitive debris from the week better than any journal prompt. 

Noted the smell of eucalyptus trees near the Presidio gates.`,
    content: `Ran along Broadway down to Crissy Field and back. Crisp coastal air, fog rolling under the Golden Gate Bridge like frozen smoke. 

Felt strong pacing: 4:48/km steady. Heart rate averaged 146 bpm. The rhythm of footfalls clears out the cognitive debris from the week better than any journal prompt. 

Noted the smell of eucalyptus trees near the Presidio gates.`,
    ai_summary: "10k morning run through Pacific Heights to Crissy Field with brisk pace and Golden Gate fog views.",
    summary: "10k morning run through Pacific Heights to Crissy Field with brisk pace and Golden Gate fog views.",
    memory_type: "event",
    source_type: "event",
    category: "Health & Wellness",
    sentiment: "positive",
    memory_date: "2024-11-10T07:15:00Z",
    is_pinned: false,
    is_favorite: false,
    location: "Crissy Field, San Francisco",
    location_name: "Crissy Field, San Francisco",
    weather: "Foggy & chilly, 11°C",
    tags: ["fitness", "running", "morning", "health"],
    extracted_entities: {
      people: [],
      places: ["Crissy Field", "Pacific Heights", "Golden Gate Bridge", "San Francisco"],
      dates: ["Nov 10, 2024"],
      topics: ["running", "cardio", "clarity"],
      details: ["Pacing 4:48/km steady, average HR 146 bpm"]
    },
    people: [],
    personal_notes: "Left calf slightly tight on the uphill return.",
    privacy_level: "private",
    connections: [],
    created_at: "2024-11-10T08:40:00Z",
    updated_at: "2024-11-10T08:40:00Z",
  },
];

export const initialMemoryLinks: MemoryConnection[] = [
  {
    id: "lnk-001",
    user_id: initialProfile.id,
    source_memory_id: "mem-002",
    target_memory_id: "mem-003",
    similarity_score: 0.92,
    confidence_score: 0.92,
    link_type: "related",
    connection_reason: "Both memories explore how interface space and memory architectures shape human cognition and focus.",
    reasoning: "Both memories explore how interface space and memory architectures shape human cognition and focus.",
    target_memory_title: "Maya's Concept on 'Negative Space in Interface Design'",
    created_at: "2024-11-05T01:00:00Z",
  },
  {
    id: "lnk-002",
    user_id: initialProfile.id,
    source_memory_id: "mem-003",
    target_memory_id: "mem-004",
    similarity_score: 0.88,
    confidence_score: 0.88,
    link_type: "related",
    connection_reason: "Exploration of negative space and architectural virtue; how physical and digital environments shelter the soul.",
    reasoning: "Exploration of negative space and architectural virtue; how physical and digital environments shelter the soul.",
    target_memory_title: "Finished 'The Architecture of Happiness' by Alain de Botton",
    created_at: "2024-10-29T10:00:00Z",
  },
  {
    id: "lnk-003",
    user_id: initialProfile.id,
    source_memory_id: "mem-001",
    target_memory_id: "mem-003",
    similarity_score: 0.84,
    confidence_score: 0.84,
    link_type: "follows",
    connection_reason: "The Kyoto aesthetic of intentional stillness and moss gardens directly informs Maya's philosophy on negative space in UI.",
    reasoning: "The Kyoto aesthetic of intentional stillness and moss gardens directly informs Maya's philosophy on negative space in UI.",
    target_memory_title: "Maya's Concept on 'Negative Space in Interface Design'",
    created_at: "2024-10-28T16:00:00Z",
  },
  {
    id: "lnk-004",
    user_id: initialProfile.id,
    source_memory_id: "mem-002",
    target_memory_id: "mem-006",
    similarity_score: 0.79,
    confidence_score: 0.79,
    link_type: "references",
    connection_reason: "AI memory persistence architectures mirror biological mechanisms against entropy discussed by Dr. Thorne.",
    reasoning: "AI memory persistence architectures mirror biological mechanisms against entropy discussed by Dr. Thorne.",
    target_memory_title: "Dr. Aris Thorne on Epigenetic Memory & Biological Clocks",
    created_at: "2024-11-05T02:00:00Z",
  },
];

export const initialReminders: Reminder[] = [
  {
    id: "rem-001",
    user_id: initialProfile.id,
    memory_id: "mem-003",
    title: "Maya's 30th Birthday (Order Munich typography specimen book)",
    notes: "Order Munich vintage book before Nov 30",
    remind_at: "2024-12-12T09:00:00Z",
    due_date: "2024-12-12T09:00:00Z",
    reminder_type: "birthday",
    is_completed: false,
    recurrence: "yearly",
    recurrence_rule: "yearly",
    memory_title: "Maya's Concept on 'Negative Space in Interface Design'",
    created_at: "2024-10-28T14:35:00Z",
  },
  {
    id: "rem-002",
    user_id: initialProfile.id,
    memory_id: "mem-002",
    title: "Deliver Agent Memory Prototype before Quarterly Summit with Alex",
    notes: "Prepare hybrid retrieval slides",
    remind_at: "2024-11-28T18:00:00Z",
    due_date: "2024-11-28T18:00:00Z",
    reminder_type: "follow_up",
    is_completed: false,
    recurrence: "none",
    recurrence_rule: "none",
    memory_title: "Late Night Strategy with Alex on Agent Memory Systems",
    created_at: "2024-11-04T22:35:00Z",
  },
  {
    id: "rem-003",
    user_id: initialProfile.id,
    memory_id: "mem-001",
    title: "Annual Kyoto Anniversary Reflection: Giou-ji Stillness",
    notes: "Look back on lessons of Heian stillness",
    remind_at: "2025-10-14T09:00:00Z",
    due_date: "2025-10-14T09:00:00Z",
    reminder_type: "event",
    is_completed: false,
    recurrence: "yearly",
    recurrence_rule: "yearly",
    memory_title: "Kyoto Twilight & The Hidden Moss Garden",
    created_at: "2024-10-14T18:00:00Z",
  },
];
