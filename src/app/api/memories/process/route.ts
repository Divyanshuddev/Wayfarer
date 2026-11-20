import { createEmbedding } from "@/lib/ai/embeddings";
import { extractEntitiesFromMemory, performVisionOcr } from "@/lib/ai/extractor";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, image_url, file_name } = body;

    if (!content && !image_url) {
      return NextResponse.json(
        { error: "Content or image is required for memory processing" },
        { status: 400 }
      );
    }

    let combinedText = content || "";
    let ocrResult = "";

    // If an image URL / base64 is provided, run vision OCR
    if (image_url) {
      ocrResult = await performVisionOcr(image_url);
      combinedText = `${combinedText}\n[Image Analysis: ${ocrResult}]`.trim();
    }

    // 1. Structured metadata extraction
    const extracted = await extractEntitiesFromMemory(combinedText);

    // 2. Vector embedding generation
    const embedding = await createEmbedding(
      `${extracted.title} ${extracted.summary} ${combinedText} ${extracted.tags.join(" ")} ${extracted.people.join(" ")}`
    );

    return NextResponse.json({
      success: true,
      extracted,
      embedding,
      ocrResult,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Memory processing error:", error);
    return NextResponse.json(
      { error: "Failed to process memory", details: String(error) },
      { status: 500 }
    );
  }
}
