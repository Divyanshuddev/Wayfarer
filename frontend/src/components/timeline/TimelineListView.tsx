"use client";

import { Memory } from "@/types/database";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

interface TimelineListViewProps {
  memories: Memory[];
}

export function TimelineListView({ memories }: TimelineListViewProps) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const thisWeekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const groups: {
    Today: Memory[];
    Yesterday: Memory[];
    "This Week": Memory[];
    "This Month": Memory[];
    Earlier: Memory[];
  } = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    "This Month": [],
    Earlier: [],
  };

  memories.forEach((mem) => {
    const time = new Date(mem.memory_date).getTime();
    if (time >= todayStart) {
      groups["Today"].push(mem);
    } else if (time >= yesterdayStart) {
      groups["Yesterday"].push(mem);
    } else if (time >= thisWeekStart) {
      groups["This Week"].push(mem);
    } else if (time >= thisMonthStart) {
      groups["This Month"].push(mem);
    } else {
      groups["Earlier"].push(mem);
    }
  });

  const activeGroups = Object.entries(groups).filter(
    ([, items]) => items.length > 0
  );

  if (activeGroups.length === 0) {
    return (
      <div className="p-16 text-center rounded-2xl bg-[#0C0C12] border border-dashed border-[#252238] space-y-4 shadow-xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-[#8B5CF6]">
          <Clock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#F4F3F8]">
            Timeline is Waiting for Moments
          </h3>
          <p className="text-xs text-[#8E8AA6] max-w-md mx-auto">
            Your timeline automatically groups memories into Today, Yesterday, This Week, and Earlier as you capture them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#8B5CF6] before:via-purple-900 before:to-transparent">
      {activeGroups.map(([groupTitle, items]) => (
        <div key={groupTitle} className="space-y-4">
          {/* Timeframe Marker */}
          <div className="relative -left-6 sm:-left-8 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-purple-950 border-2 border-[#8B5CF6] flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.6)]">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <span className="font-mono-retro font-bold text-xs sm:text-sm text-[#C084FC] uppercase tracking-wider bg-[#0C0C12] px-2.5 py-0.5 rounded border border-purple-800/40">
              {groupTitle} ({items.length})
            </span>
          </div>

          {/* Group's Memories */}
          <div className="space-y-3">
            {items.map((mem) => {
              const dateStr = new Date(mem.memory_date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const timeStr = new Date(mem.memory_date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <article
                  key={mem.id}
                  className="p-4 rounded-xl bg-[#0C0C12] hover:bg-[#12121B] border border-[#252238] hover:border-[#8B5CF6]/40 transition-all duration-200 group shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono-retro uppercase px-1.5 py-0.5 rounded bg-purple-950/60 text-[#C084FC] border border-purple-800/40">
                          {mem.category}
                        </span>
                        <span className="text-[9px] font-mono-retro text-[#8E8AA6] px-1.5 py-0.5 rounded bg-[#191926] border border-[#252238] uppercase">
                          [{mem.memory_type}]
                        </span>
                        <span className="text-[11px] font-mono-retro text-[#8E8AA6]">
                          {dateStr} • {timeStr}
                        </span>
                      </div>

                      <Link href={`/memories/${mem.id}`}>
                        <h4 className="font-semibold text-sm sm:text-base text-[#F4F3F8] group-hover:text-[#C084FC] transition-colors truncate">
                          {mem.title}
                        </h4>
                      </Link>

                      <p className="text-xs text-[#8E8AA6] font-serif leading-relaxed line-clamp-2">
                        {mem.ai_summary || mem.summary || mem.description || mem.content}
                      </p>

                      {mem.location_name && (
                        <div className="flex items-center gap-1 text-[11px] text-[#8E8AA6] font-mono-retro pt-1">
                          <MapPin className="w-3 h-3 text-[#8B5CF6]" />
                          <span>{mem.location_name}</span>
                        </div>
                      )}
                    </div>

                    {mem.attachments && mem.attachments.length > 0 && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#252238] flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mem.attachments[0].storage_path || mem.attachments[0].file_path}
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
