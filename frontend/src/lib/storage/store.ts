import {
  Collection,
  Memory,
  MemoryConnection,
  MemoryLink,
  Profile,
  Reminder,
  SearchResult,
} from "@/types/database";
import {
  initialCollections,
  initialMemories,
  initialMemoryLinks,
  initialProfile,
  initialReminders,
} from "../supabase/mock-data";

const STORAGE_KEYS = {
  MEMORIES: "shadow_memories_v2",
  COLLECTIONS: "shadow_collections_v2",
  REMINDERS: "shadow_reminders_v2",
  LINKS: "shadow_links_v2",
  PROFILE: "shadow_profile_v2",
};

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
  "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
  "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
  "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
  "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
  "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
  "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
  "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
  "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
  "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
  "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
  "yourselves", "kind", "tell"
]);

// Clean starter collections with 0 initial memories
export const defaultStarterCollections: Collection[] = [
  {
    id: "col-1",
    user_id: "usr_00000000-0000-0000-0000-000000000001",
    name: "Personal Notes",
    description: "Daily thoughts, reflections, and personal journal entries.",
    icon: "book-open",
    accent_shade: "#8B5CF6",
    color: "#8B5CF6",
    is_smart: false,
    filter_criteria: null,
    memory_count: 0,
    count: 0,
    last_viewed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "col-2",
    user_id: "usr_00000000-0000-0000-0000-000000000001",
    name: "Ideas & Projects",
    description: "Breakthrough systems ideas, project roadmaps, and architecture notes.",
    icon: "cpu",
    accent_shade: "#3B82F6",
    color: "#3B82F6",
    is_smart: false,
    filter_criteria: null,
    memory_count: 0,
    count: 0,
    last_viewed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "col-3",
    user_id: "usr_00000000-0000-0000-0000-000000000001",
    name: "Reading & Media",
    description: "Book notes, articles, research papers, and media recommendations.",
    icon: "compass",
    accent_shade: "#A855F7",
    color: "#A855F7",
    is_smart: false,
    filter_criteria: null,
    memory_count: 0,
    count: 0,
    last_viewed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

export const defaultCleanProfile: Profile = {
  id: "usr_00000000-0000-0000-0000-000000000001",
  email: "archivist@shadow.ai",
  full_name: "Shadow Archivist",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  bio: "Personal life archive vault.",
  theme: "dark",
  ai_auto_organize: true,
  ai_auto_link: true,
  default_privacy: "private",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Deterministic pseudo-embedding generator
export function generateDeterministicEmbedding(text: string): number[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const dims = 64;
  const vector = new Array(dims).fill(0);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const bucket = Math.abs(hash) % dims;
    const sign = (hash % 2 === 0) ? 1 : -1;
    vector[bucket] += sign * (1 + 1 / (i + 1));
  }

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return vector.map((v) => v / magnitude);
}

export function cosineSim(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

class ShadowStore {
  private memories: Memory[] = [];
  private collections: Collection[] = [];
  private reminders: Reminder[] = [];
  private links: MemoryConnection[] = [];
  private profile: Profile = defaultCleanProfile;
  private initialized = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    } else {
      // Clean pristine default state
      this.memories = [];
      this.collections = [...defaultStarterCollections];
      this.reminders = [];
      this.links = [];
      this.profile = { ...defaultCleanProfile };
    }
  }

  private init() {
    if (this.initialized) return;

    try {
      const storedMemories = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      const storedCollections = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      const storedReminders = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      const storedLinks = localStorage.getItem(STORAGE_KEYS.LINKS);
      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);

      // Clean default: empty arrays unless user has saved their own memories
      this.memories = storedMemories ? JSON.parse(storedMemories) : [];
      this.collections = storedCollections ? JSON.parse(storedCollections) : [...defaultStarterCollections];
      this.reminders = storedReminders ? JSON.parse(storedReminders) : [];
      this.links = storedLinks ? JSON.parse(storedLinks) : [];
      this.profile = storedProfile ? JSON.parse(storedProfile) : { ...defaultCleanProfile };
    } catch (e) {
      console.warn("Could not load from localStorage, starting with clean memory archive", e);
      this.memories = [];
      this.collections = [...defaultStarterCollections];
      this.reminders = [];
      this.links = [];
      this.profile = { ...defaultCleanProfile };
    }

    this.initialized = true;
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(this.memories));
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(this.collections));
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(this.reminders));
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(this.links));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.profile));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- MEMORIES CRUD ---
  public getMemories(): Memory[] {
    return [...this.memories];
  }

  public getMemory(id: string): Memory | undefined {
    return this.memories.find((m) => m.id === id);
  }

  public addMemory(memory: Omit<Memory, "id" | "created_at" | "updated_at">): Memory {
    const id = `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newMemory: Memory = {
      ...memory,
      id,
      created_at: now,
      updated_at: now,
      is_pinned: memory.is_pinned ?? false,
      is_favorite: memory.is_favorite ?? false,
      extracted_entities: memory.extracted_entities || {
        people: [],
        places: [],
        dates: [],
        topics: [],
        details: [],
      },
      connections: [],
    };

    this.memories.unshift(newMemory);

    // Auto-discover links with existing memories
    this.discoverLinksFor(newMemory);

    this.save();
    return newMemory;
  }

  public createMemory(memory: any): Memory {
    return this.addMemory(memory);
  }

  public updateMemory(id: string, updates: Partial<Memory>): Memory | undefined {
    const index = this.memories.findIndex((m) => m.id === id);
    if (index === -1) return undefined;

    this.memories[index] = {
      ...this.memories[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.save();
    return this.memories[index];
  }

  public deleteMemory(id: string): boolean {
    const prevLen = this.memories.length;
    this.memories = this.memories.filter((m) => m.id !== id);
    this.links = this.links.filter(
      (l) => l.source_memory_id !== id && l.target_memory_id !== id
    );
    this.reminders = this.reminders.filter((r) => r.memory_id !== id);

    if (this.memories.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  public toggleFavorite(id: string): boolean {
    const memory = this.getMemory(id);
    if (memory) {
      this.updateMemory(id, { is_favorite: !memory.is_favorite });
      return true;
    }
    return false;
  }

  public togglePin(id: string): boolean {
    const memory = this.getMemory(id);
    if (memory) {
      this.updateMemory(id, { is_pinned: !memory.is_pinned });
      return true;
    }
    return false;
  }

  // --- AUTO-LINKING KNOWLEDGE GRAPH ---
  private discoverLinksFor(newMem: Memory) {
    const existing = this.memories.filter((m) => m.id !== newMem.id);
    const newText = `${newMem.title} ${newMem.content || ""} ${newMem.tags.join(" ")}`;
    const newVec = generateDeterministicEmbedding(newText);

    for (const oldMem of existing) {
      const oldText = `${oldMem.title} ${oldMem.content || ""} ${oldMem.tags.join(" ")}`;
      const oldVec = generateDeterministicEmbedding(oldText);
      const similarity = cosineSim(newVec, oldVec);

      // Check for shared entities or high semantic similarity
      const sharedTags = newMem.tags.filter((t) => oldMem.tags.includes(t));
      const sharedPeople = (newMem.people || []).filter((p) =>
        (oldMem.people || []).includes(p)
      );

      if (similarity > 0.45 || sharedTags.length > 0 || sharedPeople.length > 0) {
        let reason = "Thematic conceptual similarity";
        if (sharedPeople.length > 0) {
          reason = `Both involve ${sharedPeople.join(", ")}`;
        } else if (sharedTags.length > 0) {
          reason = `Shared topics: #${sharedTags.join(", #")}`;
        }

        const link: MemoryConnection = {
          id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          source_memory_id: newMem.id,
          target_memory_id: oldMem.id,
          similarity_score: Number(Math.max(similarity, 0.75).toFixed(2)),
          connection_reason: reason,
          target_memory: oldMem,
        };

        this.links.push(link);
      }
    }
  }

  public getConnectionsForMemory(memoryId: string): MemoryConnection[] {
    return this.links.filter(
      (l) => l.source_memory_id === memoryId || l.target_memory_id === memoryId
    );
  }

  public getLinksForMemory(memoryId: string): MemoryConnection[] {
    return this.getConnectionsForMemory(memoryId);
  }

  // --- COLLECTIONS CRUD ---
  public getCollections(): (Collection & { count: number })[] {
    return this.collections.map((col) => {
      const count = this.memories.filter((m) =>
        m.collection_ids?.includes(col.id)
      ).length;
      return {
        ...col,
        count: count,
        memory_count: count,
      };
    });
  }

  public getCollection(id: string): Collection | undefined {
    return this.collections.find((c) => c.id === id);
  }

  public createCollection(
    dataOrName: Partial<Collection> | string,
    description = "",
    icon = "folder"
  ): Collection {
    const name =
      typeof dataOrName === "string"
        ? dataOrName
        : dataOrName.name || "Untitled Collection";
    const desc =
      typeof dataOrName === "string"
        ? description
        : dataOrName.description || "";
    const icn =
      typeof dataOrName === "string" ? icon : dataOrName.icon || "folder";
    const color =
      typeof dataOrName === "object" && dataOrName.color
        ? dataOrName.color
        : "#8B5CF6";

    const newCol: Collection = {
      id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      user_id: this.profile.id,
      name,
      description: desc,
      icon: icn,
      accent_shade: color,
      color: color,
      is_smart: false,
      filter_criteria:
        typeof dataOrName === "object" ? dataOrName.filter_criteria : null,
      memory_count: 0,
      count: 0,
      last_viewed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.collections.push(newCol);
    this.save();
    return newCol;
  }

  public deleteCollection(id: string): boolean {
    const prevLen = this.collections.length;
    this.collections = this.collections.filter((c) => c.id !== id);
    if (this.collections.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- REMINDERS CRUD ---
  public getReminders(): Reminder[] {
    return [...this.reminders];
  }

  public createReminder(reminder: {
    title: string;
    due_date?: string | null;
    remind_at?: string | null;
    reminder_type?: Reminder["reminder_type"];
    recurrence?: Reminder["recurrence"];
    recurrence_rule?: Reminder["recurrence"] | null;
    memory_id?: string | null;
    memory_title?: string | null;
    notes?: string | null;
  }): Reminder {
    const due = reminder.due_date || reminder.remind_at || new Date().toISOString();
    const newReminder: Reminder = {
      id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      user_id: this.profile.id,
      title: reminder.title,
      due_date: due,
      remind_at: due,
      reminder_type: reminder.reminder_type || "custom",
      recurrence: reminder.recurrence || reminder.recurrence_rule || "none",
      recurrence_rule: reminder.recurrence || reminder.recurrence_rule || "none",
      memory_id: reminder.memory_id ?? null,
      memory_title: reminder.memory_title,
      notes: reminder.notes ?? null,
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    this.reminders.push(newReminder);
    this.save();
    return newReminder;
  }

  public toggleReminder(id: string): boolean {
    const rem = this.reminders.find((r) => r.id === id);
    if (rem) {
      rem.is_completed = !rem.is_completed;
      this.save();
      return true;
    }
    return false;
  }

  public deleteReminder(id: string): boolean {
    const prev = this.reminders.length;
    this.reminders = this.reminders.filter((r) => r.id !== id);
    if (this.reminders.length !== prev) {
      this.save();
      return true;
    }
    return false;
  }

  // --- PROFILE ---
  public getProfile(): Profile {
    return { ...this.profile };
  }

  public updateProfile(updates: Partial<Profile>): Profile {
    this.profile = {
      ...this.profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.profile;
  }

  // --- DEMO / DATA MANAGEMENT (Clean & Reset) ---
  public clearAllData(): void {
    this.memories = [];
    this.collections = [...defaultStarterCollections];
    this.reminders = [];
    this.links = [];
    this.profile = { ...defaultCleanProfile };
    this.save();
  }

  public clearArchive(): void {
    this.clearAllData();
  }

  public loadSampleData(): void {
    this.memories = [...initialMemories];
    this.collections = [...initialCollections];
    this.reminders = [...initialReminders];
    this.links = [...initialMemoryLinks];
    this.profile = { ...initialProfile };
    this.save();
  }

  public resetToDefault(): void {
    this.loadSampleData();
  }

  public exportData(): string {
    return JSON.stringify(
      {
        version: "1.0",
        exported_at: new Date().toISOString(),
        profile: this.profile,
        memories: this.memories,
        collections: this.collections,
        reminders: this.reminders,
        connections: this.links,
      },
      null,
      2
    );
  }

  public importData(jsonString: string): { success: boolean; count: number } {
    try {
      const parsed = JSON.parse(jsonString);
      const incomingMemories: Memory[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.memories)
        ? parsed.memories
        : [];

      if (incomingMemories.length === 0) {
        return { success: false, count: 0 };
      }

      this.memories = [...incomingMemories, ...this.memories];
      if (parsed.profile) {
        this.profile = { ...this.profile, ...parsed.profile };
      }
      if (Array.isArray(parsed.collections)) {
        this.collections = [...this.collections, ...parsed.collections];
      }
      if (Array.isArray(parsed.reminders)) {
        this.reminders = [...this.reminders, ...parsed.reminders];
      }
      this.save();
      return { success: true, count: incomingMemories.length };
    } catch (e) {
      console.error("Failed to import archive JSON:", e);
      return { success: false, count: 0 };
    }
  }

  // --- SEARCH & RETRIEVAL ---
  public search(
    query: string,
    options?: {
      category?: string;
      memory_type?: string;
      sentiment?: string;
      tag?: string;
      person?: string;
      hasAttachments?: boolean;
    }
  ): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.memories.map((m) => ({
        memory: m,
        similarity: 1.0,
        match_reason: "Recent archive record",
        highlighted_snippet: m.summary || m.description || m.title,
        score: 1.0,
        explanation: "Recent archive record",
        relevance_score: 1.0,
        match_type: "exact",
        match_explanation: "Recent archive record",
      }));
    }

    const queryVec = generateDeterministicEmbedding(q);
    const results: SearchResult[] = [];

    for (const mem of this.memories) {
      if (options?.category && options.category !== "all" && mem.category !== options.category) {
        continue;
      }
      if (options?.memory_type && options.memory_type !== "all" && mem.memory_type !== options.memory_type) {
        continue;
      }

      const fullText = `${mem.title} ${mem.content || ""} ${mem.summary || ""} ${mem.tags.join(" ")} ${mem.people.join(" ")} ${mem.location_name || ""}`.toLowerCase();
      let keywordScore = 0;
      const reasons: string[] = [];

      if (mem.title.toLowerCase().includes(q)) {
        keywordScore += 0.8;
        reasons.push("Exact match in title");
      }
      if (mem.tags.some((t) => t.toLowerCase().includes(q))) {
        keywordScore += 0.6;
        reasons.push("Matched topic tag");
      }
      if (mem.people.some((p) => p.toLowerCase().includes(q))) {
        keywordScore += 0.7;
        reasons.push("Matched recorded person");
      }
      if (fullText.includes(q)) {
        keywordScore += 0.4;
        reasons.push("Appears in memory description");
      }

      const memVec = generateDeterministicEmbedding(fullText);
      const vectorScore = cosineSim(queryVec, memVec);

      const finalScore = Number(Math.min(keywordScore + vectorScore * 0.5, 1.0).toFixed(2));

      if (finalScore > 0.15 || reasons.length > 0) {
        results.push({
          memory: mem,
          similarity: finalScore,
          match_reason: reasons.length > 0 ? reasons.join(" • ") : "Semantic concept match",
          highlighted_snippet: mem.summary || mem.description || mem.title,
          score: finalScore,
          explanation: reasons.length > 0 ? reasons.join(" • ") : "Semantic concept match",
          relevance_score: finalScore,
          match_type: reasons.length > 0 ? "keyword" : "semantic",
          match_explanation: reasons.join(" • ") || "Semantic relevance match",
        });
      }
    }

    return results.sort((a, b) => (b.score ?? b.similarity) - (a.score ?? a.similarity));
  }

  // --- STATS & REDISCOVER ---
  public getStats() {
    const total = this.memories.length;
    const pinned = this.memories.filter((m) => m.is_pinned).length;
    const favorites = this.memories.filter((m) => m.is_favorite).length;
    const withAttachments = this.memories.filter(
      (m) => m.attachments && m.attachments.length > 0
    ).length;

    const categoryCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const sentimentCounts: Record<string, number> = {
      positive: 0,
      neutral: 0,
      negative: 0,
      reflective: 0,
    };

    this.memories.forEach((m) => {
      categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
      typeCounts[m.memory_type] = (typeCounts[m.memory_type] || 0) + 1;
      if (m.sentiment) {
        sentimentCounts[m.sentiment] = (sentimentCounts[m.sentiment] || 0) + 1;
      }
    });

    return {
      total,
      pinned,
      favorites,
      withAttachments,
      categoryCounts,
      typeCounts,
      sentimentCounts,
    };
  }

  public getRediscoverMemory(): { memory: Memory; reflectionPrompt: string } | null {
    if (this.memories.length === 0) return null;
    const candidates = this.memories.filter((m) => m.is_pinned || m.is_favorite);
    const chosen = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : this.memories[Math.floor(Math.random() * this.memories.length)];

    const prompts = [
      "How has your perspective evolved since this moment was recorded?",
      "What action or gratitude does this memory spark for you today?",
      "Who might appreciate hearing about this milestone?",
      "What principle from this experience can you apply to your current work?",
    ];

    return {
      memory: chosen,
      reflectionPrompt: prompts[Math.floor(Math.random() * prompts.length)],
    };
  }
}

export const shadowStore = new ShadowStore();
