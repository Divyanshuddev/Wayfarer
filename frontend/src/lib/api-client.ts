import {
  Collection,
  Memory,
  MemoryCategory,
  MemorySentiment,
  Profile,
  Reminder,
  SearchResult,
} from "@/types";
import { shadowStore } from "./storage/store";
import { createClient, isSupabaseConfigured } from "./supabase/client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";

class ApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
          return headers;
        }
      } catch {
        // ignore
      }
    }

    // Default demo token
    headers["Authorization"] = "Bearer archivist-demo-jwt";
    return headers;
  }

  // --- DASHBOARD ---
  async getDashboard() {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/dashboard`, { headers });
      if (res.ok) return await res.json();
    } catch {
      // Fallback to local store
    }

    const stats = shadowStore.getStats();
    const rediscover = shadowStore.getRediscoverMemory();
    const memories = shadowStore.getMemories();
    const reminders = shadowStore.getReminders();

    return {
      stats: {
        total_memories: stats.total,
        favorites: stats.favorites,
        pinned: stats.pinned,
        with_attachments: stats.withAttachments,
        grounding_score: 100,
        category_counts: stats.categoryCounts,
        sentiment_counts: stats.sentimentCounts,
      },
      rediscover: rediscover
        ? {
            memory: rediscover.memory,
            reflection_prompt: rediscover.reflectionPrompt,
          }
        : null,
      recent_memories: memories.slice(0, 4),
      upcoming_reminders: reminders.slice(0, 4),
    };
  }

  // --- MEMORIES ---
  async getMemories(filters?: {
    category?: string;
    sentiment?: string;
    tag?: string;
    person?: string;
    is_pinned?: boolean;
    is_favorite?: boolean;
  }): Promise<Memory[]> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      if (filters?.category) params.append("category", filters.category);
      if (filters?.sentiment) params.append("sentiment", filters.sentiment);
      if (filters?.tag) params.append("tag", filters.tag);
      if (filters?.person) params.append("person", filters.person);
      if (filters?.is_pinned !== undefined)
        params.append("is_pinned", String(filters.is_pinned));
      if (filters?.is_favorite !== undefined)
        params.append("is_favorite", String(filters.is_favorite));

      const res = await fetch(`${API_BASE_URL}/memories?${params.toString()}`, {
        headers,
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    return shadowStore.getMemories();
  }

  async getMemory(id: string): Promise<Memory | null> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/memories/${id}`, { headers });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return shadowStore.getMemory(id) || null;
  }

  async createMemory(data: Partial<Memory>): Promise<Memory> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/memories`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        shadowStore.createMemory(created);
        return created;
      }
    } catch {
      // fallback
    }
    return shadowStore.createMemory(data);
  }

  async uploadMemoryWithFile(formData: FormData): Promise<Memory> {
    try {
      const headers: Record<string, string> = {};
      const authHeaders = await this.getAuthHeaders();
      if ("Authorization" in authHeaders) {
        headers["Authorization"] = (authHeaders as any)["Authorization"];
      }

      const res = await fetch(`${API_BASE_URL}/memories/upload`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (res.ok) {
        const created = await res.json();
        shadowStore.createMemory(created);
        return created;
      }
    } catch {
      // fallback
    }

    const title = (formData.get("title") as string) || "Uploaded Memory";
    const content = (formData.get("content") as string) || "File attachment";
    return shadowStore.createMemory({ title, content });
  }

  async updateMemory(
    id: string,
    updates: Partial<Memory>
  ): Promise<Memory | null> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/memories/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        shadowStore.updateMemory(id, updated);
        return updated;
      }
    } catch {
      // fallback
    }
    return shadowStore.updateMemory(id, updates) || null;
  }

  async deleteMemory(id: string): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/memories/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok || res.status === 204) {
        shadowStore.deleteMemory(id);
        return true;
      }
    } catch {
      // fallback
    }
    return shadowStore.deleteMemory(id);
  }

  // --- SEARCH ---
  async search(query: string, filters?: any): Promise<SearchResult[]> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, filters }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.results;
      }
    } catch {
      // fallback
    }
    return shadowStore.search(query, filters);
  }

  // --- CHAT ---
  async chat(message: string): Promise<{
    answer: string;
    citations: any[];
    is_grounded: boolean;
    unfound: boolean;
  }> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    // Local grounded synthesizer
    const results = shadowStore.search(message);
    const relevant = results.filter((r) => r.similarity >= 0.35);

    if (relevant.length === 0) {
      return {
        answer:
          "I could not find any saved memories or details in your archive regarding this question.",
        citations: [],
        is_grounded: true,
        unfound: true,
      };
    }

    const top = relevant[0].memory;
    return {
      answer: `According to your memory [Memory #${top.id}: "${top.title}"]:\n\n"${top.summary || top.content.slice(0, 200)}"`,
      citations: relevant.slice(0, 3).map((r) => ({
        memory_id: r.memory.id,
        title: r.memory.title,
        date: new Date(r.memory.memory_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        snippet: r.memory.summary || r.memory.content.slice(0, 100),
      })),
      is_grounded: true,
      unfound: false,
    };
  }

  // --- COLLECTIONS ---
  async getCollections(): Promise<(Collection & { memory_count: number })[]> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/collections`, { headers });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return shadowStore.getCollections().map((c) => ({
      ...c,
      memory_count: c.count,
    }));
  }

  async createCollection(data: Partial<Collection>): Promise<Collection> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/collections`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        shadowStore.createCollection(created);
        return created;
      }
    } catch {
      // fallback
    }
    return shadowStore.createCollection(data);
  }

  // --- REMINDERS ---
  async getReminders(): Promise<Reminder[]> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/reminders`, { headers });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return shadowStore.getReminders();
  }

  async createReminder(data: Partial<Reminder>): Promise<Reminder> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/reminders`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        shadowStore.createReminder(created);
        return created;
      }
    } catch {
      // fallback
    }
    return shadowStore.createReminder({
      ...data,
      title: data.title || "Untitled Reminder",
    });
  }

  async toggleReminder(id: string): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/reminders/${id}/toggle`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        shadowStore.toggleReminder(id);
        return true;
      }
    } catch {
      // fallback
    }
    return shadowStore.toggleReminder(id);
  }

  async deleteReminder(id: string): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok || res.status === 204) {
        shadowStore.deleteReminder(id);
        return true;
      }
    } catch {
      // fallback
    }
    return shadowStore.deleteReminder(id);
  }

  // --- SETTINGS & PROFILE ---
  async getProfile(): Promise<Profile> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/settings/profile`, { headers });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return shadowStore.getProfile();
  }

  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/settings/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updates),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return shadowStore.updateProfile(updates);
  }
}

export const apiClient = new ApiClient();
