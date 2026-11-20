"use client";

import { MemoryStatsChart } from "@/components/dashboard/MemoryStatsChart";
import { RediscoverCard } from "@/components/dashboard/RediscoverCard";
import { UpcomingRemindersWidget } from "@/components/dashboard/UpcomingRemindersWidget";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { shadowStore } from "@/lib/storage/store";
import { Collection, Memory } from "@/types/database";
import { QuestionCard } from "@/components/qa/QuestionCard";
import { TripCard } from "@/components/trips/TripCard";
import { tripStore } from "@/lib/storage/trip-store";
import { Trip, TripQuestion } from "@/types/trip";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Cpu,
  Folder,
  History,
  MessageCircle,
  Globe,
  Hotel,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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
  export default function HomePage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [questions, setQuestions] = useState<TripQuestion[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDestination, setSelectedDestination] = useState<string>("all");
    const [selectedStyle, setSelectedStyle] = useState<string>("all");

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
        setTrips(tripStore.getTrips(selectedDestination, selectedStyle, searchQuery));
        setQuestions(tripStore.getQuestions(selectedDestination));
      };
      update();
      return shadowStore.subscribe(update);
    }, []);
    return tripStore.subscribe(update);
  }, [selectedDestination, selectedStyle, searchQuery]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };
  const trendingDestinations = [
    { name: "Kyoto", country: "Japan", hotelPrice: "$75 - $140 / night", tag: "Autumn Foliage" },
    { name: "Bali", country: "Indonesia", hotelPrice: "$25 - $70 / night", tag: "Digital Nomad" },
    { name: "Amalfi Coast", country: "Italy", hotelPrice: "$180 - $350 / night", tag: "Coastal Glamour" },
    { name: "Zermatt", country: "Switzerland", hotelPrice: "$130 - $220 / night", tag: "Glacier Trekking" },
  ];

  const handlePillClick = (promptText: string) => {
    router.push(`/search?q=${encodeURIComponent(promptText)}`);
  };
  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Community Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#23203c] bg-gradient-to-br from-[#0e0c1c] via-[#090812] to-[#121528] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/70 border border-sky-800/60 text-sky-300 text-xs font-mono-retro">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>COMMUNITY-POWERED TRAVEL INTEL & HOTEL PRICING</span>
          </div>

          const recentMemories = memories.slice(0, 4);
          const recentCollections = collections.slice(0, 4);
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Real Trips. <span className="text-emerald-400">Unfiltered Pros & Cons.</span>{" "}
            <span className="text-sky-400">Firsthand Hotel Prices.</span>
          </h1>

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
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              Planning a trip? Ask travelers who have visited about actual hotel rates, transit scams, and hidden spots. Share your own journey with genuine pros, cons, and photo galleries.
            </p>

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
                  {/* Quick Action CTA Buttons */ }
                  < div className = "flex flex-wrap items-center gap-3 pt-2" >
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePillClick(pill)}
                    className="px-2.5 py-1 rounded-full bg-[#12121B] hover:bg-purple-950/60 text-[#8E8AA6] hover:text-[#C084FC] border border-[#252238] hover:border-purple-800/60 text-[11px] transition-colors"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-share-trip"));
                    }}
                    className="px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center gap-2 active:scale-95"
                  >
                    &ldquo;{pill}&rdquo;
                    <Plus className="w-4 h-4" />
                    <span>Share Your Trip & Advice</span>
                  </button>
                ))}

                <Link
                  href="/qa"
                  className="px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-sky-200 bg-[#141224] hover:bg-[#1c1932] border border-[#2d2948] hover:border-sky-500/50 transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Ask Hotel & Trip Questions</span>
                </Link>
              </div>
            </div>

            {/* Ambient Decorative Backlight */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-sky-600/10 blur-3xl pointer-events-none" />
            <div className="absolute right-40 top-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          </div>

          {/* 3. Quick Stats Grid */}
          {/* Community Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-[#0C0C12] border border-[#252238] space-y-1">
              <p className="text-[11px] font-mono-retro text-[#8E8AA6] uppercase">
                Total Memories
                <div className="p-4 rounded-2xl bg-[#0c0b14]/80 border border-[#222036] space-y-1">
                  <p className="text-[11px] font-mono-retro text-gray-400 uppercase">COMMUNITY TRIPS</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono-retro text-sky-400">
                    {trips.length} Guides
                  </p>
                  <p className="text-2xl font-bold font-mono-retro text-purple-300">
                    {stats.total}
                  </p>
                  <p className="text-[10px] text-[#5C5873] font-mono-retro">Across 8 categories</p>
                  <p className="text-[10px] text-gray-500">With authentic pros & cons</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0C0C12] border border-[#252238] space-y-1">
                  <p className="text-[11px] font-mono-retro text-[#8E8AA6] uppercase">
                    Favorites & Pinned
                    <div className="p-4 rounded-2xl bg-[#0c0b14]/80 border border-[#222036] space-y-1">
                      <p className="text-[11px] font-mono-retro text-gray-400 uppercase">HOTEL PRICE RANGE</p>
                      <p className="text-xl sm:text-2xl font-bold font-mono-retro text-emerald-400">
                        $25 - $350
                      </p>
                      <p className="text-2xl font-bold font-mono-retro text-rose-300">
                        {stats.favorites + stats.pinned}
                      </p>
                      <p className="text-[10px] text-[#5C5873] font-mono-retro">High salience moments</p>
                      <p className="text-[10px] text-gray-500">Nightly verified rates</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0C0C12] border border-[#252238] space-y-1">
                      <p className="text-[11px] font-mono-retro text-[#8E8AA6] uppercase">
                        Visual Artifacts
                        <div className="p-4 rounded-2xl bg-[#0c0b14]/80 border border-[#222036] space-y-1">
                          <p className="text-[11px] font-mono-retro text-gray-400 uppercase">TRAVELER INQUIRIES</p>
                          <p className="text-xl sm:text-2xl font-bold font-mono-retro text-amber-400">
                            {questions.length} Questions
                          </p>
                          <p className="text-2xl font-bold font-mono-retro text-amber-300">
                            {stats.withAttachments}
                          </p>
                          <p className="text-[10px] text-[#5C5873] font-mono-retro">With Vision OCR</p>
                          <p className="text-[10px] text-gray-500">Answered by past visitors</p>
                        </div>

                        <div className="p-4 rounded-xl bg-[#0C0C12] border border-[#252238] space-y-1">
                          <p className="text-[11px] font-mono-retro text-[#8E8AA6] uppercase">
                            Grounding Score
                            <div className="p-4 rounded-2xl bg-[#0c0b14]/80 border border-[#222036] space-y-1">
                              <p className="text-[11px] font-mono-retro text-gray-400 uppercase">BACKEND ARCHITECTURE</p>
                              <p className="text-xl sm:text-2xl font-bold font-mono-retro text-purple-400">
                                FastAPI + Next
                              </p>
                              <p className="text-2xl font-bold font-mono-retro text-emerald-400">
                                100%
                              </p>
                              <p className="text-[10px] text-emerald-400/80 font-mono-retro">Zero fabrication</p>
                              <p className="text-[10px] text-emerald-400">Port 8001 Microservice</p>
                            </div>
                        </div>

                        {/* 4. Rediscover Daily Highlight Card */}
                        <RediscoverCard />
                        {/* Trending Destinations with Verified Hotel Prices */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-sky-400" />
                              <h2 className="text-lg font-bold text-gray-100">Trending Destinations & Hotel Prices</h2>
                            </div>
                            <Link
                              href="/trips"
                              className="text-xs font-mono-retro text-sky-400 hover:text-sky-300 flex items-center gap-1"
                            >
                              <span>View All Destinations</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                          {/* 5. 14-day Ingestion Activity & Category Density Visual Analytics */}
                          <MemoryStatsChart />
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {trendingDestinations.map((dest) => (
                              <div
                                key={dest.name}
                                onClick={() => setSelectedDestination(selectedDestination === dest.name ? "all" : dest.name)}
                                className={`cursor-pointer p-4 rounded-2xl border transition-all ${selectedDestination === dest.name
                                  ? "bg-sky-950/40 border-sky-500 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                                  : "bg-[#0c0b14]/80 border-[#222036] hover:border-sky-500/40 hover:bg-[#121020]"
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono-retro px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/40">
                                    {dest.tag}
                                  </span>
                                  <span className="text-xs text-gray-400">{dest.country}</span>
                                </div>
                                <h3 className="text-base font-bold text-gray-100 mt-2">{dest.name}</h3>
                                <div className="mt-3 pt-2 border-t border-[#1e1c30] flex items-center gap-1.5 text-xs font-mono-retro text-emerald-400">
                                  <Hotel className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="font-semibold">{dest.hotelPrice}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

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
                              {/* Featured Community Trips Grid */}
                              <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-emerald-400" />
                                    <h2 className="text-lg font-bold text-gray-100">
                                      Community Trip Reports & Unfiltered Advice
                                    </h2>
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
                                    {/* Quick Style Filter Pills */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                      {["all", "Solo", "Couple", "Backpacking", "Luxury"].map((style) => (
                                        <button
                                          key={style}
                                          onClick={() => setSelectedStyle(style)}
                                          className={`px-3 py-1 rounded-full text-xs font-mono-retro whitespace-nowrap transition-all ${selectedStyle === style
                                            ? "bg-sky-500 text-white font-medium"
                                            : "bg-[#141224] text-gray-400 border border-[#252238] hover:text-white"
                                            }`}
                                        >
                                          {style === "all" ? "All Styles" : style}
                                        </button>
                                      ))}
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
                                          {trips.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                              {trips.map((trip) => (
                                                <TripCard
                                                  key={trip.id}
                                                  trip={trip}
                                                  onAskQuestion={(t) => {
                                                    window.location.href = `/trips/${t.id}#qa`;
                                                  }}
                                                />
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="p-12 text-center rounded-2xl bg-[#0c0b14]/60 border border-[#222036] space-y-3">
                                              <Compass className="w-10 h-10 text-gray-500 mx-auto" />
                                              <p className="text-gray-300 font-medium">No trips match this filter.</p>
                                              <button
                                                onClick={() => {
                                                  setSelectedDestination("all");
                                                  setSelectedStyle("all");
                                                }}
                                                className="text-xs text-sky-400 underline font-mono-retro"
                                              >
                                                <span>View All ({memories.length})</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                              </Link>
                                              Reset filters
                                            </button>
          </div>
        )}
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
                                    {/* Traveler Q&A and Hotel Inquiries Feed */}
                                    <div className="space-y-4 pt-4 border-t border-[#1e1c30]">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <MessageSquare className="w-4 h-4 text-amber-400" />
                                          <h2 className="text-lg font-bold text-gray-100">
                                            Recent Traveler Inquiries & Hotel Questions
                                          </h2>
                                        </div>
                                        <Link
                                          href="/qa"
                                          className="text-xs font-mono-retro text-sky-400 hover:text-sky-300 flex items-center gap-1"
                                        >
                                          <span>Ask a Question</span>
                                          <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                      </div>

                                      {/* Upcoming Reminders (1 column on lg) */}
                                      <div className="space-y-4">
                                        <UpcomingRemindersWidget />
                                        {questions.slice(0, 3).map((q) => (
                                          <QuestionCard key={q.id} question={q} />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  );
}
