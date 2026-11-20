"use client";

import { Bell, Calendar, CheckCircle2, Clock, Hotel, MapPin, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface TravelAlert {
  id: string;
  destination: string;
  title: string;
  notice: string;
  timing: string;
  hotelRange?: string;
  badge: string;
}

const STORAGE_KEY = "wayfarer_alerts_v2";

export default function TravelAlertsPage() {
  const [alerts, setAlerts] = useState<TravelAlert[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [dest, setDest] = useState("");
  const [title, setTitle] = useState("");
  const [notice, setNotice] = useState("");
  const [timing, setTiming] = useState("");
  const [hotelRange, setHotelRange] = useState("");
  const [badge, setBadge] = useState("Peak Season Alert");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAlerts(JSON.parse(stored));
      }
    } catch {
      setAlerts([]);
    }
  }, []);

  const saveAlerts = (newAlerts: TravelAlert[]) => {
    setAlerts(newAlerts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAlerts));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dest.trim() || !title.trim()) return;

    const newAlert: TravelAlert = {
      id: `al-${Date.now()}`,
      destination: dest.trim(),
      title: title.trim(),
      notice: notice.trim() || "Stay alert for booking dates and seasonal rate shifts.",
      timing: timing.trim() || "Upcoming",
      hotelRange: hotelRange.trim() || undefined,
      badge,
    };

    saveAlerts([newAlert, ...alerts]);
    setDest("");
    setTitle("");
    setNotice("");
    setTiming("");
    setHotelRange("");
    setShowModal(false);
  };

  const handleDeleteAlert = (id: string) => {
    saveAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#201d32] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Travel Alerts & Booking Deadlines
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Track hotel booking windows, visa deadlines, and seasonal rate changes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)] flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Alert</span>
        </button>
      </div>

      {/* Alerts Grid */}
      {alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-5 rounded-2xl bg-[#0c0b14]/90 border border-[#23203c] hover:border-sky-500/40 transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-retro font-medium border bg-sky-950/80 text-sky-300 border-sky-700/50">
                  {alert.badge}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono-retro text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-400" />
                    {alert.destination}
                  </span>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-gray-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-sm text-gray-100">{alert.title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">{alert.notice}</p>

              <div className="pt-2 border-t border-[#1e1c30] flex items-center justify-between text-xs font-mono-retro">
                <span className="text-sky-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  {alert.timing}
                </span>
                {alert.hotelRange && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Hotel className="w-3.5 h-3.5" />
                    {alert.hotelRange}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#0c0b14]/70 border border-[#222036] space-y-3">
          <Bell className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-sm font-semibold text-gray-200">No Active Travel Alerts</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Set custom reminders for hotel booking windows, seasonal rate shifts, or ferry launches.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Your First Alert</span>
          </button>
        </div>
      )}

      {/* Modal to add alert */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#0c0b14] border border-[#2a2644] p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#201d32] pb-3">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-400" />
                Add Travel Reminder
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAlert} className="space-y-3">
              <div>
                <label className="block font-medium text-gray-300 mb-1">Destination City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto, Positano, Bali"
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-300 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autumn Ryokan Booking Window Opens"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl px-3 py-2 text-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-300 mb-1">Timing / Deadline</label>
                  <input
                    type="text"
                    placeholder="e.g. 90 Days in Advance"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    className="w-full bg-[#141224] border border-[#26233d] rounded-xl px-3 py-2 text-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-300 mb-1">Hotel Price Est.</label>
                  <input
                    type="text"
                    placeholder="e.g. $80 - $140/night"
                    value={hotelRange}
                    onChange={(e) => setHotelRange(e.target.value)}
                    className="w-full bg-[#141224] border border-[#26233d] rounded-xl px-3 py-2 text-gray-200 font-mono-retro"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-300 mb-1">Notice / Details</label>
                <textarea
                  rows={3}
                  placeholder="Important details to remember..."
                  value={notice}
                  onChange={(e) => setNotice(e.target.value)}
                  className="w-full bg-[#141224] border border-[#26233d] focus:border-sky-500 rounded-xl p-3 text-gray-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
