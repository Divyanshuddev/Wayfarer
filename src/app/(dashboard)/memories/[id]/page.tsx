import { MemoryDetailView } from "@/components/memories/MemoryDetailView";
import React from "react";

export const dynamic = "force-dynamic";

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MemoryDetailView memoryId={id} />;
}
