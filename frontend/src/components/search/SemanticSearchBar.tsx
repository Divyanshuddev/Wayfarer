import { memoryCategories, memoryTypes } from "@/lib/validations/memory";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import React, { useState } from "react";

export interface SemanticSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  selectedType?: string;
  onTypeChange?: (t: string) => void;
  selectedSentiment?: string;
  onSentimentChange?: (s: string) => void;
  hasAttachments: boolean;
  onHasAttachmentsChange: (v: boolean) => void;
}

export function SemanticSearchBar({
  query,
  onQueryChange,
  selectedCategory,
  onCategoryChange,
  selectedType = "all",
  onTypeChange,
  selectedSentiment = "all",
  onSentimentChange,
  hasAttachments,
  onHasAttachmentsChange,
}: SemanticSearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B5CF6]" />
        <input
          type="text"
          placeholder="Ask anything or search memories (e.g. 'What did Alain de Botton say?' or 'Kyoto rain')..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full bg-[#0C0C12] border border-[#252238] focus:border-[#8B5CF6] rounded-2xl pl-12 pr-28 py-3.5 text-sm text-[#F4F3F8] placeholder-[#5C5873] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/50 shadow-lg transition-all font-sans"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="p-1 rounded-md text-[#8E8AA6] hover:text-[#F4F3F8]"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono-retro transition-colors border ${
              showFilters
                ? "bg-purple-950 text-[#C084FC] border-purple-500/50"
                : "bg-[#12121B] text-[#8E8AA6] border-[#252238] hover:text-[#F4F3F8]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Collapsible Filter Bar */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-[#0C0C12] border border-[#252238] space-y-3 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-mono-retro text-[#8E8AA6] mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="all">All Categories</option>
                {memoryCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-[11px] font-mono-retro text-[#8E8AA6] mb-1">
                Memory Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => onTypeChange?.(e.target.value)}
                className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6] capitalize"
              >
                <option value="all">All Types</option>
                {memoryTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
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
                  className="rounded border-[#252238] bg-[#12121B] text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-mono-retro text-[#8E8AA6]">
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
