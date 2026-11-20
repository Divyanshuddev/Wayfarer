"use client";

import { MemoryCard } from "@/components/memories/MemoryCard";
import { shadowStore } from "@/lib/storage/store";
import { memoryCategories, memoryTypes } from "@/lib/validations/memory";
import { Memory, MemoryCategory, MemoryType } from "@/types/database";
import {
  ArrowUpDown,
  Filter,
  Grid,
  Heart,
  Image as ImageIcon,
  LayoutGrid,
  LayoutList,
  Pin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export default function AllMemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterPinned, setFilterPinned] = useState(false);
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterWithPhotos, setFilterWithPhotos] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  useEffect(() => {
    const update = () => setMemories(shadowStore.getMemories());
    update();
    return shadowStore.subscribe(update);
  }, []);

  // Filter memories
  const filtered = memories.filter((m) => {
    if (selectedType !== "all" && m.memory_type !== selectedType) return false;
    if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
    if (filterPinned && !m.is_pinned) return false;
    if (filterFavorite && !m.is_favorite) return false;
    if (filterWithPhotos && (!m.attachments || m.attachments.length === 0)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        m.title.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.content && m.content.toLowerCase().includes(q)) ||
        (m.ai_summary && m.ai_summary.toLowerCase().includes(q)) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        (m.people && m.people.some((p) => p.toLowerCase().includes(q))) ||
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
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header and Layout Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F3F8]">
            Memory Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8AA6] font-serif">
            Browse, filter, and inspect moments recorded across time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono-retro text-[#C084FC] bg-purple-950/70 px-3 py-1 rounded-lg border border-purple-800/50 w-fit">
            {sorted.length} / {memories.length} Memories Displayed
          </div>

          {/* Grid / Compact Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-[#0C0C12] border border-[#252238]">
            <button
              onClick={() => setIsCompact(false)}
              className={`p-1.5 rounded transition-colors ${
                !isCompact ? "bg-[#8B5CF6] text-white" : "text-[#8E8AA6] hover:text-[#F4F3F8]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsCompact(true)}
              className={`p-1.5 rounded transition-colors ${
                isCompact ? "bg-[#8B5CF6] text-white" : "text-[#8E8AA6] hover:text-[#F4F3F8]"
              }`}
              title="Compact List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters Panel */}
      <div className="p-4 rounded-2xl bg-[#0C0C12] border border-[#252238] space-y-3.5 shadow-lg">
        {/* Search input & Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C5873]" />
            <input
              type="text"
              placeholder="Filter by keyword, topic, person, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12121B] border border-[#252238] focus:border-[#8B5CF6] rounded-xl pl-9 pr-8 py-2 text-xs text-[#F4F3F8] placeholder-[#5C5873] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8AA6] hover:text-[#F4F3F8]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#12121B] border border-[#252238] rounded-xl px-3 py-2 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6] font-mono-retro"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* 8 Memory Types Selector Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] font-mono-retro text-[#5C5873] uppercase tracking-wider mr-1">
            Type:
          </span>
          <button
            onClick={() => setSelectedType("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono-retro transition-colors ${
              selectedType === "all"
                ? "bg-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                : "bg-[#12121B] text-[#8E8AA6] hover:text-[#F4F3F8]"
            }`}
          >
            All Types
          </button>
          {memoryTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono-retro transition-colors capitalize ${
                selectedType === t
                  ? "bg-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                  : "bg-[#12121B] text-[#8E8AA6] hover:text-[#F4F3F8]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 8 Categories Filter Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-[#191926] pt-2">
          <span className="text-[10px] font-mono-retro text-[#5C5873] uppercase tracking-wider mr-1">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono-retro transition-colors ${
              selectedCategory === "all"
                ? "bg-purple-950 text-[#C084FC] border border-purple-500/50"
                : "bg-[#12121B] text-[#8E8AA6] hover:text-[#F4F3F8]"
            }`}
          >
            All
          </button>
          {memoryCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono-retro whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-purple-950 text-[#C084FC] border border-purple-500/50"
                  : "bg-[#12121B] text-[#8E8AA6] hover:text-[#F4F3F8]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Attribute Toggles */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#191926] text-xs font-mono-retro">
          <button
            onClick={() => setFilterPinned(!filterPinned)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              filterPinned
                ? "bg-purple-950 text-[#C084FC] border-purple-500/50"
                : "bg-[#12121B] text-[#8E8AA6] border-transparent hover:text-[#F4F3F8]"
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
                : "bg-[#12121B] text-[#8E8AA6] border-transparent hover:text-[#F4F3F8]"
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
                : "bg-[#12121B] text-[#8E8AA6] border-transparent hover:text-[#F4F3F8]"
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>With Attachments</span>
          </button>
        </div>
      </div>

      {/* Memories Cards Stream */}
      {sorted.length > 0 ? (
        <div
          className={
            isCompact
              ? "space-y-2.5"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          }
        >
          {sorted.map((m) => (
            <MemoryCard
              key={m.id}
              memory={m}
              compact={isCompact}
              onToggleFavorite={(id) => shadowStore.toggleFavorite(id)}
              onTogglePin={(id) => shadowStore.togglePin(id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-[#0C0C12] border border-[#252238] space-y-3">
          <p className="text-sm font-mono-retro text-[#8E8AA6]">
            No memories match your active filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedType("all");
              setSelectedCategory("all");
              setFilterPinned(false);
              setFilterFavorite(false);
              setFilterWithPhotos(false);
            }}
            className="text-xs font-mono-retro text-[#8B5CF6] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
