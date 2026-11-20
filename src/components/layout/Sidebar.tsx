"use client";

import { shadowStore } from "@/lib/storage/store";
import {
  Bell,
  BookOpen,
  Calendar,
  Compass,
  FolderKanban,
  History,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

interface SidebarProps {
  onOpenQuickAdd: () => void;
}

export function Sidebar({ onOpenQuickAdd }: SidebarProps) {
  const pathname = usePathname();
  const [memoryCount, setMemoryCount] = useState(0);

  useEffect(() => {
    const update = () => {
      setMemoryCount(shadowStore.getMemories().length);
    };
    update();
    return shadowStore.subscribe(update);
  }, []);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/memories", label: "Memories", icon: History, count: memoryCount },
    { href: "/search", label: "Search & AI Chat", icon: Search },
    { href: "/timeline", label: "Timeline", icon: Calendar },
    { href: "/collections", label: "Collections", icon: FolderKanban },
    { href: "/reminders", label: "Reminders", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#222034] bg-[#0c0b14]/90 backdrop-blur-xl h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#201e30]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center border border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all">
            <span className="font-mono-retro font-bold text-white text-base tracking-tighter">Ψ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-retro font-bold text-base tracking-wider text-white">
                SHADOW
              </span>
              <span className="text-[10px] font-mono-retro px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-800/60">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium tracking-tight">Your life, remembered.</p>
          </div>
        </Link>
      </div>

      {/* System Status Pill */}
      <div className="px-5 py-2.5 bg-[#090810] border-b border-[#1b1928] flex items-center justify-between text-[11px] font-mono-retro text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400/90 font-medium">SYS: ONLINE</span>
        </span>
        <span className="text-purple-400/80">[GROUNDED]</span>
      </div>

      {/* Quick Add CTA */}
      <div className="p-4">
        <button
          onClick={onOpenQuickAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-[0_0_20px_rgba(147,51,234,0.35)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] border border-purple-400/30 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Capture Memory</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-purple-900/30 text-purple-200 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                  : "text-gray-400 hover:text-gray-100 hover:bg-[#161524] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-purple-400" : "text-gray-400 group-hover:text-purple-300"
                  }`}
                />
                <span>{link.label}</span>
              </div>
              {link.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono-retro ${
                    isActive
                      ? "bg-purple-800/60 text-purple-300"
                      : "bg-[#181628] text-gray-400 group-hover:text-gray-300"
                  }`}
                >
                  {link.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Footer */}
      <div className="p-4 border-t border-[#1e1c2e] bg-[#090810]/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center font-mono-retro text-xs font-semibold text-purple-300">
            KV
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-200 truncate">Kaelen Vance</p>
            <p className="text-[10px] text-gray-400 font-mono-retro truncate">archivist@shadow.ai</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-purple-500/80 shadow-[0_0_8px_#a855f7]" />
        </div>
      </div>
    </aside>
  );
}
