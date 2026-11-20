"use client";

import { QuestionCard } from "@/components/qa/QuestionCard";
import { TripCard } from "@/components/trips/TripCard";
import { tripStore } from "@/lib/storage/trip-store";
import { Trip, TripQuestion } from "@/types/trip";
import {
  ArrowRight,
  Compass,
  Globe,
  Hotel,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [questions, setQuestions] = useState<TripQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");

  useEffect(() => {
    const update = () => {
      setTrips(tripStore.getTrips(selectedDestination, selectedStyle, searchQuery));
      setQuestions(tripStore.getQuestions(selectedDestination));
    };
    update();
    return tripStore.subscribe(update);
  }, [selectedDestination, selectedStyle, searchQuery]);

  // Compute unique destinations dynamically from real user trips
  const destinationMap: Record<
    string,
    { name: string; country: string; hotelPrice: string; count: number }
  > = {};

  trips.forEach((t) => {
    if (!destinationMap[t.destination]) {
      destinationMap[t.destination] = {
        name: t.destination,
        country: t.country,
        hotelPrice: t.hotel_price_range,
        count: 0,
      };
    }
    destinationMap[t.destination].count += 1;
  });

  const trendingDestinations = Object.values(destinationMap).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Community Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#23203c] bg-gradient-to-br from-[#0e0c1c] via-[#090812] to-[#121528] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/70 border border-sky-800/60 text-sky-300 text-xs font-mono-retro">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>COMMUNITY-POWERED TRAVEL INTEL & HOTEL PRICING</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Real Trips. <span className="text-emerald-400">Unfiltered Pros & Cons.</span>{" "}
            <span className="text-sky-400">Firsthand Hotel Prices.</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
            Planning a trip? Ask travelers who have visited about actual hotel rates, transit scams, and hidden spots. Share your own journey with genuine pros, cons, and photo galleries.
          </p>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-share-trip"));
              }}
              className="px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Share Your Trip & Advice</span>
            </button>

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

      {/* Community Stats Bar (Dynamically calculated from real user data) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0c0b14]/80 border border-[#222036] space-y-1">
          <p className="text-[11px] font-mono-retro text-gray-400 uppercase">COMMUNITY TRIPS</p>
          <p className="text-xl sm:text-2xl font-bold font-mono-retro text-sky-400">
            {trips.length} Guides
          </p>
          <p className="text-[10px] text-gray-500">Real verified reports</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c0b14]/80 border border-[#222036] space-y-1">
          <p className="text-[11px] font-mono-retro text-gray-400 uppercase">DESTINATIONS</p>
          <p className="text-xl sm:text-2xl font-bold font-mono-retro text-emerald-400">
            {Object.keys(destinationMap).length} Cities
          </p>
          <p className="text-[10px] text-gray-500">Shared by travelers</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c0b14]/80 border border-[#222036] space-y-1">
          <p className="text-[11px] font-mono-retro text-gray-400 uppercase">HOTEL INQUIRIES</p>
          <p className="text-xl sm:text-2xl font-bold font-mono-retro text-amber-400">
            {questions.length} Questions
          </p>
          <p className="text-[10px] text-gray-500">Community answers</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c0b14]/80 border border-[#222036] space-y-1">
          <p className="text-[11px] font-mono-retro text-gray-400 uppercase">BACKEND API</p>
          <p className="text-xl sm:text-2xl font-bold font-mono-retro text-purple-400">
            FastAPI :8001
          </p>
          <p className="text-[10px] text-emerald-400">Microservice Online</p>
        </div>
      </div>

      {/* Trending Destinations with Verified Hotel Prices */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <h2 className="text-lg font-bold text-gray-100">Trending Destinations & Hotel Prices</h2>
          </div>
          {trendingDestinations.length > 0 && (
            <Link
              href="/trips"
              className="text-xs font-mono-retro text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {trendingDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {trendingDestinations.map((dest) => (
              <div
                key={dest.name}
                onClick={() => setSelectedDestination(selectedDestination === dest.name ? "all" : dest.name)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                  selectedDestination === dest.name
                    ? "bg-sky-950/40 border-sky-500 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                    : "bg-[#0c0b14]/80 border-[#222036] hover:border-sky-500/40 hover:bg-[#121020]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-retro px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/40">
                    {dest.count} {dest.count === 1 ? "Trip" : "Trips"}
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
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[#0c0b14]/70 border border-[#222036] space-y-2">
            <Globe className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-xs text-gray-300 font-medium">No destinations indexed yet.</p>
            <p className="text-[11px] text-gray-500">
              Post your first trip to populate trending spots and hotel pricing!
            </p>
          </div>
        )}
      </div>

      {/* Featured Community Trips Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <h2 className="text-lg font-bold text-gray-100">
              Community Trip Reports & Unfiltered Advice
            </h2>
          </div>

          {/* Quick Style Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {["all", "Solo", "Couple", "Backpacking", "Luxury"].map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-3 py-1 rounded-full text-xs font-mono-retro whitespace-nowrap transition-all ${
                  selectedStyle === style
                    ? "bg-sky-500 text-white font-medium"
                    : "bg-[#141224] text-gray-400 border border-[#252238] hover:text-white"
                }`}
              >
                {style === "all" ? "All Styles" : style}
              </button>
            ))}
          </div>
        </div>

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
          <div className="p-12 text-center rounded-2xl bg-[#0c0b14]/70 border border-[#222036] space-y-4">
            <Compass className="w-12 h-12 text-sky-400/60 mx-auto animate-spin-slow" />
            <h3 className="text-base font-bold text-gray-100">No Trips Shared Yet</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Be the first traveler to share an unfiltered trip report with photo galleries, honest pros & cons, and verified hotel rates.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-share-trip"))}
              className="px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)] inline-flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Share First Trip & Tips</span>
            </button>
          </div>
        )}
      </div>

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

        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.slice(0, 3).map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[#0c0b14]/60 border border-[#222036] space-y-3">
            <MessageSquare className="w-8 h-8 text-amber-400/60 mx-auto" />
            <h3 className="text-sm font-semibold text-gray-200">No Questions Asked Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Have questions about hotel pricing, transit safety, or best travel months? Ask the community!
            </p>
            <Link
              href="/qa"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono-retro bg-sky-950/80 text-sky-300 border border-sky-800/50 hover:bg-sky-900"
            >
              <span>Ask a Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
