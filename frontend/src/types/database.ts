export type MemoryType =
  | "note"
  | "photo"
  | "video"
  | "document"
  | "voice"
  | "conversation"
  | "link"
  | "event";

export type MemoryCategory =
  | "People & Experiences"
  | "Ideas & Projects"
  | "Places & Travel"
  | "Documents & Receipts"
  | "Media & Recommendations"
  | "Health & Wellness"
  | "Conversations"
  | "Life Milestones";

export type MemorySentiment = "positive" | "neutral" | "negative" | "reflective";

export type PrivacyLevel = "private" | "locked";

export type ReminderType =
  | "birthday"
  | "anniversary"
  | "follow_up"
  | "event"
  | "custom"
  | "memory_recurrence";

export type RecurrenceRule = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  avatar_url: string | null;
  bio?: string | null;
  theme: string;
  ai_auto_organize: boolean;
  ai_auto_link: boolean;
  default_privacy: PrivacyLevel;
  created_at: string;
  updated_at?: string;
}

export interface MemoryAttachment {
  id: string;
  memory_id: string;
  user_id?: string;
  storage_path: string;
  file_path?: string; // backwards compatibility alias for storage_path
  file_name: string;
  file_type: string;
  file_size: number;
  extracted_text: string | null;
  created_at: string;
}

export interface MemoryConnection {
  id: string;
  user_id?: string;
  source_memory_id: string;
  target_memory_id: string;
  connection_reason?: string;
  reasoning?: string; // backwards compatibility alias for connection_reason
  similarity_score: number;
  confidence_score?: number; // alias
  link_type?: string;
  target_memory_title?: string;
  connectedMemory?: Memory;
  target_memory?: Memory;
  created_at?: string;
}

export type MemoryLink = MemoryConnection;

export interface ExtractedEntities {
  people: string[];
  places: string[];
  dates: string[];
  topics: string[];
  details: string[];
  title?: string;
  summary?: string;
  category?: MemoryCategory | string;
  sentiment?: MemorySentiment;
  tags?: string[];
  location?: string | null;
  memory_date?: string | null;
  detected_reminders?: {
    title: string;
    due_date?: string;
    remind_at?: string;
    reminder_type: ReminderType | string;
  }[];
}

export interface CollectionFilterCriteria {
  tags?: string[];
  category?: MemoryCategory | string;
  people?: string[];
  sentiment?: string;
  date_from?: string;
  date_to?: string;
}

export interface Collection {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  icon: string;
  accent_shade: string;
  color?: string; // alias for accent_shade
  is_smart?: boolean;
  filter_criteria?: CollectionFilterCriteria | null;
  memory_count?: number;
  count?: number; // alias
  last_viewed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Memory {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  content: string; // alias for description
  memory_type: MemoryType;
  source_type?: string; // alias for memory_type
  memory_date: string;
  location: string | null;
  location_name?: string | null; // alias for location
  location_coordinates?: { lat: number; lng: number } | null;
  weather?: string | null;
  category: MemoryCategory | string;
  tags: string[];
  ai_summary: string;
  summary: string; // alias for ai_summary
  extracted_entities: ExtractedEntities;
  people: string[]; // derived from extracted_entities.people
  sentiment?: MemorySentiment;
  personal_notes?: string | null;
  source_url?: string | null;
  privacy_level?: PrivacyLevel;
  is_pinned: boolean;
  is_favorite: boolean;
  embedding?: number[] | null;
  created_at: string;
  updated_at: string;
  attachments?: MemoryAttachment[];
  connections?: MemoryConnection[];
  links?: MemoryConnection[]; // alias for connections
  collection_ids?: string[];
}

export interface Reminder {
  id: string;
  user_id?: string;
  memory_id: string | null;
  title: string;
  notes?: string | null;
  remind_at: string;
  due_date: string; // alias for remind_at
  reminder_type: ReminderType;
  recurrence: RecurrenceRule;
  recurrence_rule?: RecurrenceRule | null; // alias
  is_completed: boolean;
  memory_title?: string | null;
  created_at: string;
}

export interface SearchResult {
  memory: Memory;
  similarity: number;
  match_reason: string;
  highlighted_snippet: string;
  score?: number;
  explanation?: string;
  relevance_score?: number;
  match_type?: string;
  match_explanation?: string;
}

export interface MemoryCitation {
  memory_id: string;
  title: string;
  date: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: MemoryCitation[];
  isGrounded?: boolean;
}
