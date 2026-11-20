import { Memory, MemoryCitation } from "@/types/database";
import { shadowStore } from "../storage/store";
import { isOpenAIConfigured, openai } from "./openai";

export interface GroundedRAGResponse {
  answer: string;
  citations: MemoryCitation[];
  isGrounded: boolean;
  unfound: boolean;
}

export const STRICT_GROUNDING_SYSTEM_PROMPT = `You are Shadow, an AI personal memory assistant. Tagline: "Your life, remembered."
Your sole duty is to help the user recall and understand details from their private memory archive.

CRITICAL GROUNDING RULES:
1. You must ONLY answer using information explicitly provided in the "RETRIEVED MEMORIES" section below.
2. NEVER extrapolate, hypothesize, or invent facts, people, events, dates, or details not present in the memories.
3. When referencing information, ALWAYS provide an explicit citation using the bracket format [Memory #<id>: "<title>"].
4. STRICT ABSENCE RULE: If the answer cannot be found in the provided memories, or if NO relevant memories exist, you MUST reply:
   "I could not find any saved memories or details in your archive regarding this question."
   Do NOT attempt to guess, fill in blanks from general knowledge, or fabricate an answer.
5. Maintain a calm, respectful, retro-minimalist tone. Keep answers concise, factual, and direct.`;

export async function answerGroundedQuery(
  userQuery: string,
  memoriesList?: Memory[]
): Promise<GroundedRAGResponse> {
  const memories = memoriesList || shadowStore.getMemories();
  
  // 1. Search for relevant candidate memories using hybrid retrieval
  const searchResults = shadowStore.search(userQuery);
  const relevantResults = searchResults.filter((r) => r.similarity >= 0.35).slice(0, 5);

  if (relevantResults.length === 0) {
    return {
      answer: "I could not find any saved memories or details in your archive regarding this question.",
      citations: [],
      isGrounded: true,
      unfound: true,
    };
  }

  const retrievedMemories = relevantResults.map((r) => r.memory);
  const citations: MemoryCitation[] = retrievedMemories.map((m) => ({
    memory_id: m.id,
    title: m.title,
    date: new Date(m.memory_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    snippet: m.summary || m.content.slice(0, 140),
  }));

  // Format memories context
  const memoriesContext = retrievedMemories
    .map(
      (m, idx) =>
        `--- MEMORY #${m.id} ---
Title: ${m.title}
Date: ${new Date(m.memory_date).toISOString()}
Category: ${m.category} | Sentiment: ${m.sentiment}
Location: ${m.location_name || "Unspecified"}
People: ${m.people.join(", ") || "None"}
Tags: ${m.tags.join(", ") || "None"}
Attachments: ${m.attachments?.map((a) => `${a.file_name} (OCR: ${a.extracted_text || "None"})`).join("; ") || "None"}
Content:
${m.content}
-------------------------`
    )
    .join("\n\n");

  if (!isOpenAIConfigured()) {
    // High-fidelity local Grounded Synthesizer
    const topMatch = retrievedMemories[0];
    const topDate = new Date(topMatch.memory_date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    let answer = `According to your memory from ${topDate}, [Memory #${topMatch.id}: "${topMatch.title}"]: ${topMatch.summary}\n\n`;
    
    if (topMatch.location_name) {
      answer += `• Location recorded: ${topMatch.location_name}\n`;
    }
    if (topMatch.people.length > 0) {
      answer += `• People present: ${topMatch.people.join(", ")}\n`;
    }
    if (retrievedMemories.length > 1) {
      const secondMatch = retrievedMemories[1];
      answer += `\nYou also noted a related reflection in [Memory #${secondMatch.id}: "${secondMatch.title}"]: "${secondMatch.summary}"`;
    }

    return {
      answer,
      citations,
      isGrounded: true,
      unfound: false,
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        { role: "system", content: STRICT_GROUNDING_SYSTEM_PROMPT },
        {
          role: "user",
          content: `RETRIEVED MEMORIES:\n${memoriesContext}\n\nUSER QUESTION: "${userQuery}"`,
        },
      ],
    });

    const assistantAnswer =
      response.choices[0]?.message?.content ||
      "I could not find any saved memories or details in your archive regarding this question.";

    const isUnfound = assistantAnswer.includes("could not find any saved memories");

    return {
      answer: assistantAnswer,
      citations: isUnfound ? [] : citations,
      isGrounded: true,
      unfound: isUnfound,
    };
  } catch (error) {
    console.error("OpenAI RAG query failed:", error);
    return {
      answer: `Found ${relevantResults.length} relevant memory record(s) matching your inquiry: "${retrievedMemories[0].title}".`,
      citations,
      isGrounded: true,
      unfound: false,
    };
  }
}
