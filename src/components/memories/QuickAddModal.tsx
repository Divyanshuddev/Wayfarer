"use client";

import { extractEntitiesLocal } from "@/lib/ai/extractor";
import { shadowStore } from "@/lib/storage/store";
import {
  Collection,
  ExtractedEntities,
  MemoryAttachment,
  MemoryCategory,
  MemorySentiment,
  MemorySourceType,
} from "@/types/database";
import confetti from "canvas-confetti";
import {
  Calendar,
  Camera,
  Check,
  FileText,
  Heart,
  Loader2,
  MapPin,
  Mic,
  Pin,
  Plus,
  Sparkles,
  Tag,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { DragDropUploader } from "./DragDropUploader";
import { VoiceRecorder } from "./VoiceRecorder";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryCreated?: (id: string) => void;
}

export function QuickAddModal({
  isOpen,
  onClose,
  onMemoryCreated,
}: QuickAddModalProps) {
  const [activeTab, setActiveTab] = useState<"note" | "voice" | "image" | "doc">("note");

  // Form Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<MemoryCategory>("thought");
  const [sentiment, setSentiment] = useState<MemorySentiment>("neutral");
  const [memoryDate, setMemoryDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [weather, setWeather] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [personInput, setPersonInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [collections, setCollections] = useState<Collection[]>([]);

  // Attachments & OCR
  const [attachments, setAttachments] = useState<MemoryAttachment[]>([]);
  const [sourceType, setSourceType] = useState<MemorySourceType>("quick_note");

  // AI Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<ExtractedEntities | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCollections(shadowStore.getCollections());
      if (!memoryDate) {
        setMemoryDate(new Date().toISOString().slice(0, 16));
      }
    }
  }, [isOpen, memoryDate]);

  if (!isOpen) return null;

  const handleAiExtract = async () => {
    if (!content.trim() && attachments.length === 0) return;
    setIsExtracting(true);

    try {
      // First attempt API route
      const res = await fetch("/api/memories/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          image_url: attachments[0]?.file_path,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const ext: ExtractedEntities = data.extracted;
        applyExtractedData(ext);
      } else {
        // Fallback to local heuristic extractor
        const localExt = extractEntitiesLocal(content);
        applyExtractedData(localExt);
      }
    } catch {
      const localExt = extractEntitiesLocal(content);
      applyExtractedData(localExt);
    } finally {
      setIsExtracting(false);
    }
  };

  const applyExtractedData = (ext: ExtractedEntities) => {
    if (!title && ext.title) setTitle(ext.title);
    if (ext.category) setCategory(ext.category);
    if (ext.sentiment) setSentiment(ext.sentiment);
    if (ext.tags && ext.tags.length > 0) {
      const merged = Array.from(new Set([...tags, ...ext.tags]));
      setTags(merged);
    }
    if (ext.people && ext.people.length > 0) {
      const merged = Array.from(new Set([...people, ...ext.people]));
      setPeople(merged);
    }
    if (ext.location && !locationName) {
      setLocationName(ext.location);
    }
    setExtractedPreview(ext);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, "").toLowerCase();
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddPerson = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && personInput.trim()) {
      e.preventDefault();
      const clean = personInput.trim();
      if (!people.includes(clean)) {
        setPeople([...people, clean]);
      }
      setPersonInput("");
    }
  };

  const handleRemovePerson = (personToRemove: string) => {
    setPeople(people.filter((p) => p !== personToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const memoryTitle = title.trim() || content.trim().split("\n")[0].slice(0, 60) || "Untitled Memory";

    const newMem = shadowStore.createMemory({
      title: memoryTitle,
      content,
      summary: extractedPreview?.summary || content.slice(0, 160),
      category,
      sentiment,
      memory_date: new Date(memoryDate).toISOString(),
      is_pinned: isPinned,
      is_favorite: isFavorite,
      location_name: locationName.trim() || null,
      weather: weather.trim() || null,
      tags,
      people,
      source_type: sourceType,
      attachments,
      collection_ids: selectedCollectionId ? [selectedCollectionId] : [],
    });

    // If AI detected reminders, create them automatically
    if (extractedPreview?.detected_reminders && extractedPreview.detected_reminders.length > 0) {
      extractedPreview.detected_reminders.forEach((r) => {
        shadowStore.createReminder({
          memory_id: newMem.id,
          title: r.title,
          due_date: r.due_date,
          reminder_type: r.reminder_type,
          memory_title: newMem.title,
        });
      });
    }

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#a855f7", "#c084fc", "#6366f1"],
      });
    } catch {
      // ignore
    }

    onMemoryCreated?.(newMem.id);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("thought");
    setSentiment("neutral");
    setLocationName("");
    setWeather("");
    setTags([]);
    setPeople([]);
    setIsPinned(false);
    setIsFavorite(false);
    setAttachments([]);
    setExtractedPreview(null);
    setSourceType("quick_note");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0d0c16] border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(147,51,234,0.25)] flex flex-col overflow-hidden text-gray-200 font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222036] flex items-center justify-between bg-[#11101d]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-gray-100 tracking-tight">
                Capture New Memory
              </h2>
              <p className="text-[11px] text-gray-400 font-mono-retro">
                Auto-summarized, embedded & strictly grounded
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#1b192b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capture Mode Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-[#1b1a2c] flex items-center gap-2 overflow-x-auto bg-[#0a0912]">
          {[
            { id: "note", label: "Note / Journal", icon: FileText, src: "quick_note" },
            { id: "voice", label: "Voice Audio", icon: Mic, src: "voice" },
            { id: "image", label: "Photo / OCR", icon: Camera, src: "image_ocr" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSourceType(tab.src as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-purple-900/50 text-purple-200 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#161426] border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Active Mode Input Area */}
          {activeTab === "voice" && (
            <VoiceRecorder
              onTranscriptionComplete={(transcript) => {
                setContent((prev) => (prev ? `${prev}\n\n${transcript}` : transcript));
              }}
            />
          )}

          {activeTab === "image" && (
            <DragDropUploader
              onAttachmentAdded={(att) => {
                setAttachments([
                  {
                    id: `att-${Date.now()}`,
                    memory_id: "",
                    user_id: "",
                    file_path: att.file_path,
                    file_name: att.file_name,
                    file_type: att.file_type,
                    file_size: att.file_size,
                    extracted_text: att.extracted_text,
                    created_at: new Date().toISOString(),
                  },
                ]);
                if (att.extracted_text) {
                  setContent((prev) =>
                    prev ? `${prev}\n\n${att.extracted_text}` : att.extracted_text || ""
                  );
                }
              }}
            />
          )}

          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Title (or leave blank to auto-generate)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#12111e] border border-[#232036] focus:border-purple-500/60 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all font-medium"
            />
          </div>

          {/* Content Textarea */}
          <div className="relative">
            <textarea
              rows={4}
              required
              placeholder="What happened? What did you notice, feel, learn, or resolve? (Markdown supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#12111e] border border-[#232036] focus:border-purple-500/60 rounded-xl p-4 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all font-serif leading-relaxed"
            />
            {/* AI Extract Trigger Inside Textarea */}
            <div className="flex items-center justify-between mt-1 text-[11px] font-mono-retro text-gray-400">
              <span>{content.length} chars</span>
              <button
                type="button"
                onClick={handleAiExtract}
                disabled={isExtracting || !content.trim()}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/60 border border-purple-700/50 text-purple-300 hover:bg-purple-900/60 hover:text-purple-200 transition-all disabled:opacity-50"
              >
                {isExtracting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span>Auto-Extract Entities</span>
              </button>
            </div>
          </div>

          {/* AI Extracted Entity Banner (if active) */}
          {extractedPreview && (
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between text-purple-300 font-mono-retro text-[10px]">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> AI Distillation Ready
                </span>
                <span>Category: {extractedPreview.category}</span>
              </div>
              <p className="text-gray-300 italic font-serif">
                &ldquo;{extractedPreview.summary}&rdquo;
              </p>
              {extractedPreview.detected_reminders?.length > 0 && (
                <div className="text-[11px] text-amber-300 font-mono-retro pt-1 border-t border-purple-900/40">
                  🔔 Auto-created reminder: {extractedPreview.detected_reminders[0].title}
                </div>
              )}
            </div>
          )}

          {/* Metadata Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Category Select */}
            <div>
              <label className="block text-[11px] font-mono-retro text-gray-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#12111e] border border-[#232036] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
              >
                <option value="thought">Thought / Reflection</option>
                <option value="event">Event / Experience</option>
                <option value="conversation">Conversation</option>
                <option value="reading">Reading / Book</option>
                <option value="work">Work / Project</option>
                <option value="idea">Idea / Concept</option>
                <option value="media">Media / Film / Music</option>
                <option value="location">Location / Travel</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            {/* Sentiment Select */}
            <div>
              <label className="block text-[11px] font-mono-retro text-gray-400 mb-1">
                Emotional Tone
              </label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as any)}
                className="w-full bg-[#12111e] border border-[#232036] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
              >
                <option value="reflective">Reflective / Introspective</option>
                <option value="positive">Positive / Uplifting</option>
                <option value="neutral">Neutral / Observational</option>
                <option value="negative">Challenging / Heavy</option>
              </select>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-[11px] font-mono-retro text-gray-400 mb-1">
                Memory Date & Time
              </label>
              <input
                type="datetime-local"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="w-full bg-[#12111e] border border-[#232036] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-mono-retro"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-mono-retro text-gray-400 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Kyoto, San Francisco, Roastery"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-[#12111e] border border-[#232036] rounded-lg pl-8 pr-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Tags & People Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Tags */}
            <div>
              <label className="block text-[11px] font-mono-retro text-gray-400 mb-1">
                Tags (press Enter)
              </label>
              <input
                type="text"
                placeholder="#travel, #ai, #books..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full bg-[#12111e] border border-[#232036] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 text-[10px] font-mono-retro"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* People Mentioned */}
            <div>
              <label className="block text-[11px] font-mono-retro text-gray-400 mb-1">
                People Present (press Enter)
              </label>
              <input
                type="text"
                placeholder="Alex, Maya Lin, Sarah..."
                value={personInput}
                onChange={(e) => setPersonInput(e.target.value)}
                onKeyDown={handleAddPerson}
                className="w-full bg-[#12111e] border border-[#232036] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {people.map((person) => (
                  <span
                    key={person}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-[10px]"
                  >
                    <User className="w-2.5 h-2.5" />
                    {person}
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(person)}
                      className="hover:text-rose-400"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Collection Assignment & Favorite/Pin Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1d1b2e]">
            {/* Collection Assign */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-retro text-gray-400">Add to Collection:</span>
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="bg-[#12111e] border border-[#232036] rounded-lg px-2.5 py-1 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
              >
                <option value="">None (General Vault)</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pin & Favorite Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono-retro transition-colors border ${
                  isPinned
                    ? "bg-purple-950 text-purple-300 border-purple-500/50"
                    : "bg-[#141322] text-gray-400 border-transparent hover:text-gray-200"
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-purple-400" : ""}`} />
                <span>Pin</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono-retro transition-colors border ${
                  isFavorite
                    ? "bg-rose-950/60 text-rose-300 border-rose-500/50"
                    : "bg-[#141322] text-gray-400 border-transparent hover:text-gray-200"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-400" : ""}`} />
                <span>Favorite</span>
              </button>
            </div>
          </div>

          {/* Submit Action Footer */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-[#181628] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex items-center gap-2 py-2 px-5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Preserve in Shadow</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
