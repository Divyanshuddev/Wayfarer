"use client";

import { QuestionCard } from "@/components/qa/QuestionCard";
import { tripStore } from "@/lib/storage/trip-store";
import { Trip, TripQuestion } from "@/types/trip";
import {
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  DollarSign,
  Heart,
  HelpCircle,
  Hotel,
  MapPin,
  MessageSquare,
  Send,
  Share2,
  Sparkles,
  Utensils,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [questions, setQuestions] = useState<TripQuestion[]>([]);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // New question form state
  const [newQuestionText, setNewQuestionText] = useState("");
  const [questionCategory, setQuestionCategory] = useState<TripQuestion["category"]>("hotel_price");
  const [askerName, setAskerName] = useState("");
  const [isSubmittingQ, setIsSubmittingQ] = useState(false);

  useEffect(() => {
    const update = () => {
      const found = tripStore.getTrip(tripId);
      if (found) {
        setTrip(found);
        setLikes(found.likes_count);
        setQuestions(tripStore.getQuestions(found.destination, tripId));
      }
    };
    update();
    return tripStore.subscribe(update);
  }, [tripId]);

  if (!trip) {
    return (
      <div className="p-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-gray-200">Trip not found</h2>
        <p className="text-xs text-gray-400">The requested trip could not be located.</p>
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-xs font-mono-retro text-sky-400 underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all trips
        </Link>
      </div>
    );
  }

  const handleLike = () => {
    if (!hasLiked) {
      tripStore.likeTrip(trip.id);
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setIsSubmittingQ(true);
    tripStore.addQuestion({
      destination: trip.destination,
      trip_id: trip.id,
      question: newQuestionText.trim(),
      category: questionCategory,
      author_name: askerName.trim() || "Planning Traveler",
    });

    setNewQuestionText("");
    setIsSubmittingQ(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-xs font-mono-retro text-gray-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Trips</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono-retro transition-all ${
              hasLiked
                ? "bg-rose-950/80 text-rose-300 border-rose-700/60"
                : "bg-[#141224] text-gray-400 border-[#252238] hover:text-rose-400 hover:border-rose-500/40"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{likes} Likes</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-[#23203c] bg-[#0c0b14] shadow-2xl">
        <div className="relative h-80 sm:h-96 w-full">
          {trip.cover_image && (
            <img
              src={trip.cover_image}
              alt={trip.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b14] via-[#0c0b14]/50 to-transparent" />

          {/* Top Overlays */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono-retro bg-black/70 backdrop-blur-md text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                {trip.destination}, {trip.country}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono-retro bg-black/70 backdrop-blur-md text-gray-200 border border-white/10">
                {trip.travel_style}
              </span>
            </div>

            {/* Hotel Price Badge */}
            <div className="px-3.5 py-1.5 rounded-full text-xs font-mono-retro font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Hotel className="w-4 h-4 text-emerald-400" />
              <span>{trip.hotel_price_range || "Hotel pricing"}</span>
            </div>
          </div>

          {/* Bottom Title & Author details */}
          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {trip.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono-retro text-gray-300">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                {trip.author_avatar ? (
                  <img
                    src={trip.author_avatar}
                    alt={trip.author_name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center text-[10px] text-white">
                    {trip.author_name[0]}
                  </div>
                )}
                <span className="text-gray-200 font-sans font-medium">{trip.author_name}</span>
              </div>

              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>{trip.travel_dates}</span>
              </div>

              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <span>{trip.duration_days} Days</span>
                <span className="text-gray-500">•</span>
                <span className="text-amber-400 font-semibold">{trip.budget_total} Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Overview / Summary */}
      <div className="p-6 rounded-2xl bg-[#0c0b14]/90 border border-[#222036] space-y-3">
        <h2 className="text-sm font-mono-retro font-bold text-gray-400 uppercase tracking-wider">
          TRIP OVERVIEW & TRAVELER EXPERIENCE
        </h2>
        <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-sans">
          {trip.summary}
        </p>

        {trip.best_time_to_visit && (
          <div className="pt-2 flex items-center gap-2 text-xs font-mono-retro text-sky-300">
            <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>Best Season To Visit: {trip.best_time_to_visit}</span>
          </div>
        )}
      </div>

      {/* SIDE-BY-SIDE PROS & CONS SHOWCASE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PROS CARD (Emerald) */}
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/30 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono-retro font-bold text-sm tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>THE PROS (WHAT WAS AMAZING)</span>
            </div>
            <span className="text-xs font-mono-retro text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
              {trip.pros.length} Highlights
            </span>
          </div>

          <div className="space-y-2.5">
            {trip.pros.map((pro, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/30 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-200"
              >
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{pro}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONS CARD (Rose/Ruby) */}
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-800/30 pb-3">
            <div className="flex items-center gap-2 text-rose-400 font-mono-retro font-bold text-sm tracking-wider">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>THE CONS & CAUTIONS (WHAT SUCKED)</span>
            </div>
            <span className="text-xs font-mono-retro text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-700/50">
              {trip.cons.length} Cautions
            </span>
          </div>

          <div className="space-y-2.5">
            {trip.cons.map((con, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/30 flex items-start gap-2.5 text-xs sm:text-sm text-rose-200"
              >
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{con}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hotel Recommendations & Food Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hotels Card */}
        <div className="p-6 rounded-2xl bg-[#0c0b14]/90 border border-[#222036] space-y-4">
          <div className="flex items-center gap-2 font-mono-retro font-bold text-sm text-gray-200">
            <Hotel className="w-4 h-4 text-emerald-400" />
            <span>RECOMMENDED HOTELS & NIGHTLY RATES</span>
          </div>

          <div className="space-y-2">
            {trip.hotel_recommendations && trip.hotel_recommendations.length > 0 ? (
              trip.hotel_recommendations.map((hotel, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#141224] border border-[#26233d] flex items-center justify-between text-xs text-gray-200"
                >
                  <span className="font-medium">{hotel}</span>
                  <span className="text-[10px] font-mono-retro text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    VERIFIED
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">General range: {trip.hotel_price_range}</p>
            )}
          </div>
        </div>

        {/* Local Food Card */}
        <div className="p-6 rounded-2xl bg-[#0c0b14]/90 border border-[#222036] space-y-4">
          <div className="flex items-center gap-2 font-mono-retro font-bold text-sm text-gray-200">
            <Utensils className="w-4 h-4 text-pink-400" />
            <span>MUST-TRY LOCAL EATS & RESTAURANTS</span>
          </div>

          <div className="space-y-2">
            {trip.local_food_recommendations && trip.local_food_recommendations.length > 0 ? (
              trip.local_food_recommendations.map((food, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#141224] border border-[#26233d] text-xs text-gray-200"
                >
                  {food}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">Explore local night markets and cafes.</p>
            )}
          </div>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      {trip.images && trip.images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono-retro font-bold text-sm text-gray-200">
            <Camera className="w-4 h-4 text-sky-400" />
            <span>PHOTO GALLERY ({trip.images.length} PHOTOS)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trip.images.map((img) => (
              <div
                key={img.id}
                className="group relative h-60 rounded-2xl overflow-hidden border border-[#23203c] bg-[#141224]"
              >
                <img
                  src={img.url}
                  alt={img.caption || "Trip photo"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="font-medium truncate">{img.caption}</span>
                  {img.place_type && (
                    <span className="text-[10px] font-mono-retro px-2 py-0.5 rounded bg-black/60 border border-white/20 uppercase text-sky-300">
                      {img.place_type}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day by Day Itinerary */}
      {trip.itinerary && (
        <div className="p-6 rounded-2xl bg-[#0c0b14]/90 border border-[#222036] space-y-4">
          <h2 className="text-sm font-mono-retro font-bold text-gray-300 uppercase tracking-wider">
            DAY-BY-DAY ROUTE & ITINERARY
          </h2>
          <div className="space-y-2 whitespace-pre-line text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
            {trip.itinerary}
          </div>
        </div>
      )}

      {/* COMMUNITY Q&A FOR THIS DESTINATION */}
      <div id="qa" className="space-y-6 pt-6 border-t border-[#201d32]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              <h2 className="text-xl font-bold text-white">
                Questions About {trip.destination}?
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Ask about hotel prices, transport, safety, or hidden gems. Community travelers will answer.
            </p>
          </div>
        </div>

        {/* Ask Question Form */}
        <form
          onSubmit={handleAskQuestion}
          className="p-5 rounded-2xl bg-[#121020] border border-sky-900/40 space-y-3"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-48">
              <label className="block text-[11px] font-mono-retro text-gray-400 mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Planning Traveler"
                value={askerName}
                onChange={(e) => setAskerName(e.target.value)}
                className="w-full bg-[#18152c] border border-[#2b2746] rounded-xl px-3 py-2 text-xs text-gray-200"
              />
            </div>

            <div className="w-full sm:w-48">
              <label className="block text-[11px] font-mono-retro text-gray-400 mb-1">
                Topic Category
              </label>
              <select
                value={questionCategory}
                onChange={(e) => setQuestionCategory(e.target.value as any)}
                className="w-full bg-[#18152c] border border-[#2b2746] rounded-xl px-3 py-2 text-xs text-gray-200 font-mono-retro"
              >
                <option value="hotel_price">Hotel Price Inquiry</option>
                <option value="safety">Safety & Solo Advice</option>
                <option value="food">Food & Dining</option>
                <option value="transport">Transit & Getting Around</option>
                <option value="itinerary">Itinerary Advice</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-mono-retro text-gray-400 mb-1">
                Your Question
              </label>
              <input
                type="text"
                required
                placeholder={`e.g. What is the average hotel price for a couple in ${trip.destination}? Are taxis safe?`}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="w-full bg-[#18152c] border border-[#2b2746] focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-gray-200"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmittingQ || !newQuestionText.trim()}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Question</span>
            </button>
          </div>
        </form>

        {/* Existing Questions List */}
        <div className="space-y-4">
          {questions.length > 0 ? (
            questions.map((q) => <QuestionCard key={q.id} question={q} />)
          ) : (
            <div className="p-8 text-center rounded-xl bg-[#0c0b14]/60 border border-[#222036] text-xs text-gray-400">
              No questions asked for this trip yet. Be the first to ask above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
