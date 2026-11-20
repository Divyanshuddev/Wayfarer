"use client";

import { shadowStore } from "@/lib/storage/store";
import { Memory, MemoryLink } from "@/types/database";
import {
  ArrowLeft,
  Calendar,
  Check,
  Edit3,
  Heart,
  Image as ImageIcon,
  Link2,
  MapPin,
  Mic,
  Pin,
  Share2,
  Sparkles,
  Tag,
  Trash2,
  User,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface MemoryDetailViewProps {
  memoryId: string;
}

export function MemoryDetailView({ memoryId }: MemoryDetailViewProps) {
  const router = useRouter();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [connectedLinks, setConnectedLinks] = useState<
    (MemoryLink & { connectedMemory: Memory })[]
  >([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const load = () => {
      const mem = shadowStore.getMemory(memoryId);
      if (mem) {
        setMemory(mem);
        setEditedTitle(mem.title);
        setEditedContent(mem.content);
        setConnectedLinks(shadowStore.getLinksForMemory(memoryId));
      }
    };
    load();
    return shadowStore.subscribe(load);
  }, [memoryId]);

  if (!memory) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-gray-400 font-mono-retro">Memory not found in vault.</p>
        <Link
          href="/memories"
          className="inline-flex items-center gap-2 text-xs font-mono-retro text-purple-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Archive
        </Link>
      </div>
    );
  }

  const handleSaveEdit = () => {
    shadowStore.updateMemory(memory.id, {
      title: editedTitle,
      content: editedContent,
      summary: editedContent.slice(0, 160),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    shadowStore.deleteMemory(memory.id);
    router.push("/memories");
  };

  const formattedDate = new Date(memory.memory_date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Nav & Action Controls */}
      <div className="flex items-center justify-between gap-4 border-b border-[#211f32] pb-4">
        <Link
          href="/memories"
          className="flex items-center gap-1.5 text-xs font-mono-retro text-gray-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Archive</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => shadowStore.togglePin(memory.id)}
            title={memory.is_pinned ? "Unpin" : "Pin"}
            className={`p-2 rounded-lg border transition-colors ${
              memory.is_pinned
                ? "bg-purple-950/80 text-purple-300 border-purple-500/50"
                : "bg-[#141220] text-gray-400 border-[#252238] hover:text-gray-200"
            }`}
          >
            <Pin className={`w-4 h-4 ${memory.is_pinned ? "fill-purple-400" : ""}`} />
          </button>

          <button
            onClick={() => shadowStore.toggleFavorite(memory.id)}
            title={memory.is_favorite ? "Unfavorite" : "Favorite"}
            className={`p-2 rounded-lg border transition-colors ${
              memory.is_favorite
                ? "bg-rose-950/80 text-rose-300 border-rose-500/50"
                : "bg-[#141220] text-gray-400 border-[#252238] hover:text-gray-200"
            }`}
          >
            <Heart className={`w-4 h-4 ${memory.is_favorite ? "fill-rose-400" : ""}`} />
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#151424] hover:bg-[#1e1c32] text-gray-300 border border-[#27243c] text-xs font-medium transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-400" />
            <span>{isEditing ? "Cancel" : "Edit"}</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg bg-[#151424] hover:bg-rose-950/50 text-gray-400 hover:text-rose-400 border border-[#27243c] transition-colors"
            title="Delete Memory"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-rose-200">
              Permanently purge this memory from your digital archive?
            </p>
            <p className="text-[11px] text-rose-400/80 font-mono-retro">
              Associated links and embeddings will also be removed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200"
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

      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-mono-retro font-medium uppercase px-2.5 py-1 rounded bg-purple-950/50 border border-purple-800/50 text-purple-300">
            {memory.category}
          </span>
          <span className="text-[11px] font-mono-retro text-gray-400 px-2 py-0.5 rounded bg-[#131220] border border-[#232036]">
            Sentiment: {memory.sentiment}
          </span>
          <span className="text-[11px] font-mono-retro text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Vector Embedded (1536d)
          </span>
        </div>

        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full bg-[#12111d] border border-purple-500/50 rounded-xl px-4 py-2.5 text-xl font-bold text-gray-100"
          />
        ) : (
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 tracking-tight leading-tight">
            {memory.title}
          </h1>
        )}

        <div className="flex items-center gap-4 text-xs font-mono-retro text-gray-400 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            {formattedDate}
          </span>
          {memory.location_name && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              {memory.location_name}
            </span>
          )}
          {memory.weather && (
            <span className="text-gray-400">Weather: {memory.weather}</span>
          )}
        </div>
      </div>

      {/* Voice Audio Player Widget (if voice memory) */}
      {memory.source_type === "voice" && (
        <div className="p-4 rounded-xl bg-[#11101d] border border-purple-900/40 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Volume2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-200">Preserved Audio Recording</p>
            <p className="text-[10px] text-gray-400 font-mono-retro">
              Transcribed via Whisper-1 engine
            </p>
          </div>
          <audio controls className="h-8 max-w-[240px] opacity-80" />
        </div>
      )}

      {/* Image Gallery (if attachments exist) */}
      {memory.attachments && memory.attachments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-mono-retro text-purple-300 uppercase tracking-wider">
            Preserved Visual Artifacts ({memory.attachments.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memory.attachments.map((att) => (
              <div
                key={att.id}
                className="rounded-xl overflow-hidden border border-[#27243c] bg-[#0c0b14] group"
              >
                <div className="h-64 w-full overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.file_path}
                    alt={att.file_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {att.extracted_text && (
                  <div className="p-3 bg-[#11101d] border-t border-[#1e1c2e] text-xs font-mono-retro text-purple-300">
                    <span className="text-gray-400 text-[10px] block mb-0.5">VISION OCR:</span>
                    {att.extracted_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content View / Edit */}
      <div className="p-6 rounded-2xl bg-[#0f0e1a]/90 border border-[#232036] shadow-xl">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              rows={10}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-[#131220] border border-purple-500/50 rounded-xl p-4 text-sm text-gray-100 font-serif leading-relaxed"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
              >
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-gray-200 font-serif text-base leading-relaxed whitespace-pre-line">
            {memory.content}
          </div>
        )}
      </div>

      {/* Extracted Entities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* People Mentioned */}
        <div className="p-4 rounded-xl bg-[#0f0e19] border border-[#201e32]">
          <h4 className="text-xs font-mono-retro text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> People Mentioned
          </h4>
          {memory.people.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {memory.people.map((person) => (
                <span
                  key={person}
                  className="px-2.5 py-1 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-xs font-medium"
                >
                  {person}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-mono-retro italic">None explicitly identified</p>
          )}
        </div>

        {/* Tags */}
        <div className="p-4 rounded-xl bg-[#0f0e19] border border-[#201e32]">
          <h4 className="text-xs font-mono-retro text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Thematic Tags
          </h4>
          {memory.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {memory.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md bg-[#181628] text-purple-300 border border-purple-900/30 text-xs font-mono-retro"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-mono-retro italic">No tags assigned</p>
          )}
        </div>
      </div>

      {/* Connected Memories (Knowledge Graph Auto-Links) */}
      <div className="p-5 rounded-2xl bg-[#0e0d18] border border-purple-950/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-gray-100 tracking-tight">
              Connected Memory Web ({connectedLinks.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono-retro text-purple-400/80 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
            AUTO-LINKED BY SHADOW
          </span>
        </div>

        {connectedLinks.length > 0 ? (
          <div className="space-y-3">
            {connectedLinks.map((link) => (
              <Link
                key={link.id}
                href={`/memories/${link.connectedMemory.id}`}
                className="block p-3.5 rounded-xl bg-[#131222] hover:bg-[#18172c] border border-[#232038] hover:border-purple-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-200 group-hover:text-purple-200 transition-colors">
                    {link.connectedMemory.title}
                  </span>
                  <span className="text-[10px] font-mono-retro text-purple-400 px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-900/40">
                    {link.link_type} ({(link.confidence_score * 100).toFixed(0)}%)
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-mono-retro leading-relaxed">
                  Reasoning: {link.reasoning}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-mono-retro italic">
            No automatic connections discovered yet. As you add more memories, Shadow will weave them into this cognitive graph.
          </p>
        )}
      </div>
    </div>
  );
}
