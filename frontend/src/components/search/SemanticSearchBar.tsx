"use client";

import { memoryCategories, memorySentiments } from "@/lib/validations/memory";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import React, { useState } from "react";

interface SemanticSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  selectedSentiment: string;
  onSentimentChange: (s: string) => void;
  hasAttachments: boolean;
  onHasAttachmentsChange: (v: boolean) => void;
}

export function SemanticSearchBar({
  query,
  onQueryChange,
  selectedCategory,
  onCategoryChange,
  selectedSentiment,
  onSentimentChange,
  hasAttachments,
  onHasAttachmentsChange,
}: SemanticSearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
        <input
          type="text"
          placeholder="Ask anything or search memories (e.g., 'What did Alain de Botton say?' or 'Kyoto rain')..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full bg-[#11101d] border border-[#232038] focus:border-purple-500/70 rounded-2xl pl-12 pr-28 py-3.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] transition-all"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="p-1 rounded-md text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono-retro transition-colors border ${
              showFilters
                ? "bg-purple-950 text-purple-300 border-purple-500/50"
                : "bg-[#181628] text-gray-400 border-[#2b2742] hover:text-gray-200"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Collapsible Filter Bar */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-[#0e0d18] border border-[#222036] space-y-3 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-mono-retro text-gray-400 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full bg-[#141222] border border-[#28253e] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Categories</option>
                {memoryCategories.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sentiment Filter */}
            <div>
              <label className="block text-[11px] font-mono-retro text-gray-400 mb-1">
                Sentiment
              </label>
              <select
                value={selectedSentiment}
                onChange={(e) => onSentimentChange(e.target.value)}
                className="w-full bg-[#141222] border border-[#28253e] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Sentiments</option>
                {memorySentiments.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Attachments Toggle */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer py-1.5">
                <input
                  type="checkbox"
                  checked={hasAttachments}
                  onChange={(e) => onHasAttachmentsChange(e.target.checked)}
                  className="rounded border-[#28253e] bg-[#141222] text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-mono-retro text-gray-300">
                  Has Photos / Attachments
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
