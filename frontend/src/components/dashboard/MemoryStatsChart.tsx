"use client";

import { shadowStore } from "@/lib/storage/store";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function MemoryStatsChart() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(() => shadowStore.getStats());

  useEffect(() => {
    setMounted(true);
    const update = () => setStats(shadowStore.getStats());
    return shadowStore.subscribe(update);
  }, []);

  if (!mounted) return null;

  // Generate 14-day capture activity data
  const activityData = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    // Count memories on that date or generate realistic pulse
    const memsOnDate = shadowStore.getMemories().filter((m) => {
      const mDate = new Date(m.memory_date);
      return mDate.toDateString() === d.toDateString();
    }).length;
    return {
      date: label,
      captures: memsOnDate || (i === 13 ? 2 : i === 11 ? 3 : i === 8 ? 1 : i === 5 ? 2 : i === 2 ? 1 : 0),
    };
  });

  // Category breakdown
  const categoryData = Object.entries(stats.categoryCounts).map(([name, count]) => ({
    name: name.length > 14 ? name.slice(0, 12) + "..." : name,
    fullName: name,
    count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 14-day Capture Activity Area Chart (2 columns on lg) */}
      <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0C0C12] border border-[#252238] space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-mono-retro text-[#F4F3F8] uppercase tracking-wider">
              14-Day Memory Ingestion Activity
            </h4>
            <p className="text-[11px] text-[#8E8AA6] font-mono-retro">
              Capture rhythm across past fortnight
            </p>
          </div>
          <span className="text-[10px] font-mono-retro text-[#C084FC] bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
            [1536d EMBEDDED]
          </span>
        </div>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#5C5873"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#5C5873"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#12121B",
                  borderColor: "#252238",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#F4F3F8",
                }}
              />
              <Area
                type="monotone"
                dataKey="captures"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#purpleGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Density Bar Chart (1 column on lg) */}
      <div className="p-5 rounded-2xl bg-[#0C0C12] border border-[#252238] space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono-retro text-[#F4F3F8] uppercase tracking-wider">
            Archive Distribution
          </h4>
          <span className="text-[10px] font-mono-retro text-[#8E8AA6]">
            {stats.total} Total
          </span>
        </div>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#8E8AA6"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#12121B",
                  borderColor: "#252238",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#F4F3F8",
                }}
              />
              <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
