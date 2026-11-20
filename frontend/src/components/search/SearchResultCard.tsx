"use client";

import { SearchResult } from "@/types/database";
import { Calendar, Compass, MapPin, Sparkles, User } from "lucide-react";
import Link from "next/link";
import React from "react";

interface SearchResultCardProps {
  result: SearchResult;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const { memory, similarity, match_reason, highlighted_snippet } = result;

  const formattedDate = new Date(memory.memory_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const matchPercentage = Math.round(similarity * 100);

  return (
    <article className="p-4 rounded-xl bg-[#0f0e1a]/90 hover:bg-[#151324] border border-[#232036] hover:border-purple-500/40 transition-all duration-200 space-y-2.5 group">
      {/* Top Meta & Match Reasoning */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono-retro uppercase px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
            {memory.category}
          </span>
          <span className="text-[11px] font-mono-retro text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-400" />
            {formattedDate}
          </span>
        </div>

        {/* Similarity Score Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-[10px] font-mono-retro text-purple-300">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>{matchPercentage}% Match</span>
        </div>
      </div>

      {/* Memory Title */}
      <Link href={`/memories/${memory.id}`} className="block">
        <h3 className="font-semibold text-base text-gray-100 group-hover:text-purple-200 transition-colors">
          {memory.title}
        </h3>
      </Link>

      {/* Match Reason Banner */}
      <div className="text-[11px] font-mono-retro text-purple-300/90 bg-[#161426] px-2.5 py-1 rounded border border-purple-900/30">
        Reasoning: {match_reason}
      </div>

      {/* Highlighted Snippet */}
      <p className="text-xs text-gray-300 font-serif leading-relaxed line-clamp-2">
        {highlighted_snippet}
      </p>

      {/* Bottom Chips */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1c1a2c] text-[11px] font-mono-retro text-gray-400">
        <div className="flex items-center gap-2">
          {memory.location_name && (
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <MapPin className="w-3 h-3 text-purple-400" />
              {memory.location_name}
            </span>
          )}
          {memory.people.length > 0 && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-indigo-400" />
              {memory.people[0]}
            </span>
          )}
        </div>

        <Link
          href={`/memories/${memory.id}`}
          className="text-purple-400 hover:text-purple-300 hover:underline"
        >
          View Full Memory →
        </Link>
      </div>
    </article>
  );
}
