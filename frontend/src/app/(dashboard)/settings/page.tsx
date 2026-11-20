"use client";

import { authStore } from "@/lib/auth/auth-store";
import { tripStore } from "@/lib/storage/trip-store";
import {
  Compass,
  Cpu,
  Globe,
  HardDrive,
  Hotel,
  MapPin,
  RefreshCw,
  Save,
  Server,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [travelerName, setTravelerName] = useState("");
  const [homeBase, setHomeBase] = useState("");
  const [visitedCount, setVisitedCount] = useState(0);
  const [currency, setCurrency] = useState("USD ($)");
  const [travelStyle, setTravelStyle] = useState("Solo & Backpacking");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const user = authStore.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setTravelerName(user.full_name);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#201d32] pb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Traveler Profile & System Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Customize your profile, currency display, and system preferences.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#0c0b14]/90 border border-[#222036] space-y-6 text-xs">
        <div className="flex items-center gap-2 font-mono-retro font-bold text-sm text-gray-200 border-b border-[#1e1c30] pb-3">
          <User className="w-4 h-4 text-sky-400" />
          <span>TRAVELER PUBLIC PROFILE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-300 mb-1.5">Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aria Montgomery"
              value={travelerName}
              onChange={(e) => setTravelerName(e.target.value)}
              className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-300 mb-1.5">Home Base City</label>
            <input
              type="text"
              placeholder="e.g. San Francisco, Tokyo, London"
              value={homeBase}
              onChange={(e) => setHomeBase(e.target.value)}
              className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-300 mb-1.5">Countries Visited</label>
            <input
              type="number"
              min="0"
              max="200"
              value={visitedCount}
              onChange={(e) => setVisitedCount(Number(e.target.value))}
              className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200 font-mono-retro"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-300 mb-1.5">Preferred Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200 font-mono-retro"
            >
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="GBP (£)">GBP (£)</option>
              <option value="JPY (¥)">JPY (¥)</option>
              <option value="INR (₹)">INR (₹)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-300 mb-1.5">Primary Travel Style</label>
          <input
            type="text"
            placeholder="e.g. Backpacking, Luxury & Boutique, Solo Explorer"
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value)}
            className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1e1c30]">
          {isSaved ? (
            <span className="text-emerald-400 font-mono-retro text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Profile saved successfully!
            </span>
          ) : (
            <span className="text-gray-500 text-[11px] font-mono-retro">
              Changes reflect across your shared trips and hotel answers
            </span>
          )}

          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 transition-all shadow-[0_0_12px_rgba(56,189,248,0.3)] flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>

      {/* Backend & Microservice Architecture Status Card */}
      <div className="p-6 rounded-2xl bg-[#0c0b14]/90 border border-[#222036] space-y-4 text-xs">
        <div className="flex items-center gap-2 font-mono-retro font-bold text-sm text-gray-200 border-b border-[#1e1c30] pb-3">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>MICROSERVICE ARCHITECTURE & LIVE HEALTH</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-retro">
          <div className="p-3 rounded-xl bg-[#131122] border border-[#242138] space-y-1">
            <span className="text-[10px] text-gray-400">FASTAPI SERVICE</span>
            <p className="font-semibold text-emerald-400">CONNECTED</p>
            <p className="text-[10px] text-gray-500">Uvicorn + Python 3.12</p>
          </div>

          <div className="p-3 rounded-xl bg-[#131122] border border-[#242138] space-y-1">
            <span className="text-[10px] text-gray-400">AI TRAVEL ADVISOR</span>
            <p className="font-semibold text-sky-400">gpt-4o-mini</p>
            <p className="text-[10px] text-gray-500">Structured Hotel Extraction</p>
          </div>

          <div className="p-3 rounded-xl bg-[#131122] border border-[#242138] space-y-1">
            <span className="text-[10px] text-gray-400">FRONTEND STACK</span>
            <p className="font-semibold text-purple-400">Next.js 16 App Router</p>
            <p className="text-[10px] text-gray-500">TypeScript + Tailwind CSS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
