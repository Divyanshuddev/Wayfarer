import { shadowStore } from "@/lib/storage/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || undefined;
    const sentiment = searchParams.get("sentiment") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const person = searchParams.get("person") || undefined;
    const hasAttachments = searchParams.get("has_attachments") === "true";

    const results = shadowStore.search(query, {
      category,
      sentiment,
      tag,
      person,
      hasAttachments,
    });

    return NextResponse.json({
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters } = body;

    const results = shadowStore.search(query || "", filters);

    return NextResponse.json({
      query: query || "",
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed", details: String(error) },
      { status: 500 }
    );
  }
}
