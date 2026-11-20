"use client";

import { Trip } from "@/types/trip";
import { tripStore } from "@/lib/storage/trip-store";
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Heart,
  Hotel,
  MapPin,
  MessageSquare,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

interface TripCardProps {
  trip: Trip;
  onAskQuestion?: (trip: Trip) => void;
}

export function TripCard({ trip, onAskQuestion }: TripCardProps) {
  const [likes, setLikes] = useState(trip.likes_count);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasLiked) {
      tripStore.likeTrip(trip.id);
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const styleColors: Record<string, string> = {
    Solo: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    Couple: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    Family: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    Backpacking: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    Luxury: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    Friends: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  };

  return (
    <div className="group rounded-2xl bg-[#0c0b14]/90 border border-[#232038] hover:border-sky-500/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(56,189,248,0.12)] flex flex-col overflow-hidden">
      {/* Cover Image & Overlays */}
      <div className="relative h-52 w-full overflow-hidden bg-[#141224]">
        {trip.cover_image ? (
          <img
            src={trip.cover_image}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#12111d] to-[#1d1a33]">
            <MapPin className="w-10 h-10 text-sky-400/50" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b14] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono-retro font-medium border backdrop-blur-md ${
                styleColors[trip.travel_style] || "bg-sky-500/20 text-sky-300 border-sky-500/40"
              }`}
            >
              {trip.travel_style}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-retro font-medium bg-black/60 backdrop-blur-md text-gray-200 border border-white/10 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-400" />
              {trip.destination}, {trip.country}
            </span>
          </div>

          {/* Hotel Price Range Chip */}
          <div className="px-2.5 py-1 rounded-full text-[11px] font-mono-retro font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <Hotel className="w-3.5 h-3.5 text-emerald-400" />
            <span>{trip.hotel_price_range || "Hotel pricing"}</span>
          </div>
        </div>

        {/* Bottom Image Stats */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            {trip.author_avatar ? (
              <img
                src={trip.author_avatar}
                alt={trip.author_name}
                className="w-5 h-5 rounded-full object-cover border border-sky-400/60"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center text-[10px] font-bold text-white">
                {trip.author_name.charAt(0)}
              </div>
            )}
            <span className="font-medium text-[11px] text-gray-200">{trip.author_name}</span>
          </div>

          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-mono-retro">
            <span>{trip.duration_days} Days</span>
            <span className="text-gray-500">•</span>
            <span className="text-amber-400 font-semibold">{trip.budget_total}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link href={`/trips/${trip.id}`} className="block group-hover:text-sky-400 transition-colors">
            <h3 className="font-semibold text-base text-gray-100 line-clamp-1">
              {trip.title}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {trip.summary}
          </p>
        </div>

        {/* Real Pros & Cons Showcase */}
        <div className="space-y-2 pt-1 border-t border-[#1d1b2e]">
          {/* Top Pros */}
          {trip.pros && trip.pros.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-retro font-semibold tracking-wider text-emerald-400 uppercase">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>WHAT WAS GREAT (PROS)</span>
              </div>
              <div className="space-y-1">
                {trip.pros.slice(0, 2).map((pro, idx) => (
                  <div
                    key={idx}
                    className="text-[11px] text-emerald-200/90 bg-emerald-950/30 border border-emerald-800/30 rounded-lg px-2.5 py-1 flex items-start gap-1.5"
                  >
                    <span className="text-emerald-400 font-bold">•</span>
                    <span className="truncate">{pro}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Cons */}
          {trip.cons && trip.cons.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-retro font-semibold tracking-wider text-rose-400 uppercase">
                <XCircle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                <span>WHAT SUCKED (CONS & ALERTS)</span>
              </div>
              <div className="space-y-1">
                {trip.cons.slice(0, 2).map((con, idx) => (
                  <div
                    key={idx}
                    className="text-[11px] text-rose-200/90 bg-rose-950/30 border border-rose-800/30 rounded-lg px-2.5 py-1 flex items-start gap-1.5"
                  >
                    <span className="text-rose-400 font-bold">•</span>
                    <span className="truncate">{con}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-[#1d1b2e]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-mono-retro px-2 py-1 rounded-lg border transition-all ${
                hasLiked
                  ? "bg-rose-950/60 text-rose-400 border-rose-800/50"
                  : "bg-[#141224] text-gray-400 border-[#252238] hover:text-rose-400 hover:border-rose-500/40"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{likes}</span>
            </button>

            <Link
              href={`/trips/${trip.id}#qa`}
              className="flex items-center gap-1.5 text-xs font-mono-retro text-gray-400 hover:text-sky-300 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>{trip.questions_count || trip.images?.length || 0} Q&A / Photos</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {onAskQuestion && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAskQuestion(trip);
                }}
                className="px-2.5 py-1 text-[11px] font-mono-retro rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/50 hover:border-sky-500/50 transition-all"
              >
                Ask Hotel Price
              </button>
            )}

            <Link
              href={`/trips/${trip.id}`}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white transition-all shadow-[0_0_12px_rgba(56,189,248,0.25)]"
            >
              View Trip →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
