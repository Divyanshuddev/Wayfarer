"use client";

import { isOpenAIConfigured } from "@/lib/ai/openai";
import { shadowStore } from "@/lib/storage/store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import {
  Check,
  Database,
  Download,
  Key,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>(() => shadowStore.getProfile());
  const [isSaved, setIsSaved] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setProfile(shadowStore.getProfile());
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    shadowStore.updateProfile(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExport = () => {
    const dataStr = shadowStore.exportData();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shadow-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = shadowStore.importData(content);
      if (res.success) {
        setImportMessage(`Successfully imported ${res.count} memories into your archive!`);
        setProfile(shadowStore.getProfile());
      } else {
        setImportMessage("Failed to parse archive JSON format.");
      }
      setTimeout(() => setImportMessage(""), 4000);
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (confirm("Reset archive to initial seed memories? Your current changes will be overwritten.")) {
      shadowStore.resetToDefault();
      setProfile(shadowStore.getProfile());
      alert("Archive restored to initial curated state.");
    }
  };

  const supabaseReady = isSupabaseConfigured();
  const openaiReady = isOpenAIConfigured();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-100">
          Archive Settings & Sovereignty
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-serif">
          Manage your identity, AI grounding boundaries, and complete data export.
        </p>
      </div>

      {/* 1. Identity & Profile Settings */}
      <div className="p-6 rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-5">
        <div className="flex items-center gap-2 border-b border-[#1f1d30] pb-3">
          <User className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-gray-100 font-mono-retro uppercase tracking-wider">
            Archivist Profile
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-retro text-gray-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full bg-[#131122] border border-[#26233e] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-retro text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-[#131122] border border-[#26233e] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono-retro text-gray-400 mb-1">
              Personal Bio / Archivist Statement
            </label>
            <textarea
              rows={2}
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-[#131122] border border-[#26233e] rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-purple-500 font-serif"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono-retro">
                <Check className="w-4 h-4" /> Profile Updated
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. AI Grounding & Strictness Engine */}
      <div className="p-6 rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1f1d30] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-gray-100 font-mono-retro uppercase tracking-wider">
              AI Grounding & Hallucination Defense
            </h2>
          </div>
          <span className="text-[10px] font-mono-retro text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            ZERO FABRICATION ENFORCED
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#131122] border border-[#25223c] space-y-1">
            <p className="font-semibold text-gray-200">Strict Grounding Rule</p>
            <p className="text-gray-400 font-serif leading-relaxed">
              Shadow is architected with strict citation constraints. If a requested fact, person, or date is not explicitly documented in your memories, Shadow will explicitly state that it could not find it rather than fabricating.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-[#11101e] border border-[#211f34] space-y-1">
              <span className="text-[10px] font-mono-retro text-purple-400 uppercase">
                AI Tone Preference
              </span>
              <p className="text-sm font-semibold text-gray-200">
                Grounded & Concise
              </p>
              <p className="text-[11px] text-gray-400 font-serif">
                Prioritizes factual precision with minimal conversational embellishment.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#11101e] border border-[#211f34] space-y-1">
              <span className="text-[10px] font-mono-retro text-purple-400 uppercase">
                Embedding Dimensions
              </span>
              <p className="text-sm font-semibold text-gray-200 font-mono-retro">
                1536-dim vector space
              </p>
              <p className="text-[11px] text-gray-400 font-serif">
                text-embedding-3-small + deterministic fallback projection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Database & Cloud Architecture Status */}
      <div className="p-6 rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1f1d30] pb-3">
          <Database className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-gray-100 font-mono-retro uppercase tracking-wider">
            Database & Cloud Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-retro">
          <div className="p-3.5 rounded-xl bg-[#121122] border border-[#232038] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Supabase PostgreSQL:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] ${
                supabaseReady ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-purple-950 text-purple-300 border border-purple-800"
              }`}>
                {supabaseReady ? "CONNECTED" : "LOCAL SECURE STORE"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans font-normal mt-1">
              Schema migrations ready in <code className="text-purple-300 font-mono">supabase/schema.sql</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121122] border border-[#232038] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">OpenAI API Engine:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] ${
                openaiReady ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-purple-950 text-purple-300 border border-purple-800"
              }`}>
                {openaiReady ? "GPT-4o READY" : "SIMULATED NLP READY"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans font-normal mt-1">
              Structured extraction, Vision OCR, and RAG active.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Data Sovereignty & Portability */}
      <div className="p-6 rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1f1d30] pb-3">
          <Download className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-gray-100 font-mono-retro uppercase tracking-wider">
            Data Portability & Sovereignty
          </h2>
        </div>

        <p className="text-xs text-gray-300 font-serif leading-relaxed">
          Your life belongs to you. Export your entire memory vault including summaries, attachments metadata, entity links, and tags as an open JSON archive at any time.
        </p>

        {importMessage && (
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-700/50 text-xs font-mono-retro text-purple-200">
            {importMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151426] hover:bg-[#1e1c32] text-gray-200 border border-[#272440] text-xs font-mono-retro transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export Archive JSON</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151426] hover:bg-[#1e1c32] text-gray-200 border border-[#272440] text-xs font-mono-retro transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Import Archive JSON</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 text-xs font-mono-retro transition-colors ml-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Curated Sample Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
}
