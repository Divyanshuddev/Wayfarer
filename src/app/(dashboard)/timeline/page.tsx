"use client";

import { TimelineCalendarView } from "@/components/timeline/TimelineCalendarView";
import { TimelineListView } from "@/components/timeline/TimelineListView";
import { TimelinePhotoView } from "@/components/timeline/TimelinePhotoView";
import { shadowStore } from "@/lib/storage/store";
import { Memory } from "@/types/database";
import { Calendar, Image as ImageIcon, List, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function TimelinePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "photos">("list");

  useEffect(() => {
    const update = () => setMemories(shadowStore.getMemories());
    update();
    return shadowStore.subscribe(update);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">
            Memory Timeline
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-serif">
            Traverse your journey in chronological stream, monthly calendar, or visual photo gallery.
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center p-1 rounded-xl bg-[#0f0e1c] border border-[#232036] w-fit">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-retro transition-all ${
              viewMode === "list"
                ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Stream</span>
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-retro transition-all ${
              viewMode === "calendar"
                ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setViewMode("photos")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-retro transition-all ${
              viewMode === "photos"
                ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photo Vault</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {viewMode === "list" && <TimelineListView memories={memories} />}
      {viewMode === "calendar" && <TimelineCalendarView memories={memories} />}
      {viewMode === "photos" && <TimelinePhotoView memories={memories} />}
    </div>
  );
}
