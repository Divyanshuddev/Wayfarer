"use client";

import { shadowStore } from "@/lib/storage/store";
import { Memory, Reminder, ReminderType } from "@/types/database";
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
  const [memories, setMemories] = useState<Memory[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "birthdays" | "completed">("upcoming");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [reminderType, setReminderType] = useState<ReminderType>("birthday");
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly">("yearly");
  const [linkedMemoryId, setLinkedMemoryId] = useState("");

  useEffect(() => {
    setRemindAt(new Date().toISOString().slice(0, 16));
    const update = () => {
      setReminders(shadowStore.getReminders());
      setMemories(shadowStore.getMemories());
    };
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

    const linkedMem = memories.find((m) => m.id === linkedMemoryId);

    shadowStore.createReminder({
      title: title.trim(),
      notes: notes.trim() || null,
      remind_at: new Date(remindAt).toISOString(),
      due_date: new Date(remindAt).toISOString(),
      reminder_type: reminderType,
      recurrence,
      recurrence_rule: recurrence,
      memory_id: linkedMemoryId || null,
      memory_title: linkedMem?.title,
    });

    setTitle("");
    setNotes("");
    setLinkedMemoryId("");
    setShowAddModal(false);
  };

  // Helper: calculate countdown pill
  const getCountdownPill = (remindAtStr: string, isCompleted: boolean) => {
    if (isCompleted) {
      return { text: "Completed", color: "bg-emerald-950/60 text-emerald-400 border-emerald-800/40" };
    }
    const target = new Date(remindAtStr).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Overdue", color: "bg-rose-950/80 text-rose-300 border-rose-800/50" };
    } else if (diffDays === 0) {
      return { text: "Today", color: "bg-amber-950/80 text-amber-300 border-amber-800/50" };
    } else if (diffDays === 1) {
      return { text: "Tomorrow", color: "bg-purple-950/80 text-[#C084FC] border-purple-800/50" };
    } else {
      return { text: `In ${diffDays} days`, color: "bg-[#191926] text-[#8E8AA6] border-[#252238]" };
    }
  };

  // Filter list based on tabs
  const filteredReminders = reminders.filter((r) => {
    if (activeTab === "completed") return r.is_completed;
    if (activeTab === "birthdays") return !r.is_completed && r.reminder_type === "birthday";
    // upcoming tab: all active reminders
    return !r.is_completed;
  });

  const typeIconMap: Record<string, any> = {
    birthday: Gift,
    anniversary: Sparkles,
    follow_up: Clock,
    event: Calendar,
    memory_recurrence: RefreshCw,
    custom: Bell,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F3F8]">
            Birthdays & Memory Reminders
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8AA6] font-serif">
            Never let a friend&apos;s birthday, anniversary, or critical follow-up slip into the shadows.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-[#8B5CF6] hover:bg-purple-500 text-white text-xs font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* 3 Tabs: Upcoming, Birthdays, Completed */}
      <div className="flex items-center gap-2 border-b border-[#252238] pb-2 text-xs font-mono-retro">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "upcoming"
              ? "bg-purple-950 text-[#C084FC] border border-purple-500/50"
              : "text-[#8E8AA6] hover:text-[#F4F3F8]"
          }`}
        >
          Upcoming ({reminders.filter((r) => !r.is_completed).length})
        </button>

        <button
          onClick={() => setActiveTab("birthdays")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "birthdays"
              ? "bg-purple-950 text-[#C084FC] border border-purple-500/50"
              : "text-[#8E8AA6] hover:text-[#F4F3F8]"
          }`}
        >
          Birthdays (
          {reminders.filter((r) => !r.is_completed && r.reminder_type === "birthday").length}
          )
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "completed"
              ? "bg-purple-950 text-[#C084FC] border border-purple-500/50"
              : "text-[#8E8AA6] hover:text-[#F4F3F8]"
          }`}
        >
          Completed ({reminders.filter((r) => r.is_completed).length})
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length > 0 ? (
          filteredReminders.map((r) => {
            const Icon = typeIconMap[r.reminder_type] || Bell;
            const dateStr = r.remind_at || r.due_date;
            const dateObj = new Date(dateStr);
            const formattedDate = dateObj.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const pill = getCountdownPill(dateStr, r.is_completed);

            return (
              <div
                key={r.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all shadow-sm ${
                  r.is_completed
                    ? "bg-[#050508] border-[#191926] opacity-60"
                    : "bg-[#0C0C12] border-[#252238] hover:border-[#8B5CF6]/50"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* One-click completion checkbox */}
                  <button
                    onClick={() => handleToggle(r.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      r.is_completed
                        ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                        : "border-[#5C5873] hover:border-[#8B5CF6]"
                    }`}
                  >
                    {r.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="w-9 h-9 rounded-lg bg-[#191926] border border-[#252238] flex items-center justify-center text-[#C084FC] flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-medium truncate ${
                          r.is_completed ? "line-through text-[#5C5873]" : "text-[#F4F3F8]"
                        }`}
                      >
                        {r.title}
                      </span>
                      {r.recurrence && r.recurrence !== "none" && (
                        <span className="text-[10px] font-mono-retro px-1.5 py-0.2 rounded bg-purple-950/70 text-[#C084FC] border border-purple-900/50">
                          ↻ {r.recurrence}
                        </span>
                      )}
                      {/* Countdown Pill */}
                      <span
                        className={`text-[10px] font-mono-retro px-2 py-0.5 rounded border ${pill.color}`}
                      >
                        {pill.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono-retro text-[#8E8AA6] mt-1">
                      <span>Due: {formattedDate}</span>
                      {r.memory_id && (
                        <Link
                          href={`/memories/${r.memory_id}`}
                          className="flex items-center gap-1 text-[#8B5CF6] hover:underline"
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
                  className="text-[#5C5873] hover:text-rose-400 p-1.5 transition-colors"
                  title="Purge Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-16 text-center rounded-2xl bg-[#0C0C12] border border-[#252238] space-y-2">
            <p className="text-sm font-mono-retro text-[#8E8AA6]">
              No reminders in this view.
            </p>
          </div>
        )}
      </div>

      {/* Create Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0C0C12] border border-[#252238] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#252238] pb-3">
              <h3 className="text-base font-semibold text-[#F4F3F8] font-mono-retro">
                Create Memory Reminder
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#8E8AA6] hover:text-[#F4F3F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#8E8AA6] font-mono-retro mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya's 30th Birthday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#12121B] border border-[#252238] rounded-xl px-3 py-2 text-sm text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-[#8E8AA6] font-mono-retro mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional detail or gift idea..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-3 py-1.5 text-xs text-[#F4F3F8] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8E8AA6] font-mono-retro mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={remindAt}
                    onChange={(e) => setRemindAt(e.target.value)}
                    className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F3F8] font-mono-retro focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#8E8AA6] font-mono-retro mb-1">
                    Type
                  </label>
                  <select
                    value={reminderType}
                    onChange={(e) => setReminderType(e.target.value as any)}
                    className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F3F8] focus:outline-none"
                  >
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="event">Event</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8E8AA6] font-mono-retro mb-1">
                    Recurrence
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F3F8] font-mono-retro focus:outline-none"
                  >
                    <option value="none">One-time only</option>
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8E8AA6] font-mono-retro mb-1">
                    Link to Memory
                  </label>
                  <select
                    value={linkedMemoryId}
                    onChange={(e) => setLinkedMemoryId(e.target.value)}
                    className="w-full bg-[#12121B] border border-[#252238] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F3F8] focus:outline-none"
                  >
                    <option value="">None (Independent)</option>
                    {memories.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-[#8E8AA6] hover:text-[#F4F3F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-purple-500 text-white font-medium"
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
