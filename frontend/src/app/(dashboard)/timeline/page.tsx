"use client";

import { TimelineCalendarView } from "@/components/timeline/TimelineCalendarView";
import { TimelineListView } from "@/components/timeline/TimelineListView";
import { TimelinePhotoView } from "@/components/timeline/TimelinePhotoView";
import { shadowStore } from "@/lib/storage/store";
import { memoryTypes } from "@/lib/validations/memory";
import { Memory } from "@/types/database";
import { Calendar, Filter, Image as ImageIcon, List, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function TimelinePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "photos">("list");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    const update = () => setMemories(shadowStore.getMemories());
    update();
    return shadowStore.subscribe(update);
  }, []);

  // Filter memories by selected year and type
  const filteredMemories = memories.filter((m) => {
    if (selectedType !== "all" && m.memory_type !== selectedType) return false;
    if (selectedYear !== "all") {
      const yr = new Date(m.memory_date).getFullYear().toString();
      if (yr !== selectedYear) return false;
    }
    return true;
  });

  // Extract distinct years from memories
  const distinctYears = Array.from(
    new Set(memories.map((m) => new Date(m.memory_date).getFullYear().toString()))
  ).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F3F8]">
            Memory Timeline
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8AA6] font-serif">
            Traverse your journey in chronological stream, monthly calendar, or visual photo gallery.
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center p-1 rounded-xl bg-[#0C0C12] border border-[#252238] w-fit shadow-md">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-retro transition-all ${
              viewMode === "list"
                ? "bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                : "text-[#8E8AA6] hover:text-[#F4F3F8]"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Stream</span>
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-retro transition-all ${
              viewMode === "calendar"
                ? "bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                : "text-[#8E8AA6] hover:text-[#F4F3F8]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setViewMode("photos")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-retro transition-all ${
              viewMode === "photos"
                ? "bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                : "text-[#8E8AA6] hover:text-[#F4F3F8]"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photo Vault</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Year & Memory Type */}
      <div className="p-3.5 rounded-xl bg-[#0C0C12] border border-[#252238] flex items-center justify-between gap-4 flex-wrap text-xs font-mono-retro">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span className="text-[#8E8AA6]">Filter Timeline:</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8E8AA6]">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#12121B] border border-[#252238] rounded-lg px-2.5 py-1 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="all">All Years</option>
              {distinctYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#8E8AA6]">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#12121B] border border-[#252238] rounded-lg px-2.5 py-1 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6] capitalize"
            >
              <option value="all">All Types</option>
              {memoryTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Render Active View */}
      {viewMode === "list" && <TimelineListView memories={filteredMemories} />}
      {viewMode === "calendar" && <TimelineCalendarView memories={filteredMemories} />}
      {viewMode === "photos" && <TimelinePhotoView memories={filteredMemories} />}
    </div>
  );
}
