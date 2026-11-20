import { z } from "zod";

export const memoryCategories = [
  "thought",
  "event",
  "conversation",
  "media",
  "reading",
  "work",
  "personal",
  "location",
  "idea",
] as const;

export const memorySentiments = [
  "positive",
  "neutral",
  "negative",
  "reflective",
] as const;

export const memorySourceTypes = [
  "quick_note",
  "voice",
  "image_ocr",
  "document",
  "chat",
] as const;

export const createMemorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  content: z.string().min(1, "Memory content cannot be empty"),
  summary: z.string().optional().default(""),
  category: z.enum(memoryCategories).default("thought"),
  sentiment: z.enum(memorySentiments).default("neutral"),
  memory_date: z.string().datetime().optional().default(() => new Date().toISOString()),
  is_pinned: z.boolean().default(false),
  is_favorite: z.boolean().default(false),
  location_name: z.string().nullable().optional(),
  weather: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  people: z.array(z.string()).default([]),
  source_type: z.enum(memorySourceTypes).default("quick_note"),
  collection_ids: z.array(z.string()).optional().default([]),
});

export const updateMemorySchema = createMemorySchema.partial();

export const searchMemoriesSchema = z.object({
  query: z.string().optional(),
  category: z.enum(memoryCategories).optional(),
  sentiment: z.enum(memorySentiments).optional(),
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
