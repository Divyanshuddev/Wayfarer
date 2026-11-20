"use client";

import { TripCard } from "@/components/trips/TripCard";
import { tripStore } from "@/lib/storage/trip-store";
import { Trip } from "@/types/trip";
import { ArrowLeft, Compass, FolderHeart, Globe } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const COLLECTION_META: Record<
  string,
  { name: string; description: string; filter: (t: Trip) => boolean }
> = {
  asia: {
    name: "Asian Wonders",
    description:
      "Serene temples, neon-lit night markets, sacred mountains, and tropical coastlines.",
    filter: (t) =>
      ["Japan", "Indonesia", "Thailand", "Vietnam", "India"].includes(t.country),
  },
  europe: {
    name: "European Escapes",
    description:
      "Cobblestone alleys, Alpine panoramas, historic architecture, and Mediterranean retreats.",
    filter: (t) =>
      ["Italy", "Switzerland", "France", "Spain", "Greece"].includes(t.country),
  },
  budget: {
    name: "Backpacker Havens",
    description:
      "Incredible value destinations, authentic local eats, budget homestays, and hostels.",
    filter: (t) => t.travel_style === "Backpacking",
  },
  luxury: {
    name: "Luxury & Escapes",
    description:
      "Boutique ryokans, private cliffside villas, five-star hospitality, and scenic sanctuaries.",
    filter: (t) => t.travel_style === "Luxury" || t.travel_style === "Couple",
  },
  all: {
    name: "All Community Collections",
    description:
      "Every verified traveler guide, hotel rate breakdown, and destination review.",
    filter: () => true,
  },
};

export default function SingleCollectionPage() {
  const params = useParams();
  const id = (params?.id as string) || "all";
  const [trips, setTrips] = useState<Trip[]>([]);

  const meta = COLLECTION_META[id] || {
    name: `${id.charAt(0).toUpperCase() + id.slice(1)} Collection`,
    description:
      "Travel guides and firsthand reviews curated by the Wayfarer community.",
    filter: (t: Trip) =>
      t.destination.toLowerCase().includes(id.toLowerCase()) ||
      t.country.toLowerCase().includes(id.toLowerCase()),
  };

  useEffect(() => {
    const update = () => {
      const all = tripStore.getTrips();
      setTrips(all.filter(meta.filter));
    };
    update();
    return tripStore.subscribe(update);
  }, [id, meta.filter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 text-xs font-mono-retro text-gray-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Collections</span>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-[#0c0b14]/90 border border-sky-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <FolderHeart className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono-retro uppercase tracking-wider text-sky-400">
            Curated Community Collection
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {meta.name}
        </h1>

        <p className="text-sm text-gray-300 leading-relaxed">
          {meta.description}
        </p>

        <div className="pt-2 text-xs font-mono-retro text-gray-400">
          {trips.length} verified trip guide{trips.length === 1 ? "" : "s"}
        </div>
      </div>

      {trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-[#0c0b14]/60 border border-[#232038] space-y-3">
          <Globe className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">
            No trips currently in this collection.
          </p>
          <p className="text-xs text-gray-500">
            Share your trip to be the first guide featured in this collection!
          </p>
          <Link
            href="/trips"
            className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white"
          >
            Explore All Trips
          </Link>
        </div>
      )}
    </div>
  );
}
