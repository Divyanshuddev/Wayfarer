"use client";

import { shadowStore } from "@/lib/storage/store";
import { memoryCategories } from "@/lib/validations/memory";
import { Collection, MemoryCategory } from "@/types/database";
import {
  BookOpen,
  Compass,
  Cpu,
  Folder,
  FolderKanban,
  MessageCircle,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<(Collection & { count: number })[]>([]);
  const [showModal, setShowModal] = useState(false);

  // New Collection Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("folder");
  const [color, setColor] = useState("#8b5cf6");
  const [isSmart, setIsSmart] = useState(false);
  const [smartCategory, setSmartCategory] = useState<MemoryCategory | "">("");
  const [smartPerson, setSmartPerson] = useState("");
  const [smartTag, setSmartTag] = useState("");

  useEffect(() => {
    const update = () => setCollections(shadowStore.getCollections());
    update();
    return shadowStore.subscribe(update);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let filter_criteria = null;
    if (isSmart) {
      filter_criteria = {
        category: smartCategory ? smartCategory : undefined,
        people: smartPerson.trim() ? [smartPerson.trim()] : undefined,
        tags: smartTag.trim() ? [smartTag.trim()] : undefined,
      };
    }

    shadowStore.createCollection({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      is_smart: isSmart,
      filter_criteria,
    });

    setName("");
    setDescription("");
    setIsSmart(false);
    setShowModal(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this collection? Memories will remain in your general vault.")) {
      shadowStore.deleteCollection(id);
    }
  };

  const iconComponentMap: Record<string, any> = {
    compass: Compass,
    cpu: Cpu,
    "message-circle": MessageCircle,
    "book-open": BookOpen,
    folder: Folder,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">
            Memory Collections
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-serif">
            Curate manual scrapbooks or configure auto-populating Smart Collections.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => {
          const Icon = iconComponentMap[col.icon] || Folder;

          return (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="group p-5 rounded-2xl bg-[#0e0d18] hover:bg-[#131122] border border-[#232036] hover:border-purple-500/40 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all"
                    style={{
                      backgroundColor: `${col.color}20`,
                      borderColor: `${col.color}60`,
                      color: col.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-2">
                    {col.is_smart && (
                      <span className="flex items-center gap-1 text-[10px] font-mono-retro text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>SMART</span>
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDelete(col.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 p-1 transition-opacity"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-base text-gray-100 group-hover:text-purple-200 transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-serif leading-relaxed line-clamp-2 mt-1">
                    {col.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1e1c2e] text-xs font-mono-retro text-gray-400">
                <span>{col.count} memories</span>
                <span className="text-purple-400 group-hover:underline">Open →</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* New Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0e0d18] border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#211f32] pb-3">
              <h3 className="text-base font-semibold text-gray-100 font-mono-retro">
                Create Memory Collection
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-gray-400 font-mono-retro mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel Journal 2024"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#131122] border border-[#25223c] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono-retro mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What belongs in this mental space?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#131122] border border-[#25223c] rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-purple-500 font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono-retro mb-1">
                    Icon
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full bg-[#131122] border border-[#25223c] rounded-lg px-2.5 py-1.5 text-xs text-gray-200"
                  >
                    <option value="folder">Folder</option>
                    <option value="compass">Compass / Travel</option>
                    <option value="cpu">CPU / Tech</option>
                    <option value="message-circle">Chat / People</option>
                    <option value="book-open">Book / Reading</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-mono-retro mb-1">
                    Color Accent
                  </label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-[#131122] border border-[#25223c] rounded-lg px-2.5 py-1.5 text-xs text-gray-200"
                  >
                    <option value="#8b5cf6">Violet Purple</option>
                    <option value="#a855f7">Neon Purple</option>
                    <option value="#3b82f6">Cyan Blue</option>
                    <option value="#ec4899">Rose Pink</option>
                    <option value="#10b981">Emerald Green</option>
                    <option value="#f59e0b">Amber Gold</option>
                  </select>
                </div>
              </div>

              {/* Smart Collection Toggle */}
              <div className="p-3 rounded-xl bg-[#131122] border border-[#232038] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSmart}
                    onChange={(e) => setIsSmart(e.target.checked)}
                    className="rounded border-[#25223c] bg-[#0c0b14] text-purple-600"
                  />
                  <span className="font-mono-retro text-purple-300 font-semibold text-xs">
                    Smart Collection (Auto-Rules)
                  </span>
                </label>

                {isSmart && (
                  <div className="space-y-2 pt-2 border-t border-[#1e1c2e]">
                    <div>
                      <label className="block text-[10px] font-mono-retro text-gray-400">
                        Match Category:
                      </label>
                      <select
                        value={smartCategory}
                        onChange={(e) => setSmartCategory(e.target.value as any)}
                        className="w-full bg-[#0d0c18] border border-[#232036] rounded px-2 py-1 text-xs text-gray-200"
                      >
                        <option value="">Any Category</option>
                        {memoryCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-retro text-gray-400">
                        Match Person:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Maya Lin"
                        value={smartPerson}
                        onChange={(e) => setSmartPerson(e.target.value)}
                        className="w-full bg-[#0d0c18] border border-[#232036] rounded px-2 py-1 text-xs text-gray-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
