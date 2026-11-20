import OpenAI from "openai";

export function isOpenAIConfigured(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY.startsWith("sk-") &&
      !process.env.OPENAI_API_KEY.includes("your-openai-api-key")
  );
}

// In Next.js client components and SSR, dangerouslyAllowBrowser allows evaluation
// without throwing an Uncaught Error in the browser context.
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-initialization",
  dangerouslyAllowBrowser: true,
});
