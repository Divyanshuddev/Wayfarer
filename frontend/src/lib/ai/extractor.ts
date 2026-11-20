import { ExtractedEntities, MemoryCategory, MemorySentiment } from "@/types/database";
import { isOpenAIConfigured, openai } from "./openai";

// Heuristic fallback NLP extraction when OpenAI API key is not configured
export function extractEntitiesLocal(text: string): ExtractedEntities {
  const cleaned = text.trim();
  const lines = cleaned.split("\n").filter(Boolean);
  const firstLine = lines[0] || "Untitled Memory";
  const title = firstLine.length > 70 ? firstLine.slice(0, 67) + "..." : firstLine;

  // Determine category by keywords
  const lower = cleaned.toLowerCase();
  let category: MemoryCategory = "thought";
  if (lower.includes("dr.") || lower.includes("spoke with") || lower.includes("talked to") || lower.includes("said") || lower.includes("meeting")) {
    category = "conversation";
  } else if (lower.includes("read") || lower.includes("book") || lower.includes("quote") || lower.includes("chapter") || lower.includes("author")) {
    category = "reading";
  } else if (lower.includes("ran") || lower.includes("visited") || lower.includes("flight") || lower.includes("hotel") || lower.includes("trip")) {
    category = "event";
  } else if (lower.includes("project") || lower.includes("team") || lower.includes("strategy") || lower.includes("roadmap") || lower.includes("deploy")) {
    category = "work";
  } else if (lower.includes("idea") || lower.includes("concept") || lower.includes("what if") || lower.includes("invention")) {
    category = "idea";
  } else if (lower.includes("watched") || lower.includes("movie") || lower.includes("podcast") || lower.includes("album") || lower.includes("song")) {
    category = "media";
  }

  // Determine sentiment
  let sentiment: MemorySentiment = "neutral";
  const positiveWords = ["great", "wonderful", "mastery", "silence", "delight", "love", "clarity", "vibrant", "strong", "clean", "beautiful"];
  const reflectiveWords = ["ponder", "stillness", "entropy", "virtue", "meaning", "memory", "philosoph", "insight", "heian", "quiet"];
  const negativeWords = ["failed", "stress", "broken", "exhausted", "pain", "sad", "disaster", "urgent"];

  let posCount = positiveWords.filter((w) => lower.includes(w)).length;
  let refCount = reflectiveWords.filter((w) => lower.includes(w)).length;
  let negCount = negativeWords.filter((w) => lower.includes(w)).length;

  if (refCount >= 2 || refCount > posCount) {
    sentiment = "reflective";
  } else if (posCount > negCount && posCount > 0) {
    sentiment = "positive";
  } else if (negCount > posCount) {
    sentiment = "negative";
  }

  // Extract tags (hashtag or frequent themes)
  const tagSet = new Set<string>();
  const explicitTags = cleaned.match(/#[a-zA-Z0-9_-]+/g);
  if (explicitTags) {
    explicitTags.forEach((t) => tagSet.add(t.replace("#", "").toLowerCase()));
  }

  const potentialTags = [
    "ai", "tech", "design", "travel", "coffee", "books", "minimalism",
    "architecture", "fitness", "running", "science", "kyoto", "japan",
    "san-francisco", "philosophy", "espresso", "biology"
  ];
  potentialTags.forEach((pt) => {
    if (lower.includes(pt)) tagSet.add(pt);
  });

  // Extract people names (capitalized words following with, to, and, Dr.)
  const peopleSet = new Set<string>();
  const peopleMatches = cleaned.match(/(?:with|and|Dr\.|meeting)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g);
  if (peopleMatches) {
    peopleMatches.forEach((m) => {
      const name = m.replace(/^(?:with|and|meeting)\s+/i, "").trim();
      if (name && name.length > 2 && !["The", "A", "An", "He", "She"].includes(name)) {
        peopleSet.add(name);
      }
    });
  }

  // Detect potential reminders (e.g., "birthday on Dec 12", "deliver prototype by Nov 28")
  const detected_reminders: { title: string; due_date: string; reminder_type: "birthday" | "follow_up" | "custom" }[] = [];
  if (lower.includes("birthday")) {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 20);
    detected_reminders.push({
      title: `Birthday mentioned in memory: "${title}"`,
      due_date: nextMonth.toISOString(),
      reminder_type: "birthday",
    });
  } else if (lower.includes("remember to") || lower.includes("need to") || lower.includes("deliver") || lower.includes("before")) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    detected_reminders.push({
      title: `Follow-up from memory: "${title}"`,
      due_date: nextWeek.toISOString(),
      reminder_type: "follow_up",
    });
  }

  // Summary
  const summary = lines.slice(0, 2).join(" ").slice(0, 160) + (cleaned.length > 160 ? "..." : "");

  return {
    title,
    summary,
    category,
    sentiment,
    tags: Array.from(tagSet).slice(0, 6),
    people: Array.from(peopleSet).slice(0, 5),
    location: null,
    memory_date: null,
    detected_reminders,
  };
}

export async function extractEntitiesFromMemory(text: string): Promise<ExtractedEntities> {
  if (!isOpenAIConfigured()) {
    return extractEntitiesLocal(text);
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are Shadow's cognitive metadata extraction engine.
Given the user's raw memory text, extract structured metadata strictly adhering to the JSON schema:
{
  "title": "Concise evocative title (max 60 chars)",
  "summary": "1-2 sentence core distillation (max 180 chars)",
  "category": "thought" | "event" | "conversation" | "media" | "reading" | "work" | "personal" | "location" | "idea",
  "sentiment": "positive" | "neutral" | "negative" | "reflective",
  "tags": ["lowercase-kebab-tag", ...],
  "people": ["Full Name", ...],
  "location": "Location name or null",
  "memory_date": "ISO 8601 date string if explicitly referenced, otherwise null",
  "detected_reminders": [
    {
      "title": "Reminder title",
      "due_date": "ISO 8601 string",
      "reminder_type": "birthday" | "anniversary" | "follow_up" | "memory_recurrence" | "custom"
    }
  ]
}`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      title: parsed.title || text.slice(0, 50),
      summary: parsed.summary || text.slice(0, 150),
      category: parsed.category || "thought",
      sentiment: parsed.sentiment || "neutral",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      people: Array.isArray(parsed.people) ? parsed.people : [],
      location: parsed.location || null,
      memory_date: parsed.memory_date || null,
      detected_reminders: Array.isArray(parsed.detected_reminders) ? parsed.detected_reminders : [],
    };
  } catch (error) {
    console.error("OpenAI extraction failed, using heuristic fallback:", error);
    return extractEntitiesLocal(text);
  }
}

export async function performVisionOcr(base64OrUrl: string): Promise<string> {
  if (!isOpenAIConfigured()) {
    return "Simulated Optical Character Recognition & Scene Description: Visual snapshot preserved in memory.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Carefully transcribe any visible handwritten or printed text in this image, followed by a brief 1-sentence description of the visual scene.",
            },
            {
              type: "image_url",
              image_url: { url: base64OrUrl },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("Vision OCR error:", err);
    return "Extracted visual memory note.";
  }
}
