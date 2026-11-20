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
  MEMORIES: "shadow_memories_v1",
  COLLECTIONS: "shadow_collections_v1",
  REMINDERS: "shadow_reminders_v1",
  LINKS: "shadow_links_v1",
  PROFILE: "shadow_profile_v1",
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

// Simple pseudo-embedding generator for client-side semantic similarity
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

  // Normalize
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
  private profile: Profile = initialProfile;
  private initialized = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    } else {
      this.memories = [...initialMemories];
      this.collections = [...initialCollections];
      this.reminders = [...initialReminders];
      this.links = [...initialMemoryLinks];
      this.profile = { ...initialProfile };
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

      this.memories = storedMemories ? JSON.parse(storedMemories) : [...initialMemories];
      this.collections = storedCollections ? JSON.parse(storedCollections) : [...initialCollections];
      this.reminders = storedReminders ? JSON.parse(storedReminders) : [...initialReminders];
      this.links = storedLinks ? JSON.parse(storedLinks) : [...initialMemoryLinks];
      this.profile = storedProfile ? JSON.parse(storedProfile) : { ...initialProfile };

      if (!storedMemories) {
        this.saveAll();
      }
    } catch {
      this.memories = [...initialMemories];
      this.collections = [...initialCollections];
      this.reminders = [...initialReminders];
      this.links = [...initialMemoryLinks];
    }
    this.initialized = true;
  }

  private saveAll() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(this.memories));
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(this.collections));
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(this.reminders));
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(this.links));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.profile));
    } catch (e) {
      console.warn("Local storage write failed:", e);
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

  // --- MEMORIES ---
  public getMemories(): Memory[] {
    this.init();
    return [...this.memories].sort(
      (a, b) => new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime()
    );
  }

  public getMemory(id: string): Memory | undefined {
    this.init();
    return this.memories.find((m) => m.id === id);
  }

  public createMemory(data: Partial<Memory>): Memory {
    this.init();
    const id = `mem-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newMemory: Memory = {
      id,
      user_id: this.profile.id,
      title: data.title || "Untitled Memory",
      description: data.description || data.content || "",
      content: data.content || data.description || "",
      summary: data.summary || data.ai_summary || data.content?.slice(0, 160) || "",
      ai_summary: data.ai_summary || data.summary || data.content?.slice(0, 160) || "",
      category: data.category || "Ideas & Projects",
      sentiment: data.sentiment || "reflective",
      memory_type: data.memory_type || "note",
      source_type: data.source_type || data.memory_type || "note",
      memory_date: data.memory_date || now,
      is_pinned: Boolean(data.is_pinned),
      is_favorite: Boolean(data.is_favorite),
      location: data.location || data.location_name || null,
      location_name: data.location_name || data.location || null,
      location_coordinates: data.location_coordinates || null,
      weather: data.weather || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      people: Array.isArray(data.people) ? data.people : [],
      extracted_entities: data.extracted_entities || {
        people: data.people || [],
        places: data.location ? [data.location] : [],
        dates: [],
        topics: data.tags || [],
        details: [],
      },
      attachments: data.attachments || [],
      connections: [],
      links: [],
      collection_ids: data.collection_ids || [],
      created_at: now,
      updated_at: now,
    };

    this.memories.unshift(newMemory);

    // Auto-discover links with existing memories based on shared people or tags
    this.discoverAutoLinks(newMemory);

    this.saveAll();
    return newMemory;
  }

  public updateMemory(id: string, updates: Partial<Memory>): Memory | undefined {
    this.init();
    const index = this.memories.findIndex((m) => m.id === id);
    if (index === -1) return undefined;

    const existing = this.memories[index];
    const updated: Memory = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.memories[index] = updated;
    this.saveAll();
    return updated;
  }

  public deleteMemory(id: string): boolean {
    this.init();
    const initialLen = this.memories.length;
    this.memories = this.memories.filter((m) => m.id !== id);
    this.links = this.links.filter(
      (l) => l.source_memory_id !== id && l.target_memory_id !== id
    );
    this.reminders = this.reminders.filter((r) => r.memory_id !== id);

    if (this.memories.length !== initialLen) {
      this.saveAll();
      return true;
    }
    return false;
  }

  public toggleFavorite(id: string): boolean {
    const mem = this.getMemory(id);
    if (!mem) return false;
    this.updateMemory(id, { is_favorite: !mem.is_favorite });
    return !mem.is_favorite;
  }

  public togglePin(id: string): boolean {
    const mem = this.getMemory(id);
    if (!mem) return false;
    this.updateMemory(id, { is_pinned: !mem.is_pinned });
    return !mem.is_pinned;
  }

  // --- AUTO-LINKING KNOWLEDGE GRAPH ---
  private discoverAutoLinks(newMem: Memory) {
    for (const mem of this.memories) {
      if (mem.id === newMem.id) continue;

      const sharedPeople = newMem.people.filter((p) => mem.people.includes(p));
      const sharedTags = newMem.tags.filter((t) => mem.tags.includes(t));

      if (sharedPeople.length > 0) {
        this.links.push({
          id: `lnk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
          user_id: this.profile.id,
          source_memory_id: newMem.id,
          target_memory_id: mem.id,
          link_type: "related",
          similarity_score: 0.85,
          confidence_score: 0.85,
          reasoning: `Shared connection with ${sharedPeople.join(", ")}`,
          connection_reason: `Shared connection with ${sharedPeople.join(", ")}`,
          created_at: new Date().toISOString(),
        });
      } else if (sharedTags.length >= 2) {
        this.links.push({
          id: `lnk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
          user_id: this.profile.id,
          source_memory_id: newMem.id,
          target_memory_id: mem.id,
          link_type: "related",
          similarity_score: 0.75,
          confidence_score: 0.75,
          reasoning: `Thematic overlap across topics: ${sharedTags.join(", ")}`,
          connection_reason: `Thematic overlap across topics: ${sharedTags.join(", ")}`,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  public getLinksForMemory(memoryId: string): (MemoryConnection & { connectedMemory: Memory })[] {
    this.init();
    const relevantLinks = this.links.filter(
      (l) => l.source_memory_id === memoryId || l.target_memory_id === memoryId
    );

    const result: (MemoryConnection & { connectedMemory: Memory })[] = [];
    for (const link of relevantLinks) {
      const targetId = link.source_memory_id === memoryId ? link.target_memory_id : link.source_memory_id;
      const connectedMemory = this.getMemory(targetId);
      if (connectedMemory) {
        result.push({
          ...link,
          connectedMemory,
        });
      }
    }
    return result;
  }

  // --- COLLECTIONS ---
  public getCollections(): (Collection & { count: number })[] {
    this.init();
    return this.collections.map((col) => {
      let count = 0;
      if (col.is_smart && col.filter_criteria) {
        count = this.memories.filter((m) => {
          if (col.filter_criteria?.category && m.category !== col.filter_criteria.category) return false;
          if (col.filter_criteria?.sentiment && m.sentiment !== col.filter_criteria.sentiment) return false;
          if (col.filter_criteria?.people && col.filter_criteria.people.length > 0) {
            const hasPerson = col.filter_criteria.people.some((p) => m.people.includes(p));
            if (!hasPerson) return false;
          }
          if (col.filter_criteria?.tags && col.filter_criteria.tags.length > 0) {
            const hasTag = col.filter_criteria.tags.some((t) => m.tags.includes(t));
            if (!hasTag) return false;
          }
          return true;
        }).length;
      } else {
        count = this.memories.filter((m) => m.collection_ids?.includes(col.id)).length;
      }

      return {
        ...col,
        count,
      };
    });
  }

  public getCollection(id: string): Collection | undefined {
    this.init();
    return this.collections.find((c) => c.id === id);
  }

  public createCollection(data: Partial<Collection>): Collection {
    this.init();
    const id = `col-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newCollection: Collection = {
      id,
      user_id: this.profile.id,
      name: data.name || "New Collection",
      description: data.description || "",
      icon: data.icon || "folder",
      accent_shade: data.accent_shade || data.color || "#8B5CF6",
      color: data.color || data.accent_shade || "#8B5CF6",
      is_smart: Boolean(data.is_smart),
      filter_criteria: data.filter_criteria || null,
      created_at: now,
      updated_at: now,
    };

    this.collections.push(newCollection);
    this.saveAll();
    return newCollection;
  }

  public updateCollection(id: string, updates: Partial<Collection>): Collection | undefined {
    this.init();
    const index = this.collections.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    this.collections[index] = {
      ...this.collections[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveAll();
    return this.collections[index];
  }

  public deleteCollection(id: string): boolean {
    this.init();
    const initialLen = this.collections.length;
    this.collections = this.collections.filter((c) => c.id !== id);
    this.memories.forEach((m) => {
      if (m.collection_ids) {
        m.collection_ids = m.collection_ids.filter((cid) => cid !== id);
      }
    });

    if (this.collections.length !== initialLen) {
      this.saveAll();
      return true;
    }
    return false;
  }

  // --- REMINDERS ---
  public getReminders(): Reminder[] {
    this.init();
    return [...this.reminders].sort(
      (a, b) => new Date(a.remind_at || a.due_date).getTime() - new Date(b.remind_at || b.due_date).getTime()
    );
  }

  public createReminder(data: Partial<Reminder>): Reminder {
    this.init();
    const id = `rem-${Date.now().toString(36)}`;
    const newReminder: Reminder = {
      id,
      user_id: this.profile.id,
      memory_id: data.memory_id || null,
      title: data.title || "Untitled Reminder",
      notes: data.notes || null,
      remind_at: data.remind_at || data.due_date || new Date().toISOString(),
      due_date: data.due_date || data.remind_at || new Date().toISOString(),
      reminder_type: data.reminder_type || "custom",
      recurrence: data.recurrence || data.recurrence_rule || "none",
      recurrence_rule: data.recurrence_rule || data.recurrence || "none",
      is_completed: false,
      memory_title: data.memory_title,
      created_at: new Date().toISOString(),
    };

    this.reminders.push(newReminder);
    this.saveAll();
    return newReminder;
  }

  public toggleReminder(id: string): boolean {
    this.init();
    const reminder = this.reminders.find((r) => r.id === id);
    if (!reminder) return false;
    reminder.is_completed = !reminder.is_completed;
    this.saveAll();
    return reminder.is_completed;
  }

  public deleteReminder(id: string): boolean {
    this.init();
    const initialLen = this.reminders.length;
    this.reminders = this.reminders.filter((r) => r.id !== id);
    if (this.reminders.length !== initialLen) {
      this.saveAll();
      return true;
    }
    return false;
  }

  // --- SEARCH ENGINE & HYBRID RETRIEVAL ---
  public search(
    queryText: string,
    filters?: {
      category?: string;
      sentiment?: string;
      tag?: string;
      person?: string;
      hasAttachments?: boolean;
    }
  ): SearchResult[] {
    this.init();
    const query = queryText.trim().toLowerCase();
    const queryVector = query ? generateDeterministicEmbedding(query) : null;

    let candidateMemories = this.memories;

    if (filters?.category && filters.category !== "all") {
      candidateMemories = candidateMemories.filter((m) => m.category === filters.category);
    }
    if (filters?.sentiment && filters.sentiment !== "all") {
      candidateMemories = candidateMemories.filter((m) => m.sentiment === filters.sentiment);
    }
    if (filters?.tag) {
      candidateMemories = candidateMemories.filter((m) => m.tags.includes(filters.tag!));
    }
    if (filters?.person) {
      candidateMemories = candidateMemories.filter((m) => m.people.includes(filters.person!));
    }
    if (filters?.hasAttachments) {
      candidateMemories = candidateMemories.filter((m) => m.attachments && m.attachments.length > 0);
    }

    if (!query) {
      return candidateMemories.map((m) => ({
        memory: m,
        similarity: 1.0,
        match_reason: "Filter match",
        highlighted_snippet: m.summary || m.content.slice(0, 150),
      }));
    }

    const results: SearchResult[] = [];

    for (const mem of candidateMemories) {
      const fullText = `${mem.title} ${mem.content} ${mem.summary} ${mem.tags.join(" ")} ${mem.people.join(" ")} ${mem.location_name || ""}`.toLowerCase();
      
      let keywordScore = 0;
      const reasons: string[] = [];

      if (fullText.includes(query)) {
        keywordScore += 0.6;
        reasons.push(`Contains exact phrase "${query}"`);
      }

      const queryTokens = query
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
      let matchedTokens = 0;
      for (const token of queryTokens) {
        if (mem.title.toLowerCase().includes(token)) {
          matchedTokens++;
          keywordScore += 0.4;
          reasons.push(`Title matches "${token}"`);
        } else if (mem.tags.some((t) => t.toLowerCase().includes(token))) {
          matchedTokens++;
          keywordScore += 0.35;
          reasons.push(`Tag #${token}`);
        } else if (mem.people.some((p) => p.toLowerCase().includes(token))) {
          matchedTokens++;
          keywordScore += 0.45;
          reasons.push(`Person: ${token}`);
        } else if (fullText.includes(token)) {
          matchedTokens++;
          keywordScore += 0.2;
        }
      }

      let semanticScore = 0;
      if (queryVector) {
        const memVector = generateDeterministicEmbedding(fullText);
        semanticScore = cosineSim(queryVector, memVector);
      }

      const combinedScore = Math.min(
        1.0,
        Math.max(0.0, keywordScore * 0.6 + semanticScore * 0.4)
      );

      if (reasons.length > 0 || (queryTokens.length > 0 && matchedTokens > 0) || semanticScore >= 0.5) {
        const reasonText = reasons.length > 0
          ? reasons.slice(0, 2).join(" • ")
          : `Semantic match (${Math.round(semanticScore * 100)}%)`;

        let snippet = mem.summary || mem.content.slice(0, 180);
        const matchToken = queryTokens[0] || query;
        const matchIndex = mem.content.toLowerCase().indexOf(matchToken);
        if (matchIndex > -1) {
          const start = Math.max(0, matchIndex - 60);
          const end = Math.min(mem.content.length, matchIndex + 120);
          snippet = (start > 0 ? "..." : "") + mem.content.substring(start, end) + (end < mem.content.length ? "..." : "");
        }

        results.push({
          memory: mem,
          similarity: Number(combinedScore.toFixed(3)),
          match_reason: reasonText,
          highlighted_snippet: snippet,
        });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  // --- STATS & REDISCOVER ---
  public getStats() {
    this.init();
    const total = this.memories.length;
    const favorites = this.memories.filter((m) => m.is_favorite).length;
    const pinned = this.memories.filter((m) => m.is_pinned).length;
    const withAttachments = this.memories.filter((m) => m.attachments && m.attachments.length > 0).length;

    const categoryCounts: Record<string, number> = {};
    this.memories.forEach((m) => {
      categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
    });

    const sentimentCounts: Record<string, number> = {};
    this.memories.forEach((m) => {
      if (m.sentiment) {
        sentimentCounts[m.sentiment] = (sentimentCounts[m.sentiment] || 0) + 1;
      }
    });

    const tagCounts: Record<string, number> = {};
    this.memories.forEach((m) => {
      m.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    return {
      total,
      favorites,
      pinned,
      withAttachments,
      categoryCounts,
      sentimentCounts,
      topTags,
    };
  }

  public getRediscoverMemory(): { memory: Memory; reflectionPrompt: string } | null {
    this.init();
    if (this.memories.length === 0) return null;

    const eligible = this.memories.filter((m) => m.sentiment === "reflective" || m.is_favorite);
    const pool = eligible.length > 0 ? eligible : this.memories;
    const index = Math.floor(Math.random() * pool.length);
    const memory = pool[index];

    const prompts = [
      `How has your perspective on this moment evolved since you captured it?`,
      `Does this insight still hold true for you today, or has experience reshaped it?`,
      `What was the quietest feeling in the room when this happened?`,
      `If you could revisit this conversation or place today, what would you notice first?`,
    ];
    const reflectionPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    return { memory, reflectionPrompt };
  }

  // --- PROFILE ---
  public getProfile(): Profile {
    this.init();
    return this.profile;
  }

  public updateProfile(updates: Partial<Profile>): Profile {
    this.init();
    this.profile = {
      ...this.profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveAll();
    return this.profile;
  }

  // --- IMPORT / EXPORT ARCHIVE ---
  public exportData(): string {
    this.init();
    const data = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      profile: this.profile,
      memories: this.memories,
      collections: this.collections,
      reminders: this.reminders,
      links: this.links,
    };
    return JSON.stringify(data, null, 2);
  }

  public importData(jsonString: string): { success: boolean; count: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.memories)) {
        this.memories = parsed.memories;
        if (Array.isArray(parsed.collections)) this.collections = parsed.collections;
        if (Array.isArray(parsed.reminders)) this.reminders = parsed.reminders;
        if (Array.isArray(parsed.links)) this.links = parsed.links;
        if (parsed.profile) this.profile = parsed.profile;
        this.saveAll();
        return { success: true, count: this.memories.length };
      }
      return { success: false, count: 0 };
    } catch {
      return { success: false, count: 0 };
    }
  }

  public resetToDefault() {
    this.memories = [...initialMemories];
    this.collections = [...initialCollections];
    this.reminders = [...initialReminders];
    this.links = [...initialMemoryLinks];
    this.profile = { ...initialProfile };
    this.saveAll();
  }
}

export const shadowStore = new ShadowStore();
