"use client";

import {
  Bell,
  Calendar,
  FolderKanban,
  History,
  LayoutDashboard,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface MobileBottomNavProps {
  onOpenQuickAdd: () => void;
}

export function MobileBottomNav({ onOpenQuickAdd }: MobileBottomNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/memories", label: "Archive", icon: History },
    { href: "/search", label: "AI Search", icon: Search },
    { href: "/timeline", label: "Timeline", icon: Calendar },
    { href: "/reminders", label: "Remind", icon: Bell },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0b14]/95 backdrop-blur-lg border-t border-[#232135] px-2 py-1.5 flex items-center justify-around safe-bottom">
      {links.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
              isActive ? "text-purple-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* Floating Center Quick Add Button */}
      <button
        onClick={onOpenQuickAdd}
        aria-label="Capture new memory"
        className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border-2 border-purple-400/50 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {links.slice(2).map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
              isActive ? "text-purple-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
