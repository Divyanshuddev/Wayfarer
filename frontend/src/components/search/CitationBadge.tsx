"use client";

import { MemoryCitation } from "@/types/database";
import { BookMarked, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

interface CitationBadgeProps {
  citation: MemoryCitation;
}

export function CitationBadge({ citation }: CitationBadgeProps) {
  return (
    <Link
      href={`/memories/${citation.memory_id}`}
      title={citation.snippet}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-700/50 hover:border-purple-500 text-xs font-mono-retro transition-all shadow-[0_0_8px_rgba(168,85,247,0.2)] group"
    >
      <BookMarked className="w-3 h-3 text-purple-400 group-hover:text-purple-300" />
      <span className="font-semibold truncate max-w-[150px]">{citation.title}</span>
      <span className="text-[10px] text-gray-400">({citation.date})</span>
      <ExternalLink className="w-2.5 h-2.5 text-purple-400 opacity-60 group-hover:opacity-100" />
    </Link>
  );
}
