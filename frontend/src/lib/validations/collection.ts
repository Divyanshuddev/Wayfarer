import { z } from "zod";
import { memoryCategories, memorySentiments } from "./memory";

export const collectionFilterCriteriaSchema = z.object({
  tags: z.array(z.string()).optional(),
  category: z.enum(memoryCategories).optional(),
  people: z.array(z.string()).optional(),
  sentiment: z.enum(memorySentiments).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).default(""),
  icon: z.string().default("folder"),
  color: z.string().default("#8b5cf6"),
  is_smart: z.boolean().default(false),
  filter_criteria: collectionFilterCriteriaSchema.nullable().optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
