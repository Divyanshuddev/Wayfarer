"use client";

import { SearchResultCard } from "@/components/search/SearchResultCard";
import { SemanticSearchBar } from "@/components/search/SemanticSearchBar";
import { ShadowChatPanel } from "@/components/search/ShadowChatPanel";
import { shadowStore } from "@/lib/storage/store";
import { SearchResult } from "@/types/database";
import { Bot, MessageSquare, Search, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<"search" | "chat">("search");
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [hasAttachments, setHasAttachments] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const doSearch = () => {
      const res = shadowStore.search(query, {
        category: selectedCategory,
        sentiment: selectedSentiment,
        hasAttachments,
      });
      setResults(res);
    };
    doSearch();
    return shadowStore.subscribe(doSearch);
  }, [query, selectedCategory, selectedSentiment, hasAttachments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">
            Semantic Search & AI Assistant
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-serif">
            Find memories via associative semantics or consult Shadow with strict grounding.
          </p>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center p-1 rounded-xl bg-[#0f0e1c] border border-[#232036] w-fit">
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-retro transition-all ${
              activeTab === "search"
                ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Semantic Search</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-retro transition-all ${
              activeTab === "chat"
                ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Shadow AI Chat</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Semantic Search */}
      {activeTab === "search" && (
        <div className="space-y-6">
          <SemanticSearchBar
            query={query}
            onQueryChange={setQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedSentiment={selectedSentiment}
            onSentimentChange={setSelectedSentiment}
            hasAttachments={hasAttachments}
            onHasAttachmentsChange={setHasAttachments}
          />

          <div className="flex items-center justify-between text-xs font-mono-retro text-gray-400 border-b border-[#1f1d2e] pb-2">
            <span>
              {results.length} result(s) found {query ? `for "${query}"` : ""}
            </span>
            <span className="text-purple-400">Hybrid Match: Cosine + Lexical</span>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((r) => (
                <SearchResultCard key={r.memory.id} result={r} />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-3">
              <p className="text-sm font-mono-retro text-gray-400">
                No memories matched your search criteria.
              </p>
              <p className="text-xs text-gray-400 font-serif">
                Try searching for related concepts, names, or feelings (e.g. &ldquo;Kyoto&rdquo;, &ldquo;entropy&rdquo;, &ldquo;coffee&rdquo;).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Grounded Shadow AI Chat */}
      {activeTab === "chat" && (
        <div className="space-y-4">
          <ShadowChatPanel />
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono-retro text-gray-400">Loading vault search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
