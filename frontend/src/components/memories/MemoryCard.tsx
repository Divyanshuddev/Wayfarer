"use client";

import { Memory } from "@/types/database";
import {
  Calendar,
  Compass,
  FileCode,
  FileText,
  Globe,
  Heart,
  Image as ImageIcon,
  Link as LinkIcon,
  MapPin,
  Mic,
  Pin,
  Tag,
  User,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface MemoryCardProps {
  memory: Memory;
  compact?: boolean;
  onToggleFavorite?: (id: string) => void;
  onTogglePin?: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  "People & Experiences": "text-purple-300 border-purple-800/60 bg-purple-950/30",
  "Ideas & Projects": "text-indigo-300 border-indigo-800/60 bg-indigo-950/30",
  "Places & Travel": "text-teal-300 border-teal-800/60 bg-teal-950/30",
  "Documents & Receipts": "text-amber-300 border-amber-800/60 bg-amber-950/30",
  "Media & Recommendations": "text-blue-300 border-blue-800/60 bg-blue-950/30",
  "Health & Wellness": "text-emerald-300 border-emerald-800/60 bg-emerald-950/30",
  Conversations: "text-rose-300 border-rose-800/60 bg-rose-950/30",
  "Life Milestones": "text-yellow-300 border-yellow-800/60 bg-yellow-950/30",
};

const TYPE_ICONS: Record<string, any> = {
  note: FileText,
  photo: ImageIcon,
  voice: Mic,
  document: FileCode,
  conversation: Users,
  link: Globe,
  event: Calendar,
  video: Video,
};

export function MemoryCard({
  memory,
  compact = false,
  onToggleFavorite,
  onTogglePin,
}: MemoryCardProps) {
  const formattedDate = new Date(memory.memory_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const TypeIcon = TYPE_ICONS[memory.memory_type] || FileText;
  const hasPhoto = memory.attachments && memory.attachments.length > 0;
  const photoUrl = hasPhoto
    ? memory.attachments![0].storage_path || memory.attachments![0].file_path
    : null;
  const connectionsCount = memory.connections?.length || memory.links?.length || 0;

  if (compact) {
    return (
      <article className="group p-3.5 rounded-xl bg-[#0C0C12] hover:bg-[#12121B] border border-[#252238] hover:border-[#8B5CF6]/50 transition-all flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-[#191926] border border-[#252238] flex items-center justify-center text-[#C084FC] flex-shrink-0">
            <TypeIcon className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/memories/${memory.id}`}
                className="font-medium text-xs sm:text-sm text-[#F4F3F8] hover:text-[#C084FC] truncate transition-colors"
              >
                {memory.title}
              </Link>
              <span
                className={`text-[9px] font-mono-retro uppercase px-1.5 py-0.5 rounded border ${
                  CATEGORY_COLORS[memory.category] || "text-purple-300 border-purple-800/60"
                }`}
              >
                {memory.category}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-mono-retro text-[#8E8AA6] mt-0.5">
              <span>{formattedDate}</span>
              {memory.location_name && (
                <span className="truncate max-w-[120px]">{memory.location_name}</span>
              )}
              {connectionsCount > 0 && (
                <span className="text-[#C084FC]">[{connectionsCount} LINKED]</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTogglePin?.(memory.id)}
            className={`p-1 rounded ${
              memory.is_pinned ? "text-[#C084FC]" : "text-[#5C5873] hover:text-[#F4F3F8]"
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${memory.is_pinned ? "fill-[#C084FC]" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite?.(memory.id)}
            className={`p-1 rounded ${
              memory.is_favorite ? "text-rose-400" : "text-[#5C5873] hover:text-[#F4F3F8]"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${memory.is_favorite ? "fill-rose-400" : ""}`} />
          </button>
          <Link
            href={`/memories/${memory.id}`}
            className="text-[11px] font-mono-retro text-[#8B5CF6] hover:underline ml-1"
          >
            View →
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative rounded-xl bg-[#0C0C12] hover:bg-[#12121B] border border-[#252238] hover:border-[#8B5CF6]/50 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_4px_24px_rgba(139,92,246,0.14)]">
      {/* Top Banner & Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-mono-retro font-medium uppercase px-2 py-0.5 rounded border ${
                CATEGORY_COLORS[memory.category] || "text-purple-300 border-purple-800/60"
              }`}
            >
              {memory.category}
            </span>
            <span className="text-[9px] font-mono-retro text-[#8E8AA6] px-1.5 py-0.5 rounded bg-[#191926] border border-[#252238] uppercase">
              [{memory.memory_type}]
            </span>
            {connectionsCount > 0 && (
              <span className="text-[9px] font-mono-retro text-[#C084FC] px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
                [{connectionsCount} LINKED]
              </span>
            )}
          </div>

          {/* Quick Pin / Favorite */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onTogglePin?.(memory.id);
              }}
              title={memory.is_pinned ? "Unpin memory" : "Pin memory"}
              className={`p-1 rounded hover:bg-[#191926] transition-colors ${
                memory.is_pinned ? "text-[#C084FC]" : "text-[#5C5873] hover:text-[#F4F3F8]"
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${memory.is_pinned ? "fill-[#C084FC]" : ""}`} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite?.(memory.id);
              }}
              title={memory.is_favorite ? "Remove favorite" : "Mark favorite"}
              className={`p-1 rounded hover:bg-[#191926] transition-colors ${
                memory.is_favorite ? "text-rose-400" : "text-[#5C5873] hover:text-[#F4F3F8]"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${memory.is_favorite ? "fill-rose-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <Link href={`/memories/${memory.id}`} className="block group-hover:text-[#C084FC] transition-colors">
          <h3 className="font-semibold text-sm sm:text-base text-[#F4F3F8] line-clamp-2 leading-snug tracking-tight">
            {memory.title}
          </h3>
        </Link>

        {/* Date and Location */}
        <div className="flex items-center gap-3 text-[11px] text-[#8E8AA6] mt-1.5 font-mono-retro">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#8B5CF6]" />
            {formattedDate}
          </span>
          {memory.location_name && (
            <span className="flex items-center gap-1 truncate max-w-[140px]" title={memory.location_name}>
              <MapPin className="w-3 h-3 text-[#8B5CF6]" />
              <span className="truncate">{memory.location_name}</span>
            </span>
          )}
        </div>

        {/* AI Summary / Snippet */}
        <p className="text-xs text-[#8E8AA6] font-serif leading-relaxed line-clamp-3 mt-2.5">
          {memory.ai_summary || memory.summary || memory.description || memory.content}
        </p>

        {/* Attached Visual Thumbnail */}
        {hasPhoto && photoUrl && (
          <div className="mt-3 h-32 w-full rounded-lg overflow-hidden border border-[#252238] relative group-hover:border-[#8B5CF6]/40 transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={memory.title}
              className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono-retro text-[#C084FC] flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>Snapshot</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Chips */}
      <div className="px-5 py-3 border-t border-[#252238] bg-[#050508]/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-w-[80%]">
          {memory.people?.slice(0, 1).map((person) => (
            <span
              key={person}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 text-[10px]"
            >
              <User className="w-2.5 h-2.5" />
              <span className="truncate max-w-[80px]">{person}</span>
            </span>
          ))}

          {memory.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded-md bg-[#191926] text-purple-300/80 text-[10px] font-mono-retro"
            >
              #{tag}
            </span>
          ))}
          {memory.tags && memory.tags.length > 2 && (
            <span className="text-[10px] text-[#5C5873] font-mono-retro">
              +{memory.tags.length - 2}
            </span>
          )}
        </div>

        <Link
          href={`/memories/${memory.id}`}
          className="text-[11px] font-mono-retro text-[#8B5CF6] hover:text-[#C084FC] hover:underline"
        >
          Open →
        </Link>
      </div>
    </article>
  );
}
