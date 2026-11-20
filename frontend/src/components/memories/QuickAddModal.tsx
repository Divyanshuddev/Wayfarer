"use client";

import { extractEntitiesLocal } from "@/lib/ai/extractor";
import { shadowStore } from "@/lib/storage/store";
import {
  Collection,
  ExtractedEntities,
  MemoryAttachment,
  MemoryCategory,
  MemoryType,
} from "@/types/database";
import confetti from "canvas-confetti";
import {
  Calendar,
  Camera,
  Check,
  FileCode,
  FileText,
  Globe,
  Heart,
  Loader2,
  MapPin,
  Mic,
  Pin,
  Plus,
  Radio,
  Sparkles,
  Tag,
  User,
  Users,
  Video,
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

const MEMORY_TYPES: {
  id: MemoryType;
  label: string;
  icon: any;
  desc: string;
}[] = [
  { id: "note", label: "Text Note", icon: FileText, desc: "Personal thought or journal" },
  { id: "photo", label: "Photo", icon: Camera, desc: "Image snapshot with Vision OCR" },
  { id: "voice", label: "Voice Audio", icon: Mic, desc: "Whisper-transcribed voice recording" },
  { id: "document", label: "Document / PDF", icon: FileCode, desc: "PDF or paper via PyMuPDF" },
  { id: "conversation", label: "Conversation", icon: Users, desc: "Multi-speaker dialogue" },
  { id: "link", label: "Web Link", icon: Globe, desc: "URL with metadata auto-fetch" },
  { id: "event", label: "Event / Journey", icon: Calendar, desc: "Milestone, trip, or experience" },
  { id: "video", label: "Video Artifact", icon: Video, desc: "Short video memory" },
];

const CATEGORIES: MemoryCategory[] = [
  "People & Experiences",
  "Ideas & Projects",
  "Places & Travel",
  "Documents & Receipts",
  "Media & Recommendations",
  "Health & Wellness",
  "Conversations",
  "Life Milestones",
];

export function QuickAddModal({
  isOpen,
  onClose,
  onMemoryCreated,
}: QuickAddModalProps) {
  const [selectedType, setSelectedType] = useState<MemoryType>("note");

  // Form Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("Ideas & Projects");
  const [memoryDate, setMemoryDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [personInput, setPersonInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [collections, setCollections] = useState<Collection[]>([]);

  // Attachments
  const [attachments, setAttachments] = useState<MemoryAttachment[]>([]);

  // Live retro pipeline animation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<
    "IDLE" | "UPLOADING" | "EXTRACTING_TEXT" | "ORGANIZING_ENTITIES" | "INDEXING_VECTOR" | "COMPLETED"
  >("IDLE");
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
    if (!content.trim() && !sourceUrl.trim() && attachments.length === 0) return;
    setIsProcessing(true);
    setPipelineStep("EXTRACTING_TEXT");

    try {
      setPipelineStep("ORGANIZING_ENTITIES");

      const res = await fetch("/api/memories/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          url: sourceUrl || undefined,
          image_url: attachments[0]?.file_path,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const ext = data.extracted;
        applyExtractedData(ext);
      } else {
        const localExt = extractEntitiesLocal(content);
        applyExtractedData(localExt as any);
      }
      setPipelineStep("INDEXING_VECTOR");
      await new Promise((r) => setTimeout(r, 400));
      setPipelineStep("COMPLETED");
    } catch {
      const localExt = extractEntitiesLocal(content);
      applyExtractedData(localExt as any);
      setPipelineStep("COMPLETED");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setPipelineStep("IDLE"), 1500);
    }
  };

  const applyExtractedData = (ext: any) => {
    if (!title && ext.title) setTitle(ext.title);
    if (ext.category) setCategory(ext.category);
    if (ext.tags && Array.isArray(ext.tags)) {
      setTags(Array.from(new Set([...tags, ...ext.tags])));
    }
    const extractedPeople = ext.extracted_entities?.people || ext.people;
    if (extractedPeople && Array.isArray(extractedPeople)) {
      setPeople(Array.from(new Set([...people, ...extractedPeople])));
    }
    const extractedPlaces = ext.extracted_entities?.places || ext.location;
    if (extractedPlaces && !locationName) {
      setLocationName(Array.isArray(extractedPlaces) ? extractedPlaces[0] : extractedPlaces);
    }
    setExtractedPreview(
      ext.extracted_entities || {
        people: ext.people || [],
        places: ext.location ? [ext.location] : [],
        dates: [],
        topics: ext.tags || [],
        details: [ext.ai_summary || ext.summary || ""],
      }
    );
  };

  const handleFetchUrl = async () => {
    if (!sourceUrl.trim()) return;
    setIsProcessing(true);
    setPipelineStep("UPLOADING");
    try {
      const res = await fetch("/api/memories/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        applyExtractedData(data.extracted);
        if (!content) {
          setContent(data.extracted.ai_summary || `Bookmarked web link: ${sourceUrl}`);
        }
      }
    } catch (e) {
      console.warn("URL auto-fetch error:", e);
    } finally {
      setIsProcessing(false);
      setPipelineStep("IDLE");
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !sourceUrl.trim() && attachments.length === 0) return;

    setIsProcessing(true);
    setPipelineStep("UPLOADING");
    await new Promise((r) => setTimeout(r, 200));
    setPipelineStep("EXTRACTING_TEXT");
    await new Promise((r) => setTimeout(r, 200));
    setPipelineStep("ORGANIZING_ENTITIES");
    await new Promise((r) => setTimeout(r, 250));
    setPipelineStep("INDEXING_VECTOR");
    await new Promise((r) => setTimeout(r, 250));

    const memoryTitle =
      title.trim() || content.trim().split("\n")[0].slice(0, 60) || "Untitled Memory";

    const newMem = shadowStore.createMemory({
      title: memoryTitle,
      description: content,
      content,
      ai_summary: content.slice(0, 160),
      summary: content.slice(0, 160),
      memory_type: selectedType,
      category,
      memory_date: new Date(memoryDate).toISOString(),
      location: locationName.trim() || null,
      location_name: locationName.trim() || null,
      tags,
      people,
      source_url: sourceUrl.trim() || null,
      personal_notes: personalNotes.trim() || null,
      is_pinned: isPinned,
      is_favorite: isFavorite,
      attachments,
      collection_ids: selectedCollectionId ? [selectedCollectionId] : [],
      extracted_entities: extractedPreview || {
        people,
        places: locationName ? [locationName] : [],
        dates: [],
        topics: tags,
        details: [],
      },
    });

    setIsProcessing(false);
    setPipelineStep("COMPLETED");

    // Celebratory confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#8B5CF6", "#C084FC", "#34D399"],
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
    setSelectedType("note");
    setCategory("Ideas & Projects");
    setLocationName("");
    setSourceUrl("");
    setPersonalNotes("");
    setTags([]);
    setPeople([]);
    setIsPinned(false);
    setIsFavorite(false);
    setAttachments([]);
    setExtractedPreview(null);
    setPipelineStep("IDLE");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#0C0C12] border border-[#252238] rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.18)] flex flex-col overflow-hidden text-[#F4F3F8]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-[#252238] flex items-center justify-between bg-[#12121B]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-[#C084FC]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#F4F3F8] tracking-tight">
                Capture New Memory
              </h2>
              <p className="text-[11px] text-[#8E8AA6] font-mono-retro">
                Auto-extracted, embedded in 1536d vector space & strictly grounded
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8AA6] hover:text-[#F4F3F8] hover:bg-[#191926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8 Memory Types Selector Bar */}
        <div className="px-5 py-2.5 border-b border-[#252238] flex items-center gap-1.5 overflow-x-auto bg-[#050508]">
          {MEMORY_TYPES.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-retro whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-purple-950/80 text-[#C084FC] border border-purple-500/60 shadow-[0_0_12px_rgba(139,92,246,0.25)] font-semibold"
                    : "text-[#8E8AA6] hover:text-[#F4F3F8] hover:bg-[#12121B] border border-transparent"
                }`}
                title={t.desc}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Monospace Terminal Pipeline Indicator */}
        {pipelineStep !== "IDLE" && (
          <div className="px-5 py-2 bg-[#12121B] border-b border-purple-900/40 flex items-center gap-2 text-xs font-mono-retro text-purple-300 animate-in fade-in">
            <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="text-[#8E8AA6]">PIPELINE:</span>
            <span
              className={
                pipelineStep === "UPLOADING"
                  ? "text-purple-300 font-bold"
                  : "text-[#5C5873]"
              }
            >
              [UPLOADING]
            </span>
            <span className="text-[#5C5873]">→</span>
            <span
              className={
                pipelineStep === "EXTRACTING_TEXT"
                  ? "text-purple-300 font-bold"
                  : "text-[#5C5873]"
              }
            >
              [EXTRACTING_TEXT]
            </span>
            <span className="text-[#5C5873]">→</span>
            <span
              className={
                pipelineStep === "ORGANIZING_ENTITIES"
                  ? "text-purple-300 font-bold"
                  : "text-[#5C5873]"
              }
            >
              [ORGANIZING_ENTITIES]
            </span>
            <span className="text-[#5C5873]">→</span>
            <span
              className={
                pipelineStep === "INDEXING_VECTOR"
                  ? "text-purple-300 font-bold"
                  : "text-[#5C5873]"
              }
            >
              [INDEXING_VECTOR]
            </span>
            {pipelineStep === "COMPLETED" && (
              <span className="text-emerald-400 font-bold ml-1">✓ [COMPLETE]</span>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Specialized Mode Inputs */}
          {selectedType === "voice" && (
            <VoiceRecorder
              onTranscriptionComplete={(transcript) => {
                setContent((prev) => (prev ? `${prev}\n\n${transcript}` : transcript));
              }}
            />
          )}

          {(selectedType === "photo" || selectedType === "document" || selectedType === "video") && (
            <DragDropUploader
              onAttachmentAdded={(att) => {
                setAttachments((prev) => [
                  ...prev,
                  {
                    id: `att-${Date.now()}`,
                    memory_id: "",
                    user_id: "",
                    storage_path: att.file_path,
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

          {selectedType === "link" && (
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/article-or-resource"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="flex-1 bg-[#12121B] border border-[#252238] focus:border-[#8B5CF6] rounded-xl px-4 py-2 text-xs text-[#F4F3F8] font-mono-retro focus:outline-none"
              />
              <button
                type="button"
                onClick={handleFetchUrl}
                disabled={!sourceUrl.trim() || isProcessing}
                className="px-3 py-2 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-300 hover:text-white text-xs font-mono-retro disabled:opacity-50"
              >
                Auto-Fetch
              </button>
            </div>
          )}

          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Title (or leave blank to auto-generate)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#12121B] border border-[#252238] focus:border-[#8B5CF6] rounded-xl px-4 py-2.5 text-sm text-[#F4F3F8] placeholder-[#5C5873] focus:outline-none font-medium"
            />
          </div>

          {/* Content / Narrative Textarea */}
          <div className="relative">
            <textarea
              rows={4}
              required={selectedType === "note" || selectedType === "conversation"}
              placeholder={
                selectedType === "conversation"
                  ? "Format conversation: 'Alex: ...\nMe: ...'"
                  : "What happened? What did you notice, learn, or resolve? (Markdown supported)"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#12121B] border border-[#252238] focus:border-[#8B5CF6] rounded-xl p-4 text-sm text-[#F4F3F8] placeholder-[#5C5873] focus:outline-none font-serif leading-relaxed"
            />
            {/* Auto-Extract Button in Textarea footer */}
            <div className="flex items-center justify-between mt-1 text-[11px] font-mono-retro text-[#8E8AA6]">
              <span>{content.length} characters</span>
              <button
                type="button"
                onClick={handleAiExtract}
                disabled={isProcessing || !content.trim()}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/60 border border-purple-700/50 text-[#C084FC] hover:bg-purple-900/60 transition-all disabled:opacity-40"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span>Auto-Extract Entities</span>
              </button>
            </div>
          </div>

          {/* AI Extracted Preview Pill */}
          {extractedPreview && (
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between text-[#C084FC] font-mono-retro text-[10px]">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Extracted Entities Ready
                </span>
                <span>Category: {category}</span>
              </div>
              {extractedPreview.details?.[0] && (
                <p className="text-gray-300 italic font-serif">
                  &ldquo;{extractedPreview.details[0]}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Metadata Controls: Category, Date, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono-retro text-[#8E8AA6] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-3 py-2 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono-retro text-[#8E8AA6] mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-3 py-2 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6] font-mono-retro"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-retro text-[#8E8AA6] mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5C5873]" />
                <input
                  type="text"
                  placeholder="e.g. Kyoto, San Francisco"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-[#12121B] border border-[#252238] rounded-lg pl-8 pr-3 py-2 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>
          </div>

          {/* Tags & People */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono-retro text-[#8E8AA6] mb-1">
                Tags (press Enter)
              </label>
              <input
                type="text"
                placeholder="#travel, #ai, #books..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-3 py-2 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 text-[#C084FC] border border-purple-800/40 text-[10px] font-mono-retro"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="hover:text-rose-400"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono-retro text-[#8E8AA6] mb-1">
                People Present (press Enter)
              </label>
              <input
                type="text"
                placeholder="Alex, Maya Lin, Rahul..."
                value={personInput}
                onChange={(e) => setPersonInput(e.target.value)}
                onKeyDown={handleAddPerson}
                className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-3 py-2 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6]"
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
                      onClick={() => setPeople(people.filter((p) => p !== person))}
                      className="hover:text-rose-400"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Collection Assignment & Quick Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#252238]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-retro text-[#8E8AA6]">Collection:</span>
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="bg-[#12121B] border border-[#252238] rounded-lg px-2.5 py-1 text-xs text-[#F4F3F8] focus:outline-none"
              >
                <option value="">General Archive</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono-retro transition-colors border ${
                  isPinned
                    ? "bg-purple-950 text-[#C084FC] border-purple-500/50"
                    : "bg-[#12121B] text-[#8E8AA6] border-transparent hover:text-[#F4F3F8]"
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-[#C084FC]" : ""}`} />
                <span>Pin</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono-retro transition-colors border ${
                  isFavorite
                    ? "bg-rose-950/60 text-rose-300 border-rose-500/50"
                    : "bg-[#12121B] text-[#8E8AA6] border-transparent hover:text-[#F4F3F8]"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-400" : ""}`} />
                <span>Favorite</span>
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-[#8E8AA6] hover:text-[#F4F3F8] hover:bg-[#191926] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || (!content.trim() && !sourceUrl.trim() && attachments.length === 0)}
              className="flex items-center gap-2 py-2 px-5 rounded-lg bg-[#8B5CF6] hover:bg-purple-500 text-white font-medium text-xs shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all disabled:opacity-40"
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
