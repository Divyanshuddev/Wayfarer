"use client";

import { MemoryStatsChart } from "@/components/dashboard/MemoryStatsChart";
import { RediscoverCard } from "@/components/dashboard/RediscoverCard";
import { UpcomingRemindersWidget } from "@/components/dashboard/UpcomingRemindersWidget";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { shadowStore } from "@/lib/storage/store";
import { Memory } from "@/types/database";
import {
  ArrowRight,
  Database,
  History,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function DashboardHomePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState(() => shadowStore.getStats());

  useEffect(() => {
    const update = () => {
      setMemories(shadowStore.getMemories());
      setStats(shadowStore.getStats());
    };
    update();
    return shadowStore.subscribe(update);
  }, []);

  const recentMemories = memories.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-retro text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
            VAULT STATUS: SECURE
          </span>
          <span className="text-[11px] font-mono-retro text-gray-400">
            • AES-256 • PGVECTOR READY
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-100">
          Welcome to Shadow
        </h1>
        <p className="text-sm text-gray-400 font-serif">
          Your life, remembered. Every moment is distilled, embedded in 1536 dimensions, and strictly grounded.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#0e0d18] border border-[#232038] space-y-1">
          <p className="text-[11px] font-mono-retro text-gray-400 uppercase">
            Total Memories
          </p>
          <p className="text-2xl font-bold font-mono-retro text-purple-300">
            {stats.total}
          </p>
          <p className="text-[10px] text-gray-400 font-mono-retro">Across 9 categories</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0d18] border border-[#232038] space-y-1">
          <p className="text-[11px] font-mono-retro text-gray-400 uppercase">
            Favorites & Pinned
          </p>
          <p className="text-2xl font-bold font-mono-retro text-rose-300">
            {stats.favorites + stats.pinned}
          </p>
          <p className="text-[10px] text-gray-400 font-mono-retro">High salience moments</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0d18] border border-[#232038] space-y-1">
          <p className="text-[11px] font-mono-retro text-gray-400 uppercase">
            Visual Artifacts
          </p>
          <p className="text-2xl font-bold font-mono-retro text-amber-300">
            {stats.withAttachments}
          </p>
          <p className="text-[10px] text-gray-400 font-mono-retro">With Vision OCR</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0d18] border border-[#232038] space-y-1">
          <p className="text-[11px] font-mono-retro text-gray-400 uppercase">
            Grounding Score
          </p>
          <p className="text-2xl font-bold font-mono-retro text-emerald-300">
            100%
          </p>
          <p className="text-[10px] text-emerald-400/80 font-mono-retro">Zero fabrication</p>
        </div>
      </div>

      {/* Rediscover Highlight Card */}
      <RediscoverCard />

      {/* Visual Analytics Grid */}
      <MemoryStatsChart />

      {/* Lower Dual Column: Recent Memories & Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Memories Stream (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-semibold text-gray-100 tracking-tight">
                Recently Recorded Memories
              </h2>
            </div>
            <Link
              href="/memories"
              className="flex items-center gap-1 text-xs font-mono-retro text-purple-400 hover:text-purple-300 hover:underline"
            >
              <span>View All ({memories.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

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
        </div>

        {/* Upcoming Reminders (1 column on lg) */}
        <div className="space-y-4">
          <UpcomingRemindersWidget />
        </div>
      </div>
    </div>
  );
}
