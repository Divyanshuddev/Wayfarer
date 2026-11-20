"use client";

import { TripAnswer, TripQuestion } from "@/types/trip";
import { tripStore } from "@/lib/storage/trip-store";
import {
  CheckCircle2,
  ChevronDown,
  DollarSign,
  HelpCircle,
  Hotel,
  MapPin,
  MessageSquare,
  Send,
  ShieldCheck,
  ThumbsUp,
  User,
  Utensils,
} from "lucide-react";
import React, { useState } from "react";

interface QuestionCardProps {
  question: TripQuestion;
  onAnswerAdded?: (ans: TripAnswer) => void;
}

export function QuestionCard({ question, onAnswerAdded }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answers, setAnswers] = useState<TripAnswer[]>(question.answers || []);

  // Answer form state
  const [responderName, setResponderName] = useState("");
  const [hasVisited, setHasVisited] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [hotelPrice, setHotelPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryStyles: Record<string, { label: string; color: string; icon: any }> = {
    hotel_price: {
      label: "Hotel Price",
      color: "bg-emerald-950/80 text-emerald-300 border-emerald-700/50",
      icon: Hotel,
    },
    safety: {
      label: "Safety & Solo",
      color: "bg-amber-950/80 text-amber-300 border-amber-700/50",
      icon: ShieldCheck,
    },
    food: {
      label: "Food & Dining",
      color: "bg-pink-950/80 text-pink-300 border-pink-700/50",
      icon: Utensils,
    },
    transport: {
      label: "Transit & Scooters",
      color: "bg-sky-950/80 text-sky-300 border-sky-700/50",
      icon: MapPin,
    },
    itinerary: {
      label: "Itinerary Tip",
      color: "bg-purple-950/80 text-purple-300 border-purple-700/50",
      icon: HelpCircle,
    },
  };

  const cat = categoryStyles[question.category] || categoryStyles.hotel_price;
  const CatIcon = cat.icon;

  const handleUpvote = (ansId: string) => {
    tripStore.voteAnswer(question.id, ansId);
    setAnswers((prev) =>
      prev.map((a) => (a.id === ansId ? { ...a, helpful_votes: a.helpful_votes + 1 } : a))
    );
  };

  const handlePostAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    setIsSubmitting(true);
    const newAns = tripStore.addAnswer(question.id, {
      author_name: responderName.trim() || "Helpful Traveler",
      author_visited: hasVisited,
      answer: answerText.trim(),
      hotel_name: hotelName.trim() || null,
      hotel_price_per_night: hotelPrice.trim() || null,
    });

    if (newAns) {
      setAnswers((prev) => [...prev, newAns]);
      if (onAnswerAdded) onAnswerAdded(newAns);
    }

    setAnswerText("");
    setHotelName("");
    setHotelPrice("");
    setShowAnswerForm(false);
    setIsExpanded(true);
    setIsSubmitting(false);
  };

  return (
    <div className="rounded-2xl bg-[#0c0b14]/90 border border-[#222036] hover:border-sky-500/30 transition-all p-4 sm:p-5 space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-retro font-medium border flex items-center gap-1 ${cat.color}`}
            >
              <CatIcon className="w-3 h-3" />
              <span>{cat.label}</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-retro bg-[#161426] text-sky-300 border border-sky-900/40 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-sky-400" />
              <span>{question.destination}</span>
            </span>
          </div>

          <h3 className="font-semibold text-sm sm:text-base text-gray-100 pt-1">
            {question.question}
          </h3>
        </div>

        <div className="text-right text-[11px] font-mono-retro text-gray-500 flex-shrink-0">
          <p className="text-gray-400">{question.author_name}</p>
        </div>
      </div>

      {/* Answers Preview or Toggler */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1a182a] text-xs font-mono-retro">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>
            {answers.length} {answers.length === 1 ? "Community Answer" : "Community Answers"}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>

        <button
          onClick={() => {
            setShowAnswerForm(!showAnswerForm);
            setIsExpanded(true);
          }}
          className="px-2.5 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-800/40 text-[11px] transition-all"
        >
          {showAnswerForm ? "Cancel Reply" : "+ Answer This Traveler"}
        </button>
      </div>

      {/* Answer Form */}
      {showAnswerForm && (
        <form
          onSubmit={handlePostAnswer}
          className="p-4 rounded-xl bg-[#121020] border border-sky-900/40 space-y-3 animate-in fade-in duration-150 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono-retro font-medium text-sky-300">
              Share Your Firsthand Experience
            </span>
            <label className="flex items-center gap-1.5 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasVisited}
                onChange={(e) => setHasVisited(e.target.checked)}
                className="rounded border-[#292640] text-sky-500 focus:ring-0"
              />
              <span className="text-[11px] font-mono-retro">I have visited {question.destination}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <input
                type="text"
                placeholder="Your Name / Handle"
                value={responderName}
                onChange={(e) => setResponderName(e.target.value)}
                className="w-full bg-[#161426] border border-[#272440] rounded-lg px-2.5 py-1.5 text-gray-200 placeholder-gray-500"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Hotel Name (if advising stay)"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="w-full bg-[#161426] border border-[#272440] rounded-lg px-2.5 py-1.5 text-gray-200 placeholder-gray-500"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Hotel Price (e.g. $85/night)"
                value={hotelPrice}
                onChange={(e) => setHotelPrice(e.target.value)}
                className="w-full bg-[#161426] border border-emerald-900/60 rounded-lg px-2.5 py-1.5 text-emerald-300 placeholder-gray-500 font-mono-retro"
              />
            </div>
          </div>

          <textarea
            required
            rows={3}
            placeholder="Write clear, helpful advice about hotel prices, best areas to book, transport, or safety..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className="w-full bg-[#161426] border border-[#272440] focus:border-sky-500 rounded-lg p-2.5 text-gray-200 placeholder-gray-500 focus:outline-none"
          />

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !answerText.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Answer</span>
            </button>
          </div>
        </form>
      )}

      {/* Expanded Answers List */}
      {isExpanded && answers.length > 0 && (
        <div className="space-y-3 pt-2">
          {answers.map((ans) => (
            <div
              key={ans.id}
              className="p-3.5 rounded-xl bg-[#110f1e] border border-[#1e1c30] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-200">{ans.author_name}</span>
                  {ans.author_visited && (
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-mono-retro bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      VISITED
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleUpvote(ans.id)}
                  className="flex items-center gap-1 text-[11px] font-mono-retro text-gray-400 hover:text-sky-300 bg-[#161426] px-2 py-0.5 rounded border border-[#272440]"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{ans.helpful_votes} Helpful</span>
                </button>
              </div>

              <p className="text-gray-300 leading-relaxed font-sans">{ans.answer}</p>

              {/* Specific Hotel & Price Highlight */}
              {(ans.hotel_name || ans.hotel_price_per_night) && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2 text-[11px] font-mono-retro text-emerald-300">
                    <Hotel className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recommended: {ans.hotel_name || "Hotel"}</span>
                    {ans.hotel_price_per_night && (
                      <span className="font-bold text-emerald-200">
                        • {ans.hotel_price_per_night}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
