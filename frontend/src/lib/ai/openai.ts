import OpenAI from "openai";

export function isOpenAIConfigured(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY.startsWith("sk-") &&
      !process.env.OPENAI_API_KEY.includes("your-openai-api-key")
  );
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-initialization",
});
