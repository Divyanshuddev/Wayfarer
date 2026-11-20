import { z } from "zod";

export const reminderTypes = [
  "birthday",
  "anniversary",
  "follow_up",
  "memory_recurrence",
  "custom",
] as const;

export const recurrenceRules = [
  "none",
  "yearly",
  "monthly",
  "weekly",
] as const;

export const createReminderSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  due_date: z.string().min(1, "Due date is required"),
  reminder_type: z.enum(reminderTypes).default("custom"),
  memory_id: z.string().uuid().nullable().optional(),
  recurrence_rule: z.enum(recurrenceRules).default("none"),
  is_completed: z.boolean().default(false),
});

export const updateReminderSchema = createReminderSchema.partial();

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
