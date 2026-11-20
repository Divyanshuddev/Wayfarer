"use client";

import { Memory } from "@/types/database";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface TimelineCalendarViewProps {
  memories: Memory[];
}

export function TimelineCalendarView({ memories }: TimelineCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayMemories, setSelectedDayMemories] = useState<Memory[] | null>(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayMemories(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayMemories(null);
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getMemoriesForDay = (day: number) => {
    return memories.filter((m) => {
      const d = new Date(m.memory_date);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  };

  const handleDayClick = (day: number) => {
    const dayMems = getMemoriesForDay(day);
    if (dayMems.length > 0) {
      setSelectedDayMemories(dayMems);
      setSelectedDateLabel(
        new Date(year, month, day).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Month Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f0e1a] border border-[#232036]">
        <h3 className="font-semibold text-base text-gray-100 font-mono-retro tracking-wider uppercase">
          {monthLabel}
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-[#151426] hover:bg-[#1d1b32] text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-[#151426] hover:bg-[#1d1b32] text-gray-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-mono-retro text-gray-400 uppercase">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-20 rounded-xl bg-[#090812]/40 opacity-20" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayMems = getMemoriesForDay(day);
          const hasMemories = dayMems.length > 0;

          return (
            <div
              key={`day-${day}`}
              onClick={() => handleDayClick(day)}
              className={`h-20 p-2 rounded-xl border flex flex-col justify-between transition-all ${
                hasMemories
                  ? "bg-[#121122] hover:bg-purple-950/40 border-purple-500/30 cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                  : "bg-[#0b0a14] border-[#1b1928] opacity-60"
              }`}
            >
              <span className="text-xs font-mono-retro text-gray-300 font-medium">
                {day}
              </span>

              {hasMemories && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" />
                  <span className="text-[10px] font-mono-retro text-purple-300">
                    {dayMems.length} mem
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day Drawer / Selected Day Preview */}
      {selectedDayMemories && (
        <div className="p-5 rounded-2xl bg-[#100f1c] border border-purple-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#211f34] pb-2">
            <h4 className="text-sm font-semibold text-gray-100 font-mono-retro">
              Memories on {selectedDateLabel}
            </h4>
            <span className="text-xs text-purple-300 font-mono-retro">
              {selectedDayMemories.length} record(s)
            </span>
          </div>

          <div className="space-y-2">
            {selectedDayMemories.map((m) => (
              <Link
                key={m.id}
                href={`/memories/${m.id}`}
                className="block p-3 rounded-xl bg-[#151426] hover:bg-[#1a1930] border border-[#26233e] group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-200 group-hover:text-purple-200">
                    {m.title}
                  </span>
                  <span className="text-[10px] font-mono-retro uppercase px-1.5 py-0.5 rounded bg-purple-950 text-purple-300">
                    {m.category}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-serif line-clamp-1 mt-1">
                  {m.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
