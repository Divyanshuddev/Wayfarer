"use client";

import { Bell, Calendar, CheckCircle2, Clock, Hotel, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function TravelAlertsPage() {
  const [alerts] = useState([
    {
      id: "al-1",
      destination: "Kyoto, Japan",
      title: "Autumn Ryokan Bookings Open",
      notice: "Traditional wooden machiyas and ryokans in Gion book out 3-4 months ahead of peak November maple foliage.",
      timing: "Book 90 Days in Advance",
      hotelRange: "$75 - $140 / night",
      badge: "Peak Season Alert",
      badgeColor: "bg-amber-950/80 text-amber-300 border-amber-700/50",
    },
    {
      id: "al-2",
      destination: "Amalfi Coast, Italy",
      title: "Public High-Speed Ferry Schedules Released",
      notice: "Ferry tickets between Positano, Capri, and Salerno go live in April. Avoid driving narrow cliff roads.",
      timing: "Summer Travel Window",
      hotelRange: "$180 - $350 / night",
      badge: "Transit Notice",
      badgeColor: "bg-sky-950/80 text-sky-300 border-sky-700/50",
    },
    {
      id: "al-3",
      destination: "Bali, Indonesia",
      title: "Dry Season Digital Nomad Villa Surge",
      notice: "Villas with private pools and fast starlink wifi in Pererenan/Ubud fill rapidly for July-August dry season.",
      timing: "May - September Window",
      hotelRange: "$25 - $70 / night",
      badge: "Budget Opportunity",
      badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-700/50",
    },
    {
      id: "al-4",
      destination: "Zermatt, Switzerland",
      title: "Swiss Travel Pass 50% Cable Car Savings",
      notice: "Purchase Swiss Pass online prior to arrival to save 50% on Gornergrat cogwheel train and Matterhorn cable cars.",
      timing: "All Seasons",
      hotelRange: "$130 - $220 / night",
      badge: "Money Saver",
      badgeColor: "bg-purple-950/80 text-purple-300 border-purple-700/50",
    },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#201d32] pb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-sky-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Travel Alerts & Booking Windows
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Stay ahead of sold-out hotel seasons, ferry launches, and money-saving booking deadlines.
        </p>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-5 rounded-2xl bg-[#0c0b14]/90 border border-[#23203c] hover:border-sky-500/40 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-retro font-medium border ${alert.badgeColor}`}
              >
                {alert.badge}
              </span>
              <span className="text-[11px] font-mono-retro text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" />
                {alert.destination}
              </span>
            </div>

            <h3 className="font-bold text-sm text-gray-100">{alert.title}</h3>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">{alert.notice}</p>

            <div className="pt-2 border-t border-[#1e1c30] flex items-center justify-between text-xs font-mono-retro">
              <span className="text-sky-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                {alert.timing}
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Hotel className="w-3.5 h-3.5" />
                {alert.hotelRange}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
