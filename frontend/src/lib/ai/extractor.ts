import { ExtractedEntities, MemoryCategory, MemorySentiment } from "@/types/database";
import { isOpenAIConfigured, openai } from "./openai";

// Heuristic fallback NLP extraction when OpenAI API key is not configured
export function extractEntitiesLocal(text: string): ExtractedEntities {
  const cleaned = text.trim();
  const lines = cleaned.split("\n").filter(Boolean);
  const firstLine = lines[0] || "Untitled Memory";
  const title = firstLine.length > 70 ? firstLine.slice(0, 67) + "..." : firstLine;

  const lower = cleaned.toLowerCase();
  let category: MemoryCategory = "Ideas & Projects";
  if (lower.includes("dr.") || lower.includes("spoke with") || lower.includes("talked to") || lower.includes("said") || lower.includes("meeting") || lower.includes("chat")) {
    category = "Conversations";
  } else if (lower.includes("read") || lower.includes("book") || lower.includes("quote") || lower.includes("chapter") || lower.includes("author") || lower.includes("movie") || lower.includes("podcast")) {
    category = "Media & Recommendations";
  } else if (lower.includes("ran") || lower.includes("visited") || lower.includes("flight") || lower.includes("hotel") || lower.includes("trip") || lower.includes("kyoto") || lower.includes("japan")) {
    category = "Places & Travel";
  } else if (lower.includes("receipt") || lower.includes("invoice") || lower.includes("tax") || lower.includes("contract") || lower.includes("pdf")) {
    category = "Documents & Receipts";
  } else if (lower.includes("run") || lower.includes("fitness") || lower.includes("health") || lower.includes("doctor") || lower.includes("workout")) {
    category = "Health & Wellness";
  } else if (lower.includes("birthday") || lower.includes("anniversary") || lower.includes("graduat") || lower.includes("wedding")) {
    category = "Life Milestones";
  } else if (lower.includes("friend") || lower.includes("dinner") || lower.includes("alex") || lower.includes("maya") || lower.includes("rahul")) {
    category = "People & Experiences";
  }

  // Determine sentiment
  let sentiment: MemorySentiment = "neutral";
  const positiveWords = ["great", "wonderful", "mastery", "silence", "delight", "love", "clarity", "vibrant", "strong", "clean", "beautiful"];
  const reflectiveWords = ["ponder", "stillness", "entropy", "virtue", "meaning", "memory", "philosoph", "insight", "heian", "quiet"];
  const negativeWords = ["failed", "stress", "broken", "exhausted", "pain", "sad", "disaster", "urgent"];

  const posCount = positiveWords.filter((w) => lower.includes(w)).length;
  const refCount = reflectiveWords.filter((w) => lower.includes(w)).length;
  const negCount = negativeWords.filter((w) => lower.includes(w)).length;

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

  // Extract people names
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

  // Extract places
  const placesSet = new Set<string>();
  ["Kyoto", "San Francisco", "Zurich", "Berlin", "Tokyo", "Munich"].forEach((pc) => {
    if (lower.includes(pc.toLowerCase())) placesSet.add(pc);
  });

  // Detect potential reminders
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

  const summary = lines.slice(0, 2).join(" ").slice(0, 160) + (cleaned.length > 160 ? "..." : "");

  return {
    title,
    summary,
    category,
    sentiment,
    tags: Array.from(tagSet).slice(0, 6),
    people: Array.from(peopleSet).slice(0, 5),
    places: Array.from(placesSet).slice(0, 3),
    dates: [],
    topics: Array.from(tagSet).slice(0, 5),
    details: [summary],
    location: Array.from(placesSet)[0] || null,
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
  "category": "People & Experiences" | "Ideas & Projects" | "Places & Travel" | "Documents & Receipts" | "Media & Recommendations" | "Health & Wellness" | "Conversations" | "Life Milestones",
  "sentiment": "positive" | "neutral" | "negative" | "reflective",
  "tags": ["lowercase-kebab-tag", ...],
  "people": ["Full Name", ...],
  "places": ["Location name", ...],
  "location": "Location name or null",
  "memory_date": "ISO 8601 date string if explicitly referenced, otherwise null",
  "detected_reminders": [
    {
      "title": "Reminder title",
      "due_date": "ISO 8601 string",
      "reminder_type": "birthday" | "anniversary" | "follow_up" | "event" | "custom"
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
    const people = Array.isArray(parsed.people) ? parsed.people : [];
    const places = Array.isArray(parsed.places) ? parsed.places : (parsed.location ? [parsed.location] : []);
    const tags = Array.isArray(parsed.tags) ? parsed.tags : [];

    return {
      title: parsed.title || text.slice(0, 50),
      summary: parsed.summary || text.slice(0, 150),
      category: parsed.category || "Ideas & Projects",
      sentiment: parsed.sentiment || "neutral",
      tags,
      people,
      places,
      dates: parsed.memory_date ? [parsed.memory_date] : [],
      topics: tags,
      details: [parsed.summary || ""],
      location: parsed.location || places[0] || null,
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
