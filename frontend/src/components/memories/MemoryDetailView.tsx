"use client";

import { shadowStore } from "@/lib/storage/store";
import { Memory, MemoryConnection } from "@/types/database";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  Edit3,
  ExternalLink,
  FileCode,
  FileText,
  Globe,
  Heart,
  Image as ImageIcon,
  Link2,
  Lock,
  MapPin,
  Mic,
  Pin,
  Share2,
  Sparkles,
  Tag,
  Trash2,
  User,
  Users,
  Video,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface MemoryDetailViewProps {
  memoryId: string;
}

const TYPE_ICONS: Record<string, any> = {
  note: FileText,
  photo: ImageIcon,
  voice: Mic,
  document: FileCode,
  conversation: Users,
  link: Globe,
  event: Calendar,
  video: Video,
};

export function MemoryDetailView({ memoryId }: MemoryDetailViewProps) {
  const router = useRouter();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [connectedLinks, setConnectedLinks] = useState<
    (MemoryConnection & { connectedMemory: Memory })[]
  >([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  useEffect(() => {
    const load = () => {
      const mem = shadowStore.getMemory(memoryId);
      if (mem) {
        setMemory(mem);
        setEditedTitle(mem.title);
        setEditedContent(mem.description || mem.content);
        setConnectedLinks(shadowStore.getLinksForMemory(memoryId) as any);
        setReminderTitle(`Follow-up on: ${mem.title}`);
        setReminderDate(new Date().toISOString().slice(0, 10));
      }
    };
    load();
    return shadowStore.subscribe(load);
  }, [memoryId]);

  if (!memory) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-[#8E8AA6] font-mono-retro">Memory not found in vault.</p>
        <Link
          href="/memories"
          className="inline-flex items-center gap-2 text-xs font-mono-retro text-[#8B5CF6] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Archive
        </Link>
      </div>
    );
  }

  const handleSaveEdit = () => {
    shadowStore.updateMemory(memory.id, {
      title: editedTitle,
      description: editedContent,
      content: editedContent,
      ai_summary: editedContent.slice(0, 160),
      summary: editedContent.slice(0, 160),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    shadowStore.deleteMemory(memory.id);
    router.push("/memories");
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;
    shadowStore.createReminder({
      memory_id: memory.id,
      title: reminderTitle.trim(),
      due_date: new Date(reminderDate).toISOString(),
      reminder_type: "follow_up",
      memory_title: memory.title,
    });
    setShowReminderModal(false);
    alert("Reminder scheduled!");
  };

  const formattedDate = new Date(memory.memory_date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const TypeIcon = TYPE_ICONS[memory.memory_type] || FileText;
  const entities = memory.extracted_entities || {
    people: memory.people || [],
    places: memory.location ? [memory.location] : [],
    dates: [],
    topics: memory.tags || [],
    details: [],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Breadcrumb & Action Controls */}
      <div className="flex items-center justify-between gap-4 border-b border-[#252238] pb-4">
        <Link
          href="/memories"
          className="flex items-center gap-1.5 text-xs font-mono-retro text-[#8E8AA6] hover:text-[#C084FC] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Archive</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Schedule Reminder Button */}
          <button
            onClick={() => setShowReminderModal(true)}
            title="Set Memory Reminder"
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#12121B] hover:bg-[#191926] text-[#8E8AA6] hover:text-[#F4F3F8] border border-[#252238] text-xs font-mono-retro transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Reminder</span>
          </button>

          {/* Pin Toggle */}
          <button
            onClick={() => shadowStore.togglePin(memory.id)}
            title={memory.is_pinned ? "Unpin" : "Pin"}
            className={`p-2 rounded-lg border transition-colors ${memory.is_pinned
              ? "bg-purple-950/80 text-[#C084FC] border-purple-500/50"
              : "bg-[#12121B] text-[#8E8AA6] border-[#252238] hover:text-[#F4F3F8]"
              }`}
          >
            <Pin className={`w-4 h-4 ${memory.is_pinned ? "fill-[#C084FC]" : ""}`} />
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={() => shadowStore.toggleFavorite(memory.id)}
            title={memory.is_favorite ? "Unfavorite" : "Favorite"}
            className={`p-2 rounded-lg border transition-colors ${memory.is_favorite
              ? "bg-rose-950/80 text-rose-300 border-rose-500/50"
              : "bg-[#12121B] text-[#8E8AA6] border-[#252238] hover:text-[#F4F3F8]"
              }`}
          >
            <Heart className={`w-4 h-4 ${memory.is_favorite ? "fill-rose-400" : ""}`} />
          </button>

          {/* Edit Toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#12121B] hover:bg-[#191926] text-[#F4F3F8] border border-[#252238] text-xs font-medium transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>{isEditing ? "Cancel" : "Edit"}</span>
          </button>

          {/* Purge Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg bg-[#12121B] hover:bg-rose-950/50 text-[#8E8AA6] hover:text-rose-400 border border-[#252238] transition-colors"
            title="Delete Memory"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 flex items-center justify-between gap-4 animate-in fade-in">
          <div>
            <p className="text-xs font-medium text-rose-200">
              Permanently purge this memory from your digital archive?
            </p>
            <p className="text-[11px] text-rose-400/80 font-mono-retro">
              Associated links, embeddings, and reminders will also be deleted.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-[#8E8AA6] hover:text-[#F4F3F8]"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
            >
              Confirm Purge
            </button>
          </div>
        </div>
      )}

      {/* Create Linked Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0C0C12] border border-[#252238] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-semibold text-[#F4F3F8] font-mono-retro">
              Set Reminder for &ldquo;{memory.title}&rdquo;
            </h3>
            <form onSubmit={handleCreateReminder} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono-retro text-[#8E8AA6] mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-3 py-2 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono-retro text-[#8E8AA6] mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-3 py-2 text-xs text-[#F4F3F8] font-mono-retro focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="px-3 py-1.5 text-xs text-[#8E8AA6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-medium"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Header Info: Type Icon, Title, Badges */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] font-mono-retro font-medium uppercase px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800/50 text-[#C084FC]">
            <TypeIcon className="w-3.5 h-3.5" />
            <span>{memory.memory_type}</span>
          </span>
          <span className="text-[11px] font-mono-retro text-[#8E8AA6] px-2 py-0.5 rounded bg-[#12121B] border border-[#252238]">
            {memory.category}
          </span>
          <span className="text-[11px] font-mono-retro text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> [1536d INDEXED]
          </span>
          <span className="text-[11px] font-mono-retro text-[#5C5873] flex items-center gap-1">
            <Lock className="w-3 h-3" /> [PRIVATE]
          </span>
        </div>

        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full bg-[#12121B] border border-[#8B5CF6]/50 rounded-xl px-4 py-2.5 text-xl font-bold text-[#F4F3F8] focus:outline-none"
          />
        ) : (
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F3F8] tracking-tight leading-tight">
            {memory.title}
          </h1>
        )}

        <div className="flex items-center gap-4 text-xs font-mono-retro text-[#8E8AA6] flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#8B5CF6]" />
            {formattedDate}
          </span>
          {(memory.location || memory.location_name) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#8B5CF6]" />
              {memory.location || memory.location_name}
            </span>
          )}
        </div>
      </div>

      {/* 3. Media Previewer */}
      {/* Voice Audio Player */}
      {memory.memory_type === "voice" && (
        <div className="p-4 rounded-xl bg-[#0C0C12] border border-purple-900/40 flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-[#C084FC]">
            <Volume2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-[#F4F3F8]">Preserved Audio Recording</p>
            <p className="text-[10px] text-[#8E8AA6] font-mono-retro">
              [WHISPER_TRANSCRIBED] • 16-bit PCM Audio
            </p>
          </div>
          <audio controls className="h-8 max-w-[240px] opacity-80" />
        </div>
      )}

      {/* Attached Images */}
      {memory.attachments && memory.attachments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-mono-retro text-[#C084FC] uppercase tracking-wider">
            Preserved Visual Artifacts ({memory.attachments.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memory.attachments.map((att) => (
              <div
                key={att.id}
                className="rounded-xl overflow-hidden border border-[#252238] bg-[#0C0C12] group shadow-md"
              >
                <div className="h-64 w-full overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.storage_path || att.file_path}
                    alt={att.file_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {att.extracted_text && (
                  <div className="p-3 bg-[#12121B] border-t border-[#252238] text-xs font-mono-retro text-[#C084FC]">
                    <span className="text-[#5C5873] text-[10px] block mb-0.5">VISION OCR:</span>
                    {att.extracted_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Web Link Preview Card */}
      {memory.source_url && (
        <div className="p-4 rounded-xl bg-[#0C0C12] border border-[#252238] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#8B5CF6]" />
            <div>
              <p className="text-xs font-medium text-[#F4F3F8]">Bookmarked URL Resource</p>
              <p className="text-[11px] text-[#8E8AA6] font-mono-retro truncate max-w-md">
                {memory.source_url}
              </p>
            </div>
          </div>
          <a
            href={memory.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-mono-retro text-[#8B5CF6] hover:underline"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* 4. Full Content View / Inline Edit */}
      <div className="p-6 rounded-2xl bg-[#0C0C12] border border-[#252238] shadow-xl">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              rows={10}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-[#12121B] border border-[#8B5CF6]/50 rounded-xl p-4 text-sm text-[#F4F3F8] font-serif leading-relaxed focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-[#8E8AA6]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-medium"
              >
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-[#F4F3F8] font-serif text-base leading-relaxed whitespace-pre-line">
            {memory.description || memory.content}
          </div>
        )}
      </div>

      {/* 5. AI Extracted Insights Card */}
      <div className="p-5 rounded-2xl bg-[#0C0C12] border border-[#252238] space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#191926] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <h3 className="text-xs font-mono-retro text-[#F4F3F8] uppercase tracking-wider font-semibold">
              AI Extracted Insights & Entities
            </h3>
          </div>
          <span className="text-[10px] font-mono-retro text-[#C084FC] bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
            GPT-4o-MINI STRUCTURED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono-retro">
          {/* People */}
          <div className="p-3 rounded-xl bg-[#12121B] border border-[#191926] space-y-1.5">
            <span className="text-[10px] text-[#8E8AA6] uppercase flex items-center gap-1">
              <User className="w-3 h-3 text-indigo-400" /> People Mentioned
            </span>
            {entities.people?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {entities.people.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-[10px]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#5C5873] italic">None identified</p>
            )}
          </div>

          {/* Places */}
          <div className="p-3 rounded-xl bg-[#12121B] border border-[#191926] space-y-1.5">
            <span className="text-[10px] text-[#8E8AA6] uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3 text-teal-400" /> Places & Venues
            </span>
            {entities.places?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {entities.places.map((pl) => (
                  <span
                    key={pl}
                    className="px-2 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/40 text-[10px]"
                  >
                    {pl}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#5C5873] italic">None identified</p>
            )}
          </div>

          {/* Dates & Temporal references */}
          <div className="p-3 rounded-xl bg-[#12121B] border border-[#191926] space-y-1.5">
            <span className="text-[10px] text-[#8E8AA6] uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" /> Dates / Milestones
            </span>
            {entities.dates?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {entities.dates.map((d) => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 text-[10px]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#5C5873] italic">Recorded on {formattedDate}</p>
            )}
          </div>
        </div>

        {/* Thematic Topics & Tags */}
        {memory.tags?.length > 0 && (
          <div className="pt-2 border-t border-[#191926] flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono-retro text-[#8E8AA6] uppercase mr-1">
              Thematic Topics:
            </span>
            {memory.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded bg-[#12121B] text-[#C084FC] border border-purple-900/30 text-[11px] font-mono-retro"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 6. Auto-Linked Connected Memories */}
      <div className="p-5 rounded-2xl bg-[#0C0C12] border border-purple-950/60 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#8B5CF6]" />
            <h3 className="text-sm font-semibold text-[#F4F3F8] tracking-tight">
              Connected Memory Web ({connectedLinks.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono-retro text-[#C084FC] bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
            AUTO-LINKED BY SHADOW
          </span>
        </div>

        {connectedLinks.length > 0 ? (
          <div className="space-y-3">
            {connectedLinks.map((link) => (
              <Link
                key={link.id}
                href={`/memories/${link.connectedMemory.id}`}
                className="block p-3.5 rounded-xl bg-[#12121B] hover:bg-[#191926] border border-[#252238] hover:border-[#8B5CF6]/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#F4F3F8] group-hover:text-[#C084FC] transition-colors">
                    {link.connectedMemory.title}
                  </span>
                  <span className="text-[10px] font-mono-retro text-[#C084FC] px-1.5 py-0.5 rounded bg-purple-950/70 border border-purple-800/50">
                    {Math.round((link.similarity_score || 0.8) * 100)}% SIMILARITY
                  </span>
                </div>
                <p className="text-[11px] text-[#8E8AA6] font-mono-retro leading-relaxed">
                  Reasoning: {link.connection_reason || link.reasoning}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8E8AA6] font-mono-retro italic">
            No automatic connections discovered yet. As you add more memories, Shadow will weave them into this cognitive graph.
          </p>
        )}
      </div>
    </div>
  );
}
