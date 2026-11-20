"use client";

import { TripCard } from "@/components/trips/TripCard";
import { tripStore } from "@/lib/storage/trip-store";
import { Trip } from "@/types/trip";
import { Compass, FolderHeart, Globe, Hotel, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function CollectionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const update = () => {
      let list = tripStore.getTrips();
      if (selectedCategory === "asia") {
        list = list.filter((t) => t.country === "Japan" || t.country === "Indonesia");
      } else if (selectedCategory === "europe") {
        list = list.filter((t) => t.country === "Italy" || t.country === "Switzerland");
      } else if (selectedCategory === "budget") {
        list = list.filter((t) => t.travel_style === "Backpacking");
      } else if (selectedCategory === "luxury") {
        list = list.filter((t) => t.travel_style === "Luxury" || t.travel_style === "Couple");
      }
      setTrips(list);
    };
    update();
    return tripStore.subscribe(update);
  }, [selectedCategory]);

  const collections = [
    { id: "all", name: "All Destinations", count: "4 Guides", tag: "Global" },
    { id: "asia", name: "Asian Wonders", count: "Kyoto & Bali", tag: "$25 - $140 Hotels" },
    { id: "europe", name: "European Escapes", count: "Amalfi & Zermatt", tag: "$130 - $350 Hotels" },
    { id: "budget", name: "Backpacker Havens", count: "Low-cost villas", tag: "Under $50/night" },
    { id: "luxury", name: "Luxury & Honeymoon", count: "Cliffside suites", tag: "Scenic Balconies" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#201d32] pb-6">
        <div className="flex items-center gap-2">
          <FolderHeart className="w-5 h-5 text-sky-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Curated Travel Collections
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Explore destinations grouped by region, budget category, and travel style.
        </p>
      </div>

      {/* Collections Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {collections.map((col) => (
          <button
            key={col.id}
            onClick={() => setSelectedCategory(col.id)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              selectedCategory === col.id
                ? "bg-sky-950/40 border-sky-500 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                : "bg-[#0c0b14]/90 border-[#222036] hover:border-sky-500/40 hover:bg-[#121020]"
            }`}
          >
            <span className="text-[10px] font-mono-retro text-sky-400 block mb-1 font-semibold">
              {col.tag}
            </span>
            <h3 className="font-bold text-xs sm:text-sm text-gray-100">{col.name}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{col.count}</p>
          </button>
        ))}
      </div>

      {/* Trips in Collection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono-retro text-gray-400">
          <span>Showing {trips.length} curated trip guides</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>
    </div>
  );
}
