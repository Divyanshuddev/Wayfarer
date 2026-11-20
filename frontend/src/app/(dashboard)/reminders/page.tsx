"use client";

import { shadowStore } from "@/lib/storage/store";
import { reminderTypes } from "@/lib/validations/reminder";
import { Reminder, ReminderType } from "@/types/database";
import {
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gift,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filterState, setFilterState] = useState<"all" | "active" | "completed">("active");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminderType, setReminderType] = useState<ReminderType>("birthday");
  const [recurrenceRule, setRecurrenceRule] = useState<"none" | "yearly" | "monthly" | "weekly">("yearly");

  useEffect(() => {
    setDueDate(new Date().toISOString().slice(0, 10));
    const update = () => setReminders(shadowStore.getReminders());
    update();
    return shadowStore.subscribe(update);
  }, []);

  const handleToggle = (id: string) => {
    shadowStore.toggleReminder(id);
  };

  const handleDelete = (id: string) => {
    shadowStore.deleteReminder(id);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    shadowStore.createReminder({
      title: title.trim(),
      due_date: new Date(dueDate).toISOString(),
      reminder_type: reminderType,
      recurrence_rule: recurrenceRule,
    });

    setTitle("");
    setShowAddModal(false);
  };

  const filteredReminders = reminders.filter((r) => {
    if (filterState === "active") return !r.is_completed;
    if (filterState === "completed") return r.is_completed;
    return true;
  });

  const typeIconMap: Record<string, any> = {
    birthday: Gift,
    anniversary: Sparkles,
    follow_up: Clock,
    memory_recurrence: RefreshCw,
    custom: Bell,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">
            Birthdays & Memory Reminders
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-serif">
            Never let a friend&apos;s birthday or poignant anniversary slip into the shadows.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#201e32] pb-2 text-xs font-mono-retro">
        <button
          onClick={() => setFilterState("active")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterState === "active"
              ? "bg-purple-950 text-purple-300 border border-purple-500/40"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Active ({reminders.filter((r) => !r.is_completed).length})
        </button>
        <button
          onClick={() => setFilterState("completed")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterState === "completed"
              ? "bg-purple-950 text-purple-300 border border-purple-500/40"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Completed ({reminders.filter((r) => r.is_completed).length})
        </button>
        <button
          onClick={() => setFilterState("all")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterState === "all"
              ? "bg-purple-950 text-purple-300 border border-purple-500/40"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          All ({reminders.length})
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length > 0 ? (
          filteredReminders.map((r) => {
            const Icon = typeIconMap[r.reminder_type] || Bell;
            const dateObj = new Date(r.due_date);
            const formattedDate = dateObj.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={r.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  r.is_completed
                    ? "bg-[#0b0a14] border-[#1b1928] opacity-60"
                    : "bg-[#0f0e1a] border-[#232036] hover:border-purple-500/40 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(r.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      r.is_completed
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "border-gray-500 hover:border-purple-400"
                    }`}
                  >
                    {r.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="w-8 h-8 rounded-lg bg-[#151426] border border-[#272440] flex items-center justify-center text-purple-400 flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium truncate ${
                          r.is_completed ? "line-through text-gray-500" : "text-gray-100"
                        }`}
                      >
                        {r.title}
                      </span>
                      {r.recurrence_rule && r.recurrence_rule !== "none" && (
                        <span className="text-[10px] font-mono-retro px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-400 border border-purple-900/50">
                          ↻ {r.recurrence_rule}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono-retro text-gray-400 mt-0.5">
                      <span>Due: {formattedDate}</span>
                      {r.memory_id && (
                        <Link
                          href={`/memories/${r.memory_id}`}
                          className="flex items-center gap-1 text-purple-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Originating Memory</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-gray-500 hover:text-rose-400 p-1.5 transition-colors"
                  title="Purge Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-16 text-center rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-2">
            <p className="text-sm font-mono-retro text-gray-400">
              No reminders in this view.
            </p>
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0e0d18] border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#211f32] pb-3">
              <h3 className="text-base font-semibold text-gray-100 font-mono-retro">
                Create Memory Reminder
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-gray-400 font-mono-retro mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya's 30th Birthday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#131122] border border-[#25223c] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono-retro mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#131122] border border-[#25223c] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 font-mono-retro"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-mono-retro mb-1">
                    Type
                  </label>
                  <select
                    value={reminderType}
                    onChange={(e) => setReminderType(e.target.value as any)}
                    className="w-full bg-[#131122] border border-[#25223c] rounded-lg px-2.5 py-1.5 text-xs text-gray-200"
                  >
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="memory_recurrence">Yearly Recurrence</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-mono-retro mb-1">
                  Recurrence Pattern
                </label>
                <select
                  value={recurrenceRule}
                  onChange={(e) => setRecurrenceRule(e.target.value as any)}
                  className="w-full bg-[#131122] border border-[#25223c] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 font-mono-retro"
                >
                  <option value="none">One-time only</option>
                  <option value="yearly">Yearly (Birthdays & Anniversaries)</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium"
                >
                  Schedule Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
