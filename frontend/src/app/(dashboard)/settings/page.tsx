"use client";

import { isOpenAIConfigured } from "@/lib/ai/openai";
import { shadowStore } from "@/lib/storage/store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import {
  Check,
  Cpu,
  Database,
  Download,
  Key,
  Lock,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  ToggleLeft,
  ToggleRight,
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

  const handleToggleAutoOrganize = () => {
    const updated = { ...profile, ai_auto_organize: !profile.ai_auto_organize };
    setProfile(updated);
    shadowStore.updateProfile(updated);
  };

  const handleToggleAutoLink = () => {
    const updated = { ...profile, ai_auto_link: !profile.ai_auto_link };
    setProfile(updated);
    shadowStore.updateProfile(updated);
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F3F8]">
          Archive Settings & Sovereignty
        </h1>
        <p className="text-xs sm:text-sm text-[#8E8AA6] font-serif">
          Manage your archivist profile, theme preferences, AI automation rules, and sovereign data export.
        </p>
      </div>

      {/* 1. Identity & Profile Settings */}
      <div className="p-6 rounded-2xl bg-[#0C0C12] border border-[#252238] space-y-5 shadow-lg">
        <div className="flex items-center gap-2 border-b border-[#191926] pb-3">
          <User className="w-4 h-4 text-[#8B5CF6]" />
          <h2 className="text-sm font-semibold text-[#F4F3F8] font-mono-retro uppercase tracking-wider">
            Archivist Profile
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-retro text-[#8E8AA6] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full bg-[#12121B] border border-[#252238] rounded-xl px-3 py-2 text-sm text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-retro text-[#8E8AA6] mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={profile.avatar_url || ""}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                className="w-full bg-[#12121B] border border-[#252238] rounded-xl px-3 py-2 text-sm text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono-retro text-[#8E8AA6] mb-1">
              Personal Bio / Archivist Statement
            </label>
            <textarea
              rows={2}
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-[#12121B] border border-[#252238] rounded-xl px-3 py-2 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6] font-serif"
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
              className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-purple-500 text-white text-xs font-medium transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. Theme Toggle (Retro Minimal Dark vs Minimal Light) */}
      <div className="p-6 rounded-2xl bg-[#0C0C12] border border-[#252238] space-y-4 shadow-lg">
        <div className="flex items-center gap-2 border-b border-[#191926] pb-3">
          <Moon className="w-4 h-4 text-[#8B5CF6]" />
          <h2 className="text-sm font-semibold text-[#F4F3F8] font-mono-retro uppercase tracking-wider">
            Visual Theme
          </h2>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#12121B] border border-[#252238]">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-[#F4F3F8]">
              {profile.theme === "light" ? "Minimal Light" : "Retro Minimal Dark (Obsidian & Purple)"}
            </p>
            <p className="text-[11px] text-[#8E8AA6] font-mono-retro">
              Default is obsidian terminal with electric purple phosphor accents.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextTheme = profile.theme === "light" ? "dark" : "light";
              const updated = { ...profile, theme: nextTheme };
              setProfile(updated);
              shadowStore.updateProfile(updated);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#191926] border border-[#252238] text-xs font-mono-retro text-[#C084FC]"
          >
            {profile.theme === "light" ? (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. AI Grounding & Pipeline Automation Preferences */}
      <div className="p-6 rounded-2xl bg-[#0C0C12] border border-[#252238] space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#191926] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-[#F4F3F8] font-mono-retro uppercase tracking-wider">
              AI Preferences & Anti-Hallucination
            </h2>
          </div>
          <span className="text-[10px] font-mono-retro text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/40">
            ZERO FABRICATION ACTIVE
          </span>
        </div>

        <div className="space-y-3">
          {/* Auto-Organize Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#12121B] border border-[#252238]">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-[#F4F3F8]">Auto-Organize Memories</p>
              <p className="text-[11px] text-[#8E8AA6] font-mono-retro">
                Automatically extract title, category, tags, and entities upon memory creation.
              </p>
            </div>
            <button
              onClick={handleToggleAutoOrganize}
              className={`p-1 text-xs font-mono-retro rounded transition-colors ${
                profile.ai_auto_organize ? "text-[#C084FC]" : "text-[#5C5873]"
              }`}
            >
              {profile.ai_auto_organize ? (
                <ToggleRight className="w-6 h-6 fill-purple-600 text-[#C084FC]" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-[#5C5873]" />
              )}
            </button>
          </div>

          {/* Auto-Link Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#12121B] border border-[#252238]">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-[#F4F3F8]">Auto-Link Cognitive Graph</p>
              <p className="text-[11px] text-[#8E8AA6] font-mono-retro">
                Automatically discover semantic and entity links between new and existing memories.
              </p>
            </div>
            <button
              onClick={handleToggleAutoLink}
              className={`p-1 text-xs font-mono-retro rounded transition-colors ${
                profile.ai_auto_link ? "text-[#C084FC]" : "text-[#5C5873]"
              }`}
            >
              {profile.ai_auto_link ? (
                <ToggleRight className="w-6 h-6 fill-purple-600 text-[#C084FC]" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-[#5C5873]" />
              )}
            </button>
          </div>

          {/* Active AI Models Display */}
          <div className="p-3.5 rounded-xl bg-[#12121B] border border-[#252238] space-y-2">
            <span className="text-[10px] font-mono-retro text-[#8E8AA6] uppercase">
              Configured AI Models (Server-Side Only)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-retro">
              <div className="p-2 rounded bg-[#0C0C12] border border-[#191926]">
                <span className="text-[#8E8AA6] block text-[10px]">Extraction / RAG:</span>
                <span className="text-[#C084FC] font-semibold">gpt-4o-mini</span>
              </div>
              <div className="p-2 rounded bg-[#0C0C12] border border-[#191926]">
                <span className="text-[#8E8AA6] block text-[10px]">Audio Voice Notes:</span>
                <span className="text-[#C084FC] font-semibold">whisper-1</span>
              </div>
              <div className="p-2 rounded bg-[#0C0C12] border border-[#191926]">
                <span className="text-[#8E8AA6] block text-[10px]">Vector Embeddings:</span>
                <span className="text-[#C084FC] font-semibold">text-embedding-3-small (1536d)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Data Portability & Sovereignty */}
      <div className="p-6 rounded-2xl bg-[#0C0C12] border border-[#252238] space-y-4 shadow-lg">
        <div className="flex items-center gap-2 border-b border-[#191926] pb-3">
          <Download className="w-4 h-4 text-[#8B5CF6]" />
          <h2 className="text-sm font-semibold text-[#F4F3F8] font-mono-retro uppercase tracking-wider">
            Data Portability & Sovereignty
          </h2>
        </div>

        <p className="text-xs text-[#8E8AA6] font-serif leading-relaxed">
          Your life belongs to you. Export your entire memory vault including summaries, attachments metadata, entity links, and tags as an open JSON archive at any time.
        </p>

        {importMessage && (
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-700/50 text-xs font-mono-retro text-[#C084FC]">
            {importMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12121B] hover:bg-[#191926] text-[#F4F3F8] border border-[#252238] text-xs font-mono-retro transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#8B5CF6]" />
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12121B] hover:bg-[#191926] text-[#F4F3F8] border border-[#252238] text-xs font-mono-retro transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#8B5CF6]" />
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
