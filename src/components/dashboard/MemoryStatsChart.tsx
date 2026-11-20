"use client";

import { shadowStore } from "@/lib/storage/store";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
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

  // Format category data for charts
  const categoryData = Object.entries(stats.categoryCounts).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count,
  }));

  const sentimentData = Object.entries(stats.sentimentCounts).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: count,
  }));

  const SENTIMENT_COLORS: Record<string, string> = {
    Reflective: "#c084fc",
    Positive: "#34d399",
    Neutral: "#9ca3af",
    Negative: "#f43f5e",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Category Breakdown Bar Chart */}
      <div className="p-5 rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono-retro text-gray-300 uppercase tracking-wider">
            Archive Density by Category
          </h4>
          <span className="text-[10px] font-mono-retro text-purple-400">
            {stats.total} Total Memories
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#131222",
                  borderColor: "#3b3456",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e5e7eb",
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment Emotional Balance Pie */}
      <div className="p-5 rounded-2xl bg-[#0e0d18] border border-[#232038] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono-retro text-gray-300 uppercase tracking-wider">
            Emotional Spectrum
          </h4>
          <span className="text-[10px] font-mono-retro text-purple-400">
            Valence Analysis
          </span>
        </div>

        <div className="h-48 w-full flex items-center justify-between">
          <div className="h-full w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sentimentData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={SENTIMENT_COLORS[entry.name] || "#8b5cf6"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#131222",
                    borderColor: "#3b3456",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#e5e7eb",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-1/2 space-y-2 pr-2">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: SENTIMENT_COLORS[item.name] || "#8b5cf6",
                    }}
                  />
                  <span className="text-gray-300 font-mono-retro text-[11px]">{item.name}</span>
                </div>
                <span className="text-gray-400 font-mono-retro text-[11px] font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
