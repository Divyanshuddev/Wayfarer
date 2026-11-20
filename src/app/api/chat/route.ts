import { answerGroundedQuery } from "@/lib/ai/rag";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, memories } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message string is required" },
        { status: 400 }
      );
    }

    const result = await answerGroundedQuery(message, memories);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      citations: result.citations,
      isGrounded: result.isGrounded,
      unfound: result.unfound,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate grounded answer",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
