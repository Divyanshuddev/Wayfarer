"use client";

import { shadowStore } from "@/lib/storage/store";
import { Plus, Search, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface TopHeaderProps {
  onOpenQuickAdd: () => void;
}

export function TopHeader({ onOpenQuickAdd }: TopHeaderProps) {
  const router = useRouter();
  const [quickQuery, setQuickQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(quickQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-14 border-b border-[#1f1d2e] bg-[#08080c]/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search memories or ask Shadow in natural language..."
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            className="w-full bg-[#12111d] border border-[#232135] focus:border-purple-500/60 rounded-full pl-9 pr-12 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all font-sans"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono-retro bg-[#1b1928] text-gray-400 rounded border border-[#2e2b44]">
            ↵ Enter
          </kbd>
        </div>
      </form>

      {/* Status Badges & Quick Action */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-800/40 text-[11px] font-mono-retro text-purple-300">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>ZERO FABRICATION</span>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)] active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Memory</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 text-[9px] font-mono-retro bg-purple-800/80 rounded border border-purple-400/30">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
