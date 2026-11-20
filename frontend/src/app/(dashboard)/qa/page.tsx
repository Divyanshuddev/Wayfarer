"use client";

import { QuestionCard } from "@/components/qa/QuestionCard";
import { getApiBaseUrl } from "@/lib/api-config";
import { tripStore } from "@/lib/storage/trip-store";
import { AITravelAdvice, TripQuestion } from "@/types/trip";
import {
  Brain,
  CheckCircle2,
  Filter,
  HelpCircle,
  Hotel,
  MapPin,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export default function QAHubPage() {
  const [questions, setQuestions] = useState<TripQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDestination, setSelectedDestination] = useState<string>("all");

  // New question form state
  const [showAskModal, setShowAskModal] = useState(false);
  const [destInput, setDestInput] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [catInput, setCatInput] = useState<TripQuestion["category"]>("hotel_price");
  const [authorNameInput, setAuthorNameInput] = useState("");

  // AI Advisor state
  const [advisorCity, setAdvisorCity] = useState("Kyoto");
  const [isQueryingAI, setIsQueryingAI] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<AITravelAdvice | null>({
    destination: "Kyoto",
    estimated_hotel_price: "$75 - $140 / night",
    best_time: "October to late November (autumn foliage) or April (cherry blossoms)",
    safety_rating: "Extremely Safe (9.8/10)",
    answer: "Kyoto offers incredible value if you stay near central Karasuma or Kyoto Station. Traditional ryokans range from $180-$300, while stylish boutique design hotels are around $80/night. Book well in advance for autumn.",
    pros: [
      "World-class cuisine with $8 street ramen and Michelin tea houses",
      "Remarkably safe with spotless streets and easy subway transit",
      "Serene sunrise walks at Fushimi Inari and bamboo forests",
    ],
    cons: [
      "Midday tourist crowding at Kiyomizu-dera and Golden Pavilion",
      "Many authentic cafes remain cash-only",
      "Ryokans book out 3 months in advance",
    ],
  });

  useEffect(() => {
    const update = () => {
      let list = tripStore.getQuestions(selectedDestination);
      if (selectedCategory !== "all") {
        list = list.filter((q) => q.category === selectedCategory);
      }
      setQuestions(list);
    };
    update();
    return tripStore.subscribe(update);
  }, [selectedCategory, selectedDestination]);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destInput.trim() || !questionInput.trim()) return;

    tripStore.addQuestion({
      destination: destInput.trim(),
      question: questionInput.trim(),
      category: catInput,
      author_name: authorNameInput.trim() || "Curious Traveler",
    });

    setQuestionInput("");
    setShowAskModal(false);
  };

  const handleFetchAIAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorCity.trim()) return;

    setIsQueryingAI(true);
    try {
      // 1. Try FastAPI backend
      const res = await fetch(`${getApiBaseUrl()}/api/v1/qa/ai-advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: advisorCity.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAdvice(data);
        setIsQueryingAI(false);
        return;
      }
    } catch (err) {
      console.log("Using local AI intel fallback");
    }

    // 2. Fallback heuristic responses for common cities
    const city = advisorCity.trim().toLowerCase();
    let advice: AITravelAdvice = {
      destination: advisorCity.trim(),
      estimated_hotel_price: "$90 - $180 / night",
      best_time: "May to October for pleasant weather",
      safety_rating: "High (8.5/10)",
      answer: `Visiting ${advisorCity}? Accommodations range depending on central location vs outer districts. Community travelers recommend staying near transit hubs for easiest navigation.`,
      pros: [
        "Rich culture and diverse local food offerings",
        "Excellent walkable centers and scenic viewpoints",
        "Strong public transit options",
      ],
      cons: [
        "Peak summer surge pricing on hotels and flights",
        "Tourist lines at major historical landmarks",
      ],
    };

    if (city.includes("bali")) {
      advice = {
        destination: "Bali",
        estimated_hotel_price: "$25 - $70 / night",
        best_time: "May to September (Dry season)",
        safety_rating: "High (8.8/10)",
        answer: "Bali offers private pool villas for $50/night in Ubud and Canggu. Renting a scooter or using Gojek/Grab is the cheapest way to explore.",
        pros: ["Unbeatable villa value with infinity pools", "Outstanding health cafes and smoothies", "Tropical beach sunsets"],
        cons: ["Canggu traffic jams", "Occasional Bali Belly if drinking tap water"],
      };
    } else if (city.includes("amalfi") || city.includes("positano")) {
      advice = {
        destination: "Amalfi Coast",
        estimated_hotel_price: "$180 - $350 / night",
        best_time: "May or September (warm seas, fewer crowds)",
        safety_rating: "Very Safe (9.2/10)",
        answer: "Hotels in Positano are pricey ($250+/night). Smart travelers stay in Praiano or Amalfi town for $130-$170 and take ferries between villages.",
        pros: ["Cliffside Mediterranean panoramas", "World-class lemon pasta and seafood", "Capri boat charters"],
        cons: ["Very expensive peak season", "Hundreds of steep steps everywhere"],
      };
    } else if (city.includes("zermatt") || city.includes("swiss")) {
      advice = {
        destination: "Zermatt",
        estimated_hotel_price: "$130 - $220 / night",
        best_time: "July-August for hiking, Jan-March for skiing",
        safety_rating: "Pristine (9.9/10)",
        answer: "Zermatt is completely car-free. Hotels are boutique and high quality. Get a Swiss Rail Pass to cut cable car and train costs by 50%.",
        pros: ["Iconic Matterhorn mountain views", "Spotless alpine air and rail transit", "Delicious Swiss fondue"],
        cons: ["High dining costs ($40+ meals)", "Sudden alpine weather shifts"],
      };
    }

    setAiAdvice(advice);
    setIsQueryingAI(false);
  };

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "hotel_price", label: "Hotel Prices", icon: Hotel },
    { id: "safety", label: "Safety & Solo", icon: ShieldCheck },
    { id: "food", label: "Food & Dining" },
    { id: "transport", label: "Transit & Scooters" },
    { id: "itinerary", label: "Itinerary Tips" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#201d32] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Traveler Q&A & Hotel Price Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Ask community travelers who have visited. Get accurate hotel rates, safety advice, and route tips.
          </p>
        </div>

        <button
          onClick={() => setShowAskModal(true)}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)] flex items-center gap-2 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ask the Community</span>
        </button>
      </div>

      {/* FASTAPI AI TRAVEL ADVISOR WIDGET */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#100e20] to-[#141228] border border-sky-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-600/40 flex items-center justify-center text-sky-400">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-100 flex items-center gap-2">
                AI Travel Intel & Hotel Price Estimator
                <span className="text-[10px] font-mono-retro px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  gpt-4o-mini
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Instant hotel price ranges, pros, cons, and safety rating for any destination.
              </p>
            </div>
          </div>
        </div>

        {/* AI Query Form */}
        <form onSubmit={handleFetchAIAdvice} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
            <input
              type="text"
              placeholder="Enter destination (e.g. Kyoto, Bali, Amalfi Coast, Zermatt, Tokyo, Paris)..."
              value={advisorCity}
              onChange={(e) => setAdvisorCity(e.target.value)}
              className="w-full bg-[#18162e] border border-[#2b2748] focus:border-sky-500 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isQueryingAI || !advisorCity.trim()}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 transition-all shadow-[0_0_12px_rgba(56,189,248,0.3)] flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isQueryingAI ? "Analyzing..." : "Get Intel"}</span>
          </button>
        </form>

        {/* AI Result Card */}
        {aiAdvice && (
          <div className="p-4 rounded-xl bg-[#0c0b14]/90 border border-[#24213d] space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c1a2e] pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-100">{aiAdvice.destination} Intel</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-retro bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 flex items-center gap-1">
                  <Hotel className="w-3 h-3" />
                  Avg Hotel: {aiAdvice.estimated_hotel_price}
                </span>
              </div>
              <span className="text-[11px] font-mono-retro text-sky-300">
                Safety: {aiAdvice.safety_rating}
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed font-sans">{aiAdvice.answer}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Pros */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                <span className="text-[10px] font-mono-retro font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> PROS
                </span>
                {aiAdvice.pros.map((p, i) => (
                  <p key={i} className="text-emerald-200/90 text-[11px]">• {p}</p>
                ))}
              </div>

              {/* Cons */}
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-1">
                <span className="text-[10px] font-mono-retro font-bold text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> CONS & ALERTS
                </span>
                {aiAdvice.cons.map((c, i) => (
                  <p key={i} className="text-rose-200/90 text-[11px]">• {c}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono-retro whitespace-nowrap transition-all ${selectedCategory === cat.id
              ? "bg-sky-500 text-white font-medium shadow-[0_0_10px_rgba(56,189,248,0.3)]"
              : "bg-[#141224] text-gray-400 border border-[#252238] hover:text-white"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Questions Feed */}
      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((q) => <QuestionCard key={q.id} question={q} />)
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#0c0b14]/70 border border-[#222036] space-y-3">
            <HelpCircle className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-gray-300 font-medium">No questions found in this category.</p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-xs text-sky-400 underline font-mono-retro"
            >
              Show all questions
            </button>
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c0b14] border border-[#2a2644] p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#201d32] pb-3">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                Ask the Travel Community
              </h3>
              <button
                onClick={() => setShowAskModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAskSubmit} className="space-y-3">
              <div>
                <label className="block font-medium text-gray-300 mb-1">
                  Destination City / Region <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto, Bali, Positano, Zermatt"
                  value={destInput}
                  onChange={(e) => setDestInput(e.target.value)}
                  className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-300 mb-1">Category</label>
                  <select
                    value={catInput}
                    onChange={(e) => setCatInput(e.target.value as any)}
                    className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200 font-mono-retro"
                  >
                    <option value="hotel_price">Hotel Price</option>
                    <option value="safety">Safety</option>
                    <option value="food">Food</option>
                    <option value="transport">Transit</option>
                    <option value="itinerary">Itinerary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="Planning Traveler"
                    value={authorNameInput}
                    onChange={(e) => setAuthorNameInput(e.target.value)}
                    className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-300 mb-1">
                  Your Question <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Be specific (e.g. What is realistic hotel pricing near transit? Is renting a scooter safe?)"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl p-3 text-gray-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-3 py-1.5 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium"
                >
                  Publish Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
