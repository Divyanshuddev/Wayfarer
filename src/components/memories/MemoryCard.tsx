"use client";

import { Memory } from "@/types/database";
import {
  Calendar,
  Compass,
  FileText,
  Heart,
  Image as ImageIcon,
  Link as LinkIcon,
  MapPin,
  Mic,
  Pin,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface MemoryCardProps {
  memory: Memory;
  onToggleFavorite?: (id: string) => void;
  onTogglePin?: (id: string) => void;
}

export function MemoryCard({
  memory,
  onToggleFavorite,
  onTogglePin,
}: MemoryCardProps) {
  const formattedDate = new Date(memory.memory_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const sentimentColorMap = {
    positive: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    reflective: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]",
    neutral: "bg-gray-400",
    negative: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]",
  };

  const categoryColorMap: Record<string, string> = {
    thought: "text-purple-400 border-purple-800/50 bg-purple-950/30",
    event: "text-amber-400 border-amber-800/50 bg-amber-950/30",
    conversation: "text-pink-400 border-pink-800/50 bg-pink-950/30",
    reading: "text-blue-400 border-blue-800/50 bg-blue-950/30",
    work: "text-emerald-400 border-emerald-800/50 bg-emerald-950/30",
    idea: "text-yellow-400 border-yellow-800/50 bg-yellow-950/30",
    media: "text-indigo-400 border-indigo-800/50 bg-indigo-950/30",
    personal: "text-rose-400 border-rose-800/50 bg-rose-950/30",
    location: "text-teal-400 border-teal-800/50 bg-teal-950/30",
  };

  const hasPhoto = memory.attachments && memory.attachments.length > 0;
  const photoUrl = hasPhoto ? memory.attachments![0].file_path : null;

  return (
    <article className="group relative rounded-xl bg-[#0f0e18]/80 hover:bg-[#151422] border border-[#232036] hover:border-purple-500/40 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_4px_24px_-4px_rgba(168,85,247,0.18)]">
      {/* Top Banner & Category */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono-retro font-medium uppercase px-2 py-0.5 rounded border ${
                categoryColorMap[memory.category] || "text-purple-400 border-purple-800/50"
              }`}
            >
              {memory.category}
            </span>
            <span
              title={`Sentiment: ${memory.sentiment}`}
              className={`w-2 h-2 rounded-full ${sentimentColorMap[memory.sentiment]}`}
            />
          </div>

          {/* Pin & Favorite quick actions */}
          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTogglePin?.(memory.id);
              }}
              title={memory.is_pinned ? "Unpin memory" : "Pin memory"}
              className={`p-1 rounded hover:bg-[#201e30] transition-colors ${
                memory.is_pinned ? "text-purple-400 fill-purple-400" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${memory.is_pinned ? "fill-purple-400" : ""}`} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite?.(memory.id);
              }}
              title={memory.is_favorite ? "Remove from favorites" : "Add to favorites"}
              className={`p-1 rounded hover:bg-[#201e30] transition-colors ${
                memory.is_favorite ? "text-rose-400 fill-rose-400" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${memory.is_favorite ? "fill-rose-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <Link href={`/memories/${memory.id}`} className="block group-hover:text-purple-200 transition-colors">
          <h3 className="font-semibold text-sm sm:text-base text-gray-100 line-clamp-2 leading-snug tracking-tight">
            {memory.title}
          </h3>
        </Link>

        {/* Date and Location */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1.5 font-mono-retro">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-400/80" />
            {formattedDate}
          </span>
          {memory.location_name && (
            <span className="flex items-center gap-1 truncate max-w-[140px]" title={memory.location_name}>
              <MapPin className="w-3 h-3 text-purple-400/80" />
              <span className="truncate">{memory.location_name}</span>
            </span>
          )}
        </div>

        {/* Summary or Snippet */}
        <p className="text-xs text-gray-300 font-serif leading-relaxed line-clamp-3 mt-2.5">
          {memory.summary || memory.content}
        </p>

        {/* Thumbnail if attached */}
        {hasPhoto && photoUrl && (
          <div className="mt-3 h-32 w-full rounded-lg overflow-hidden border border-[#27233c] relative group-hover:border-purple-500/30 transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={memory.title}
              className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono-retro text-purple-300 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>Photo</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Metadata & Chips */}
      <div className="px-5 py-3 border-t border-[#1c1a2c] bg-[#0c0b14]/50 flex items-center justify-between text-xs">
        {/* Tags & People */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-w-[80%]">
          {memory.people.slice(0, 1).map((person) => (
            <span
              key={person}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 text-[10px]"
            >
              <User className="w-2.5 h-2.5" />
              <span className="truncate max-w-[80px]">{person}</span>
            </span>
          ))}

          {memory.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded-md bg-[#191728] text-purple-300/80 text-[10px] font-mono-retro"
            >
              #{tag}
            </span>
          ))}
          {memory.tags.length > 2 && (
            <span className="text-[10px] text-gray-400 font-mono-retro">
              +{memory.tags.length - 2}
            </span>
          )}
        </div>

        {/* Source Icon Indicator */}
        <div className="flex items-center gap-2 text-gray-400">
          {memory.source_type === "voice" && (
            <span title="Voice recorded">
              <Mic className="w-3.5 h-3.5 text-purple-400" />
            </span>
          )}
          {memory.source_type === "image_ocr" && (
            <span title="Image OCR">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            </span>
          )}
          <Link
            href={`/memories/${memory.id}`}
            className="text-[11px] font-mono-retro text-purple-400 hover:text-purple-300 hover:underline"
          >
            Open →
          </Link>
        </div>
      </div>
    </article>
  );
}
