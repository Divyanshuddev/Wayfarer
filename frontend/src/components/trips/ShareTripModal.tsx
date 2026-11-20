"use client";

import { Trip } from "@/types/trip";
import { tripStore } from "@/lib/storage/trip-store";
import {
  Camera,
  CheckCircle2,
  DollarSign,
  Hotel,
  MapPin,
  Plus,
  Trash2,
  Upload,
  Utensils,
  X,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated?: (trip: Trip) => void;
}

export function ShareTripModal({ isOpen, onClose, onTripCreated }: ShareTripModalProps) {
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [title, setTitle] = useState("");
  const [travelDates, setTravelDates] = useState("");
  const [durationDays, setDurationDays] = useState(5);
  const [travelStyle, setTravelStyle] = useState<Trip["travel_style"]>("Couple");
  const [budgetTotal, setBudgetTotal] = useState("$1,200");
  const [hotelPriceRange, setHotelPriceRange] = useState("$80 - $140 / night");
  const [summary, setSummary] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [bestTimeToVisit, setBestTimeToVisit] = useState("");
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80"
  );

  // Dynamic Pros & Cons Lists
  const [pros, setPros] = useState<string[]>([
    "Super clean, safe streets and polite locals",
    "Astonishing street food and world-class coffee cafes",
  ]);
  const [newPro, setNewPro] = useState("");

  const [cons, setCons] = useState<string[]>([
    "Heavy afternoon traffic; rent a scooter or walk instead of taxis",
    "Peak tourist spots book out weeks ahead",
  ]);
  const [newCon, setNewCon] = useState("");

  // Hotel recommendations
  const [hotels, setHotels] = useState<string[]>([
    "Sakura Boutique Hotel ($85/night - central location, free breakfast)",
  ]);
  const [newHotel, setNewHotel] = useState("");

  // Food recommendations
  const [foods, setFoods] = useState<string[]>([
    "Local noodle bar in the alley behind main station ($6/bowl)",
  ]);
  const [newFood, setNewFood] = useState("");

  // Sample quick images
  const [imageUrls, setImageUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddPro = () => {
    if (newPro.trim()) {
      setPros([...pros, newPro.trim()]);
      setNewPro("");
    }
  };

  const handleRemovePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleAddCon = () => {
    if (newCon.trim()) {
      setCons([...cons, newCon.trim()]);
      setNewCon("");
    }
  };

  const handleRemoveCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleAddHotel = () => {
    if (newHotel.trim()) {
      setHotels([...hotels, newHotel.trim()]);
      setNewHotel("");
    }
  };

  const handleRemoveHotel = (index: number) => {
    setHotels(hotels.filter((_, i) => i !== index));
  };

  const handleAddFood = () => {
    if (newFood.trim()) {
      setFoods([...foods, newFood.trim()]);
      setNewFood("");
    }
  };

  const handleRemoveFood = (index: number) => {
    setFoods(foods.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !title.trim()) return;

    setIsSubmitting(true);

    const tripData = {
      user_id: "usr-current-traveler",
      author_name: "You (Verified Traveler)",
      author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      title: title.trim(),
      destination: destination.trim(),
      country: country.trim() || "Global",
      travel_dates: travelDates.trim() || "Recent Trip",
      duration_days: Number(durationDays) || 5,
      travel_style: travelStyle,
      budget_total: budgetTotal.trim() || "$1,000",
      hotel_price_range: hotelPriceRange.trim() || "$70 - $130 / night",
      summary: summary.trim() || `Trip to ${destination} with firsthand recommendations and pros/cons.`,
      itinerary: itinerary.trim() || "Day-by-day exploration of highlights.",
      pros: pros.length > 0 ? pros : ["Safe, welcoming atmosphere with rich culture"],
      cons: cons.length > 0 ? cons : ["Book accommodations in advance during peak season"],
      best_time_to_visit: bestTimeToVisit.trim() || "Spring or Autumn for pleasant weather",
      local_food_recommendations: foods,
      hotel_recommendations: hotels,
      images: imageUrls.map((url, idx) => ({
        id: `img-${Date.now()}-${idx}`,
        url,
        caption: `${destination} highlight`,
        place_type: (idx === 0 ? "hotel" : "spot") as any,
      })),
      cover_image: coverImage.trim() || imageUrls[0] || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80",
    };

    // 1. Add to local trip store for instant reactivity
    const newTrip = tripStore.addTrip(tripData);

    // 2. Optionally sync with FastAPI backend in background
    try {
      await fetch("http://localhost:8001/api/v1/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });
    } catch (err) {
      // Local store already handled it
      console.log("FastAPI backend sync info:", err);
    }

    setIsSubmitting(false);
    if (onTripCreated) onTripCreated(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-3xl my-8 rounded-2xl bg-[#0c0b14] border border-[#2a2644] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#222036] bg-[#110f1d] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-retro bg-sky-950/80 text-sky-400 border border-sky-800/50">
                COMMUNITY INTEL
              </span>
              <h2 className="text-lg font-bold text-gray-100">
                Share Trip & Firsthand Advice
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Help future travelers with real hotel prices, pros, cons, and unedited tips.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1f1d32] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Destination & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-300 mb-1.5">
                Destination City / Region <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto, Bali, Amalfi Coast, Zermatt"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl pl-9 pr-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-300 mb-1.5">
                Country <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Japan, Indonesia, Italy, Switzerland"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium text-gray-300 mb-1.5">
              Trip Title / Catchy Summary <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kyoto in Autumn: Golden Temples, Bamboo Groves & Traditional Ryokans"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* Key Metrics: Duration, Style, Total Budget, Hotel Price Range */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-gray-300 mb-1">Duration (Days)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-300 mb-1">Travel Style</label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value as any)}
                className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
              >
                <option value="Solo">Solo</option>
                <option value="Couple">Couple</option>
                <option value="Family">Family</option>
                <option value="Backpacking">Backpacking</option>
                <option value="Luxury">Luxury</option>
                <option value="Friends">Friends</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-300 mb-1">Total Trip Budget</label>
              <input
                type="text"
                placeholder="$1,200"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(e.target.value)}
                className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
              />
            </div>

            <div>
              <label className="block font-medium text-emerald-400 mb-1 flex items-center gap-1">
                <Hotel className="w-3.5 h-3.5" />
                Hotel Price / Night
              </label>
              <input
                type="text"
                placeholder="$75 - $130 / night"
                value={hotelPriceRange}
                onChange={(e) => setHotelPriceRange(e.target.value)}
                className="w-full bg-[#141224] border border-emerald-600/40 focus:border-emerald-500 rounded-xl px-3 py-2 text-emerald-300 font-mono-retro"
              />
            </div>
          </div>

          {/* Travel Dates & Best Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-300 mb-1">When did you travel?</label>
              <input
                type="text"
                placeholder="e.g. Oct 14 - Oct 21, 2024"
                value={travelDates}
                onChange={(e) => setTravelDates(e.target.value)}
                className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-300 mb-1">Best Season To Visit</label>
              <input
                type="text"
                placeholder="e.g. October to late November for autumn foliage"
                value={bestTimeToVisit}
                onChange={(e) => setBestTimeToVisit(e.target.value)}
                className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
              />
            </div>
          </div>

          {/* Summary / Experience */}
          <div>
            <label className="block font-medium text-gray-300 mb-1">
              Trip Overview & Honest Experience
            </label>
            <textarea
              rows={3}
              placeholder="Tell other travelers what your trip was like, what surprised you, and highlights you'll never forget..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl p-3 text-gray-200 placeholder-gray-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* PROS LIST (Emerald) */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono-retro font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                THE PROS (What made this destination incredible)
              </span>
              <span className="text-[10px] text-emerald-300/80 font-mono-retro">{pros.length} items</span>
            </div>

            <div className="space-y-1.5">
              {pros.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-emerald-950/40 border border-emerald-800/40 rounded-lg px-3 py-1.5 text-emerald-200"
                >
                  <span className="flex-1 mr-2">• {p}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePro(idx)}
                    className="text-emerald-400 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a pro (e.g. Inexpensive Michelin ramen, friendly locals, reliable subway)..."
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPro();
                  }
                }}
                className="flex-1 bg-[#141224] border border-emerald-900/60 rounded-xl px-3 py-1.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddPro}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Pro
              </button>
            </div>
          </div>

          {/* CONS LIST (Ruby/Rose) */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono-retro font-semibold text-rose-400">
                <XCircle className="w-4 h-4 text-rose-400" />
                THE CONS & CAUTIONS (What sucked or what to watch out for)
              </span>
              <span className="text-[10px] text-rose-300/80 font-mono-retro">{cons.length} items</span>
            </div>

            <div className="space-y-1.5">
              {cons.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-rose-950/40 border border-rose-800/40 rounded-lg px-3 py-1.5 text-rose-200"
                >
                  <span className="flex-1 mr-2">• {c}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCon(idx)}
                    className="text-rose-400 hover:text-white p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a con (e.g. Brutal traffic, cash-only cafes, expensive beach chairs)..."
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCon();
                  }
                }}
                className="flex-1 bg-[#141224] border border-rose-900/60 rounded-xl px-3 py-1.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddCon}
                className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Con
              </button>
            </div>
          </div>

          {/* Hotel Recommendations & Prices */}
          <div className="p-4 rounded-xl bg-[#131122] border border-[#242138] space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono-retro font-semibold text-gray-200">
                <Hotel className="w-4 h-4 text-sky-400" />
                HOTEL & STAY RECOMMENDATIONS (With Prices)
              </span>
            </div>

            <div className="space-y-1.5">
              {hotels.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-[#19172c] border border-[#2b2746] rounded-lg px-3 py-1.5 text-gray-300"
                >
                  <span className="flex-1 mr-2">{h}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHotel(idx)}
                    className="text-gray-400 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Hotel Name & Price (e.g. Samyama Villa - $52/night, clean pool & fast wifi)..."
                value={newHotel}
                onChange={(e) => setNewHotel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddHotel();
                  }
                }}
                className="flex-1 bg-[#141224] border border-[#282540] rounded-xl px-3 py-1.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleAddHotel}
                className="px-3 py-1.5 rounded-xl bg-[#282542] hover:bg-[#343058] text-gray-200 font-medium"
              >
                Add Hotel
              </button>
            </div>
          </div>

          {/* Cover Image & Photo Gallery */}
          <div className="space-y-3">
            <div>
              <label className="block font-medium text-gray-300 mb-1 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                Cover Photo URL
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
              />
            </div>

            {/* Gallery previews */}
            <div>
              <label className="block font-medium text-gray-300 mb-1">
                Additional Photo URLs ({imageUrls.length} added)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Paste an image URL from Unsplash or web..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-1.5 text-gray-200"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3 py-1.5 rounded-xl bg-[#282542] hover:bg-[#343058] text-gray-200"
                >
                  Add Photo
                </button>
              </div>

              {imageUrls.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {imageUrls.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#2b2746] flex-shrink-0 group">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#222036] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1b192c] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !destination.trim() || !title.trim()}
              className="px-5 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? "Publishing Trip..." : "Publish Trip to Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
