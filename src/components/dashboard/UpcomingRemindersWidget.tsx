"use client";

import { shadowStore } from "@/lib/storage/store";
import { Reminder } from "@/types/database";
import { Bell, Calendar, Check, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export function UpcomingRemindersWidget() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  useEffect(() => {
    setNewDueDate(new Date().toISOString().slice(0, 10));
    const update = () => setReminders(shadowStore.getReminders());
    update();
    return shadowStore.subscribe(update);
  }, []);

  const handleToggle = (id: string) => {
    shadowStore.toggleReminder(id);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    shadowStore.createReminder({
      title: newTitle.trim(),
      due_date: new Date(newDueDate).toISOString(),
      reminder_type: "custom",
    });

    setNewTitle("");
    setShowAdd(false);
  };

  const upcomingList = reminders.slice(0, 4);

  return (
    <div className="p-5 rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-mono-retro text-gray-200 uppercase tracking-wider font-semibold">
            Upcoming Memory Reminders
          </h4>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-[11px] font-mono-retro text-purple-400 hover:text-purple-300"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAdd && (
        <form onSubmit={handleCreate} className="p-3 rounded-xl bg-[#141224] border border-purple-500/30 space-y-2">
          <input
            type="text"
            placeholder="e.g. Maya's Birthday or Follow-up on project"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-[#0d0c18] border border-[#25223c] rounded-lg px-3 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <div className="flex items-center justify-between gap-2">
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="bg-[#0d0c18] border border-[#25223c] rounded-lg px-2.5 py-1 text-xs text-gray-200 font-mono-retro"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-2 py-1 text-xs text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Reminders List */}
      <div className="space-y-2">
        {upcomingList.length > 0 ? (
          upcomingList.map((r) => {
            const formatted = new Date(r.due_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={r.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  r.is_completed
                    ? "bg-[#0b0a14] border-[#1a1828] opacity-50"
                    : "bg-[#131122] border-[#25223c] hover:border-purple-500/30"
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(r.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      r.is_completed
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "border-gray-500 hover:border-purple-400"
                    }`}
                  >
                    {r.is_completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium truncate ${
                        r.is_completed ? "line-through text-gray-500" : "text-gray-200"
                      }`}
                    >
                      {r.title}
                    </p>
                    {r.memory_title && (
                      <p className="text-[10px] text-gray-400 font-mono-retro truncate">
                        Linked: {r.memory_title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-mono-retro px-1.5 py-0.5 rounded bg-[#1c1a2e] text-purple-300">
                    {formatted}
                  </span>
                  <button
                    onClick={() => shadowStore.deleteReminder(r.id)}
                    className="text-gray-500 hover:text-rose-400 p-1"
                    title="Delete reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-gray-400 font-mono-retro italic text-center py-4">
            No upcoming reminders.
          </p>
        )}
      </div>

      <div className="pt-1 text-center">
        <Link
          href="/reminders"
          className="text-xs font-mono-retro text-purple-400 hover:text-purple-300 hover:underline"
        >
          View All Reminders →
        </Link>
      </div>
    </div>
  );
}
