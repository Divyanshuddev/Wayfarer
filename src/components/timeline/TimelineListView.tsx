"use client";

import { Memory } from "@/types/database";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

interface TimelineListViewProps {
  memories: Memory[];
}

export function TimelineListView({ memories }: TimelineListViewProps) {
  // Group memories by Year and Month
  const grouped: Record<string, Memory[]> = {};

  memories.forEach((mem) => {
    const d = new Date(mem.memory_date);
    const key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(mem);
  });

  const sentimentDotMap: Record<string, string> = {
    positive: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
    reflective: "bg-purple-400 shadow-[0_0_8px_#c084fc]",
    neutral: "bg-gray-400",
    negative: "bg-rose-400 shadow-[0_0_8px_#fb7185]",
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:via-purple-900 before:to-transparent">
      {Object.entries(grouped).map(([monthYear, items]) => (
        <div key={monthYear} className="space-y-4">
          {/* Month Marker */}
          <div className="relative -left-6 sm:-left-8 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-purple-900 border-2 border-purple-400 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.6)]">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <span className="font-mono-retro font-bold text-xs sm:text-sm text-purple-200 uppercase tracking-wider bg-[#0a0912] px-2 py-0.5 rounded border border-purple-800/40">
              {monthYear}
            </span>
          </div>

          {/* Month's Memories */}
          <div className="space-y-3">
            {items.map((mem) => {
              const dateStr = new Date(mem.memory_date).toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
              });
              const timeStr = new Date(mem.memory_date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <article
                  key={mem.id}
                  className="p-4 rounded-xl bg-[#0f0e1a]/90 hover:bg-[#141324] border border-[#232036] hover:border-purple-500/40 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${sentimentDotMap[mem.sentiment]}`}
                        />
                        <span className="text-[10px] font-mono-retro uppercase px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                          {mem.category}
                        </span>
                        <span className="text-[11px] font-mono-retro text-gray-400">
                          {dateStr} • {timeStr}
                        </span>
                      </div>

                      <Link href={`/memories/${mem.id}`}>
                        <h4 className="font-semibold text-sm sm:text-base text-gray-100 group-hover:text-purple-200 transition-colors">
                          {mem.title}
                        </h4>
                      </Link>

                      <p className="text-xs text-gray-300 font-serif leading-relaxed line-clamp-2">
                        {mem.summary || mem.content}
                      </p>

                      {mem.location_name && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono-retro pt-1">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          <span>{mem.location_name}</span>
                        </div>
                      )}
                    </div>

                    {mem.attachments && mem.attachments.length > 0 && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#25223c] flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mem.attachments[0].file_path}
                          alt={mem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
