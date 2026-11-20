"use client";

import { TripCard } from "@/components/trips/TripCard";
import { tripStore } from "@/lib/storage/trip-store";
import { Trip } from "@/types/trip";
import {
  Compass,
  Filter,
  Globe,
  Hotel,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

function TripsCatalogContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "likes" | "duration">("newest");

  useEffect(() => {
    const update = () => {
      let result = tripStore.getTrips(selectedDestination, selectedStyle, searchQuery);
      if (sortBy === "likes") {
        result = [...result].sort((a, b) => b.likes_count - a.likes_count);
      } else if (sortBy === "duration") {
        result = [...result].sort((a, b) => b.duration_days - a.duration_days);
      }
      setTrips(result);
    };
    update();
    return tripStore.subscribe(update);
  }, [selectedDestination, selectedStyle, searchQuery, sortBy]);

  const travelStyles = ["all", "Solo", "Couple", "Backpacking", "Luxury", "Family", "Friends"];
  const uniqueDestinations = ["all", "Kyoto", "Bali", "Amalfi Coast", "Zermatt"];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#201d32] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              All Community Trips & Reviews
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse verified itineraries with transparent hotel costs, pros, and cautions.
          </p>
        </div>

        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-share-trip"));
          }}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)] flex items-center gap-2 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Share Your Trip</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0c0b14]/90 border border-[#222036] space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
            <input
              type="text"
              placeholder="Search by city, country, hotel, or keywords (e.g. ramen, beach, fondue)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs font-mono-retro">
            <span className="text-gray-400 whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#141224] border border-[#26233d] text-gray-200 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="likes">Most Popular (Likes)</option>
              <option value="duration">Trip Duration</option>
            </select>
          </div>
        </div>

        {/* Travel Style Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1a182a]">
          <span className="text-[11px] font-mono-retro text-gray-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Style:
          </span>
          {travelStyles.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-3 py-1 rounded-full text-xs font-mono-retro transition-all ${
                selectedStyle === style
                  ? "bg-sky-500 text-white font-medium shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                  : "bg-[#141224] text-gray-400 border border-[#252238] hover:text-white"
              }`}
            >
              {style === "all" ? "All Styles" : style}
            </button>
          ))}

          {/* Destination Shortcut filter */}
          <div className="ml-auto flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono-retro">
            <span className="text-gray-500">Destination:</span>
            {uniqueDestinations.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDestination(d)}
                className={`px-2 py-0.5 rounded-lg border transition-all ${
                  selectedDestination === d
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-600/50"
                    : "bg-[#12111d] text-gray-400 border-[#222036] hover:text-gray-200"
                }`}
              >
                {d === "all" ? "Everywhere" : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      {trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-[#0c0b14]/70 border border-[#222036] space-y-4">
          <Compass className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-base font-semibold text-gray-200">No trips found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Try tweaking your search keywords or travel style filter, or be the first to share a trip to this place!
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedStyle("all");
              setSelectedDestination("all");
            }}
            className="px-4 py-2 rounded-xl text-xs font-mono-retro bg-[#161426] text-sky-400 border border-sky-800/40 hover:bg-sky-950/40"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono-retro text-gray-400">Loading catalog...</div>}>
      <TripsCatalogContent />
    </Suspense>
  );
}
