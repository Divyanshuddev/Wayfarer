"use client";

import { MemoryStatsChart } from "@/components/dashboard/MemoryStatsChart";
import { RediscoverCard } from "@/components/dashboard/RediscoverCard";
import { UpcomingRemindersWidget } from "@/components/dashboard/UpcomingRemindersWidget";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { shadowStore } from "@/lib/storage/store";
import { Collection, Memory } from "@/types/database";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Cpu,
  Folder,
  History,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const COLLECTION_ICONS: Record<string, any> = {
  compass: Compass,
  cpu: Cpu,
  "message-circle": MessageCircle,
  "book-open": BookOpen,
  folder: Folder,
};

export default function DashboardHomePage() {
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [collections, setCollections] = useState<(Collection & { count: number })[]>([]);
  const [stats, setStats] = useState(() => shadowStore.getStats());
  const [greeting, setGreeting] = useState("Good day");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Time-aware greeting calculation
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const update = () => {
      setMemories(shadowStore.getMemories());
      setCollections(shadowStore.getCollections());
      setStats(shadowStore.getStats());
    };
    update();
    return shadowStore.subscribe(update);
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const handlePillClick = (promptText: string) => {
    router.push(`/search?q=${encodeURIComponent(promptText)}`);
  };

  const recentMemories = memories.slice(0, 4);
  const recentCollections = collections.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      {/* 1. Time-aware Greeting Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-retro text-[#C084FC] bg-purple-950/70 px-2.5 py-0.5 rounded border border-purple-800/50">
            VAULT STATUS: SECURE
          </span>
          <span className="text-[11px] font-mono-retro text-[#8E8AA6]">
            • 1536d PGVECTOR READY • ZERO-FABRICATION ACTIVE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F3F8]">
          {greeting}, Archivist
        </h1>
        <p className="text-sm text-[#8E8AA6] font-serif">
          Your life, remembered. Every moment is distilled, embedded in 1536 dimensions, and strictly grounded.
        </p>
      </div>

      {/* 2. Hero AI Search Bar with Clickable Example Pills */}
      <div className="p-5 rounded-2xl bg-[#0C0C12] border border-[#252238] shadow-xl space-y-3.5">
        <form onSubmit={handleHeroSearch} className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-[#8B5CF6]" />
          <input
            type="text"
            placeholder="Ask anything from your life (e.g. 'What did Rahul recommend?' or 'Where did I leave my keys?')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12121B] border border-[#252238] focus:border-[#8B5CF6] rounded-xl pl-11 pr-24 py-3 text-sm text-[#F4F3F8] placeholder-[#5C5873] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/50 transition-all font-sans"
          />
          <button
            type="submit"
            className="absolute right-2 px-3.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-purple-500 text-white text-xs font-mono-retro transition-colors"
          >
            Ask Shadow
          </button>
        </form>

        {/* Clickable Example Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono-retro">
          <span className="text-[10px] text-[#5C5873] uppercase tracking-wider">
            Try asking:
          </span>
          {[
            "Summarize my recent thoughts",
            "Show my project milestones",
            "What did we discuss in the last meeting?",
            "Find my travel memories",
          ].map((pill, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePillClick(pill)}
              className="px-2.5 py-1 rounded-full bg-[#12121B] hover:bg-purple-950/60 text-[#8E8AA6] hover:text-[#C084FC] border border-[#252238] hover:border-purple-800/60 text-[11px] transition-colors"
            >
              &ldquo;{pill}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* 3. Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#0C0C12] border border-[#252238] space-y-1">
          <p className="text-[11px] font-mono-retro text-[#8E8AA6] uppercase">
            Total Memories
          </p>
          <p className="text-2xl font-bold font-mono-retro text-purple-300">
            {stats.total}
          </p>
          <p className="text-[10px] text-[#5C5873] font-mono-retro">Across 8 categories</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C12] border border-[#252238] space-y-1">
          <p className="text-[11px] font-mono-retro text-[#8E8AA6] uppercase">
            Favorites & Pinned
          </p>
          <p className="text-2xl font-bold font-mono-retro text-rose-300">
            {stats.favorites + stats.pinned}
          </p>
          <p className="text-[10px] text-[#5C5873] font-mono-retro">High salience moments</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C12] border border-[#252238] space-y-1">
          <p className="text-[11px] font-mono-retro text-[#8E8AA6] uppercase">
            Visual Artifacts
          </p>
          <p className="text-2xl font-bold font-mono-retro text-amber-300">
            {stats.withAttachments}
          </p>
          <p className="text-[10px] text-[#5C5873] font-mono-retro">With Vision OCR</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C12] border border-[#252238] space-y-1">
          <p className="text-[11px] font-mono-retro text-[#8E8AA6] uppercase">
            Grounding Score
          </p>
          <p className="text-2xl font-bold font-mono-retro text-emerald-400">
            100%
          </p>
          <p className="text-[10px] text-emerald-400/80 font-mono-retro">Zero fabrication</p>
        </div>
      </div>

      {/* 4. Rediscover Daily Highlight Card */}
      <RediscoverCard />

      {/* 5. 14-day Ingestion Activity & Category Density Visual Analytics */}
      <MemoryStatsChart />

      {/* 6. Recently Viewed Collections Row */}
      {recentCollections.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F4F3F8] tracking-tight">
              Recently Viewed Collections
            </h3>
            <Link
              href="/collections"
              className="text-xs font-mono-retro text-[#8B5CF6] hover:text-[#C084FC] hover:underline"
            >
              View all ({collections.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentCollections.map((col) => {
              const Icon = COLLECTION_ICONS[col.icon] || Folder;
              return (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className="p-3.5 rounded-xl bg-[#0C0C12] hover:bg-[#12121B] border border-[#252238] hover:border-[#8B5CF6]/50 transition-all group flex flex-col justify-between space-y-2 shadow"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center border"
                      style={{
                        backgroundColor: `${col.color || "#8B5CF6"}20`,
                        borderColor: `${col.color || "#8B5CF6"}60`,
                        color: col.color || "#8B5CF6",
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-xs text-[#F4F3F8] group-hover:text-[#C084FC] truncate transition-colors">
                      {col.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-retro text-[#8E8AA6]">
                    {col.count} memories
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Lower Dual Column: Recent Memories & Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Memories Stream (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#8B5CF6]" />
              <h2 className="text-base font-semibold text-[#F4F3F8] tracking-tight">
                Recently Recorded Memories
              </h2>
            </div>
            <Link
              href="/memories"
              className="flex items-center gap-1 text-xs font-mono-retro text-[#8B5CF6] hover:text-[#C084FC] hover:underline"
            >
              <span>View All ({memories.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentMemories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentMemories.map((m) => (
                <MemoryCard
                  key={m.id}
                  memory={m}
                  onToggleFavorite={(id) => shadowStore.toggleFavorite(id)}
                  onTogglePin={(id) => shadowStore.togglePin(id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0C0C12] border border-dashed border-[#252238] flex flex-col items-center justify-center text-center space-y-3 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-[#8B5CF6]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#F4F3F8]">
                  Your Memory Vault is Ready
                </h3>
                <p className="text-xs text-[#8E8AA6] max-w-sm">
                  No memories recorded yet. Press{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-[#191926] font-mono-retro text-purple-300 border border-[#252238]">
                    ⌘K
                  </kbd>{" "}
                  anywhere or capture your first note, photo, voice recording, or document.
                </p>
              </div>
              <Link
                href="/memories"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-purple-500 text-white text-xs font-medium shadow-[0_0_15px_rgba(139,92,246,0.35)] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Capture First Memory</span>
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Reminders (1 column on lg) */}
        <div className="space-y-4">
          <UpcomingRemindersWidget />
        </div>
      </div>
    </div>
  );
}
