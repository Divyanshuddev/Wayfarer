import { generateDeterministicEmbedding } from "../storage/store";
import { isOpenAIConfigured, openai } from "./openai";

export async function createEmbedding(text: string): Promise<number[]> {
  if (!isOpenAIConfigured()) {
    // Generate 1536-dimensional deterministic pseudo-embedding
    const base = generateDeterministicEmbedding(text);
    const full1536 = new Array(1536).fill(0);
    for (let i = 0; i < 1536; i++) {
      const baseVal = base[i % base.length] || 0;
      const freqFactor = Math.sin((i + 1) * 0.17);
      full1536[i] = Number((baseVal * 0.8 + freqFactor * 0.2).toFixed(6));
    }
    // Normalize 1536 vector
    const norm = Math.sqrt(full1536.reduce((sum, v) => sum + v * v, 0));
    return norm > 0 ? full1536.map((v) => Number((v / norm).toFixed(6))) : full1536;
  }

  try {
    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
      input: text.slice(0, 8000),
      encoding_format: "float",
    });

    return response.data[0]?.embedding || [];
  } catch (err) {
    console.error("OpenAI embedding creation failed, using deterministic fallback:", err);
    return generateDeterministicEmbedding(text);
  }
}
