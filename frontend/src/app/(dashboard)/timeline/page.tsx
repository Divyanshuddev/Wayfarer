"use client";

import { TripCard } from "@/components/trips/TripCard";
import { tripStore } from "@/lib/storage/trip-store";
import { Trip } from "@/types/trip";
import { Calendar, Clock, Compass, Globe, Hotel, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function TimelinePage() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const update = () => {
      const list = tripStore.getTrips();
      setTrips(list);
    };
    update();
    return tripStore.subscribe(update);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#201d32] pb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Community Travel Timeline
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          A chronological stream of verified traveler journeys, seasonal tips, and firsthand hotel reports.
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l border-sky-500/20 space-y-8 ml-2 sm:ml-4">
        {trips.map((trip, idx) => (
          <div key={trip.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-4 h-4 rounded-full bg-sky-500 border-4 border-[#08080c] shadow-[0_0_10px_rgba(56,189,248,0.6)] group-hover:scale-125 transition-transform" />

            {/* Date Tag */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono-retro text-sky-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {trip.travel_dates}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-[11px] font-mono-retro text-emerald-400 flex items-center gap-1">
                <Hotel className="w-3 h-3" />
                {trip.hotel_price_range}
              </span>
            </div>

            {/* Trip Card in timeline */}
            <div className="max-w-2xl">
              <TripCard trip={trip} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
