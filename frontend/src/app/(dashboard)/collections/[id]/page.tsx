import { MemoryCard } from "@/components/memories/MemoryCard";
import { shadowStore } from "@/lib/storage/store";
import { ArrowLeft, Folder, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";

export default async function SingleCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = shadowStore.getCollection(id);

  if (!collection) {
    notFound();
  }

  // Retrieve memories belonging to this collection
  const allMemories = shadowStore.getMemories();
  const memories = collection.is_smart && collection.filter_criteria
    ? allMemories.filter((m) => {
        const crit = collection.filter_criteria!;
        if (crit.category && m.category !== crit.category) return false;
        if (crit.sentiment && m.sentiment !== crit.sentiment) return false;
        if (crit.people && crit.people.length > 0) {
          const match = crit.people.some((p) => m.people.includes(p));
          if (!match) return false;
        }
        if (crit.tags && crit.tags.length > 0) {
          const match = crit.tags.some((t) => m.tags.includes(t));
          if (!match) return false;
        }
        return true;
      })
    : allMemories.filter((m) => m.collection_ids?.includes(collection.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 text-xs font-mono-retro text-gray-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Collections</span>
        </Link>
      </div>

      {/* Collection Header */}
      <div className="p-6 rounded-2xl bg-[#0f0e1c] border border-purple-900/30 space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: collection.color }}
          />
          <span className="text-xs font-mono-retro uppercase tracking-wider text-purple-300">
            {collection.is_smart ? "Smart Collection" : "Collection Archive"}
          </span>
          {collection.is_smart && (
            <span className="flex items-center gap-1 text-[10px] font-mono-retro text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Auto-Filtered</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-100">
          {collection.name}
        </h1>

        <p className="text-sm text-gray-300 font-serif leading-relaxed">
          {collection.description || "No description provided."}
        </p>

        <div className="pt-2 text-xs font-mono-retro text-gray-400">
          {memories.length} memory records preserved
        </div>
      </div>

      {/* Memories Grid */}
      {memories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((m) => (
            <MemoryCard key={m.id} memory={m} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-2">
          <p className="text-sm font-mono-retro text-gray-400">
            No memories currently in this collection.
          </p>
          <p className="text-xs text-gray-400 font-serif">
            Assign memories to this collection during creation or edit.
          </p>
        </div>
      )}
    </div>
  );
}
