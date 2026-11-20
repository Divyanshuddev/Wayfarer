"use client";

import { shadowStore } from "@/lib/storage/store";
import { Memory } from "@/types/database";
import {
  ArrowRight,
  Calendar,
  Compass,
  MapPin,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export function RediscoverCard() {
  const [data, setData] = useState<{
    memory: Memory;
    reflectionPrompt: string;
  } | null>(null);

  const loadRediscover = () => {
    const res = shadowStore.getRediscoverMemory();
    setData(res);
  };

  useEffect(() => {
    loadRediscover();
  }, []);

  if (!data) return null;

  const { memory, reflectionPrompt } = data;
  const formattedDate = new Date(memory.memory_date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#16122c] via-[#100f1e] to-[#0c0b16] border border-purple-500/40 p-5 sm:p-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden">
      {/* Background ambient phosphor glyph */}
      <div className="absolute top-2 right-4 text-purple-900/20 font-mono-retro font-bold text-7xl select-none pointer-events-none">
        Ψ
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-[11px] font-mono-retro text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>FROM THE SHADOWS: REDISCOVER</span>
            </span>
          </div>
          <button
            onClick={loadRediscover}
            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-300 hover:bg-purple-950/40 transition-colors"
            title="Shuffle Rediscovery"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Memory Content */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 text-xs font-mono-retro text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              {formattedDate}
            </span>
            {memory.location_name && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                {memory.location_name}
              </span>
            )}
          </div>

          <Link href={`/memories/${memory.id}`} className="block group">
            <h3 className="text-lg sm:text-xl font-bold text-gray-100 group-hover:text-purple-200 transition-colors">
              {memory.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-gray-300 font-serif leading-relaxed line-clamp-2">
            {memory.summary || memory.content}
          </p>
        </div>

        {/* Introspective Prompt */}
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-1">
          <p className="text-[10px] font-mono-retro text-purple-400 uppercase tracking-wider">
            Shadow Reflection Prompt:
          </p>
          <p className="text-xs text-purple-200/90 italic font-serif leading-relaxed">
            &ldquo;{reflectionPrompt}&rdquo;
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {memory.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-[#18152b] text-[10px] font-mono-retro text-purple-300"
              >
                #{tag}
              </span>
            ))}
          </div>

          <Link
            href={`/memories/${memory.id}`}
            className="flex items-center gap-1.5 text-xs font-mono-retro text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>Revisit Memory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
