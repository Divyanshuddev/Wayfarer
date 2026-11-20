export type MemoryCategory =
  | "thought"
  | "event"
  | "conversation"
  | "media"
  | "reading"
  | "work"
  | "personal"
  | "location"
  | "idea";

export type MemorySentiment = "positive" | "neutral" | "negative" | "reflective";

export type MemorySourceType =
  | "quick_note"
  | "voice"
  | "image_ocr"
  | "document"
  | "chat";

export type LinkType =
  | "related"
  | "caused"
  | "follows"
  | "references"
  | "opposite";

export type ReminderType =
  | "birthday"
  | "anniversary"
  | "follow_up"
  | "memory_recurrence"
  | "custom";

export type RecurrenceRule = "none" | "yearly" | "monthly" | "weekly";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  ai_tone: "grounded" | "creative" | "analytical";
  theme_preference: "dark-purple" | "midnight" | "cyberpunk";
  storage_used_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface MemoryAttachment {
  id: string;
  memory_id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  extracted_text: string | null;
  created_at: string;
}

export interface MemoryLink {
  id: string;
  user_id: string;
  source_memory_id: string;
  target_memory_id: string;
  link_type: LinkType;
  confidence_score: number;
  reasoning: string;
  target_memory?: Memory;
  created_at: string;
}

export interface CollectionFilterCriteria {
  tags?: string[];
  category?: MemoryCategory;
  people?: string[];
  sentiment?: MemorySentiment;
  date_from?: string;
  date_to?: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  is_smart: boolean;
  filter_criteria: CollectionFilterCriteria | null;
  memory_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  title: string;
  content: string;
  summary: string;
  category: MemoryCategory;
  sentiment: MemorySentiment;
  memory_date: string;
  is_pinned: boolean;
  is_favorite: boolean;
  location_name: string | null;
  location_coordinates?: { lat: number; lng: number } | null;
  weather: string | null;
  tags: string[];
  people: string[];
  source_type: MemorySourceType;
  embedding?: number[] | null;
  created_at: string;
  updated_at: string;
  attachments?: MemoryAttachment[];
  links?: MemoryLink[];
  collection_ids?: string[];
}

export interface Reminder {
  id: string;
  user_id: string;
  memory_id: string | null;
  title: string;
  due_date: string;
  reminder_type: ReminderType;
  is_completed: boolean;
  recurrence_rule: RecurrenceRule | null;
  memory_title?: string;
  created_at: string;
}

export interface ExtractedEntities {
  title: string;
  summary: string;
  category: MemoryCategory;
  sentiment: MemorySentiment;
  tags: string[];
  people: string[];
  location: string | null;
  memory_date: string | null;
  detected_reminders: {
    title: string;
    due_date: string;
    reminder_type: ReminderType;
  }[];
}

export interface SearchResult {
  memory: Memory;
  similarity: number;
  match_reason: string;
  highlighted_snippet: string;
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
