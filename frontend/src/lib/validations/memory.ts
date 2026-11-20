import { z } from "zod";

export const memoryTypes = [
  "note",
  "photo",
  "video",
  "document",
  "voice",
  "conversation",
  "link",
  "event",
] as const;

export const memoryCategories = [
  "People & Experiences",
  "Ideas & Projects",
  "Places & Travel",
  "Documents & Receipts",
  "Media & Recommendations",
  "Health & Wellness",
  "Conversations",
  "Life Milestones",
] as const;

export const memorySentiments = [
  "positive",
  "neutral",
  "negative",
  "reflective",
] as const;

export const createMemorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().optional().default(""),
  content: z.string().optional(),
  memory_type: z.enum(memoryTypes).default("note"),
  category: z.string().default("Ideas & Projects"),
  memory_date: z.string().optional().default(() => new Date().toISOString()),
  is_pinned: z.boolean().default(false),
  is_favorite: z.boolean().default(false),
  location: z.string().nullable().optional(),
  location_name: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  people: z.array(z.string()).default([]),
  ai_summary: z.string().optional().default(""),
  personal_notes: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  collection_ids: z.array(z.string()).optional().default([]),
});

export const updateMemorySchema = createMemorySchema.partial();

export const searchMemoriesSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  memory_type: z.enum(memoryTypes).optional(),
  tag: z.string().optional(),
  person: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  is_pinned: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  has_attachments: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;
export type SearchMemoriesInput = z.infer<typeof searchMemoriesSchema>;
