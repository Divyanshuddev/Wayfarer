"use client";

import { TripCard } from "@/components/trips/TripCard";
import { tripStore } from "@/lib/storage/trip-store";
import { Trip } from "@/types/trip";
import { Compass, Filter, Hotel, MapPin, Search, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Trip[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("all");

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const doSearch = () => {
      const trips = tripStore.getTrips(undefined, selectedStyle, query);
      setResults(trips);
    };
    doSearch();
    return tripStore.subscribe(doSearch);
  }, [query, selectedStyle]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#201d32] pb-5">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-sky-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Search Destinations & Hotels
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Find authentic travel reports, real hotel price ranges, and honest community advice.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
        <input
          type="text"
          placeholder="Search by destination (Kyoto, Bali), hotels, or keywords (fondue, ramen, beach)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#0c0b14]/90 border border-[#25223c] focus:border-sky-500 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none shadow-lg"
        />
      </div>

      {/* Style Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["all", "Solo", "Couple", "Backpacking", "Luxury", "Family"].map((style) => (
          <button
            key={style}
            onClick={() => setSelectedStyle(style)}
            className={`px-3 py-1 rounded-full text-xs font-mono-retro whitespace-nowrap transition-all ${
              selectedStyle === style
                ? "bg-sky-500 text-white font-medium shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                : "bg-[#141224] text-gray-400 border border-[#252238] hover:text-white"
            }`}
          >
            {style === "all" ? "All Travel Styles" : style}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono-retro text-gray-400">
        <span>Found {results.length} matching trips & hotel guides</span>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-[#0c0b14]/60 border border-[#222036] space-y-3">
          <Compass className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-sm font-semibold text-gray-200">No destinations match "{query}"</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Try searching for cities like "Kyoto", "Bali", "Amalfi", or keywords like "hotel" or "pasta".
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono-retro text-gray-400">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
