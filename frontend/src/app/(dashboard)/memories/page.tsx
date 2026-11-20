"use client";

import { MemoryCard } from "@/components/memories/MemoryCard";
import { shadowStore } from "@/lib/storage/store";
import { memoryCategories, memorySentiments } from "@/lib/validations/memory";
import { Memory } from "@/types/database";
import {
  ArrowUpDown,
  Filter,
  Heart,
  Image as ImageIcon,
  Pin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export default function AllMemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [filterPinned, setFilterPinned] = useState(false);
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterWithPhotos, setFilterWithPhotos] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  useEffect(() => {
    const update = () => setMemories(shadowStore.getMemories());
    update();
    return shadowStore.subscribe(update);
  }, []);

  // Filter memories
  const filtered = memories.filter((m) => {
    if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
    if (selectedSentiment !== "all" && m.sentiment !== selectedSentiment) return false;
    if (filterPinned && !m.is_pinned) return false;
    if (filterFavorite && !m.is_favorite) return false;
    if (filterWithPhotos && (!m.attachments || m.attachments.length === 0)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        m.people.some((p) => p.toLowerCase().includes(q)) ||
        (m.location_name && m.location_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Sort memories
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.memory_date).getTime() - new Date(b.memory_date).getTime();
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">
            Memory Archive
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-serif">
            Browse, filter, and inspect moments recorded across time.
          </p>
        </div>
        <div className="text-xs font-mono-retro text-purple-400 bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-800/40 w-fit">
          {sorted.length} / {memories.length} Memories Displayed
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-3">
        {/* Search input & Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by keyword, topic, person, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121120] border border-[#26233e] focus:border-purple-500/60 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#121120] border border-[#26233e] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-mono-retro"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono-retro transition-colors ${
              selectedCategory === "all"
                ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                : "bg-[#141224] text-gray-400 hover:text-gray-200"
            }`}
          >
            All
          </button>
          {memoryCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono-retro transition-colors uppercase ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "bg-[#141224] text-gray-400 hover:text-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Filter Toggles */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[#1c1a2e] text-xs font-mono-retro">
          <button
            onClick={() => setFilterPinned(!filterPinned)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              filterPinned
                ? "bg-purple-950 text-purple-300 border-purple-500/50"
                : "bg-[#141222] text-gray-400 border-transparent hover:text-gray-200"
            }`}
          >
            <Pin className="w-3 h-3" />
            <span>Pinned</span>
          </button>

          <button
            onClick={() => setFilterFavorite(!filterFavorite)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              filterFavorite
                ? "bg-rose-950/60 text-rose-300 border-rose-500/50"
                : "bg-[#141222] text-gray-400 border-transparent hover:text-gray-200"
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>Favorites</span>
          </button>

          <button
            onClick={() => setFilterWithPhotos(!filterWithPhotos)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              filterWithPhotos
                ? "bg-amber-950/60 text-amber-300 border-amber-500/50"
                : "bg-[#141222] text-gray-400 border-transparent hover:text-gray-200"
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>With Photos</span>
          </button>
        </div>
      </div>

      {/* Memories Cards Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((m) => (
            <MemoryCard
              key={m.id}
              memory={m}
              onToggleFavorite={(id) => shadowStore.toggleFavorite(id)}
              onTogglePin={(id) => shadowStore.togglePin(id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-3">
          <p className="text-sm font-mono-retro text-gray-400">
            No memories match your active filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedSentiment("all");
              setFilterPinned(false);
              setFilterFavorite(false);
              setFilterWithPhotos(false);
            }}
            className="text-xs font-mono-retro text-purple-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
