"use client";

import { Memory } from "@/types/database";
import { Calendar, Eye, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";

interface TimelinePhotoViewProps {
  memories: Memory[];
}

export function TimelinePhotoView({ memories }: TimelinePhotoViewProps) {
  const photoMemories = memories.filter(
    (m) => m.attachments && m.attachments.length > 0
  );

  if (photoMemories.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#0e0d18] border border-[#201e32]">
        <p className="text-gray-400 font-mono-retro text-xs">
          No photo memories captured yet. Upload images or tickets in Quick Add to populate this gallery.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {photoMemories.map((mem) => {
        const att = mem.attachments![0];
        const formattedDate = new Date(mem.memory_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <Link
            key={mem.id}
            href={`/memories/${mem.id}`}
            className="group relative rounded-2xl overflow-hidden border border-[#232038] hover:border-purple-500/50 bg-[#0d0c16] aspect-square transition-all shadow-md hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={att.file_path}
              alt={mem.title}
              className="w-full h-full object-cover brightness-90 group-hover:scale-105 group-hover:brightness-100 transition-all duration-300"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1 text-white">
              <span className="text-[10px] font-mono-retro uppercase px-2 py-0.5 rounded bg-purple-950/80 border border-purple-700/60 text-purple-300">
                {mem.category}
              </span>
              <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-purple-200 transition-colors">
                {mem.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] font-mono-retro text-gray-300 pt-1">
                <span>{formattedDate}</span>
                {mem.location_name && (
                  <span className="flex items-center gap-1 truncate max-w-[120px]">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    <span className="truncate">{mem.location_name}</span>
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
