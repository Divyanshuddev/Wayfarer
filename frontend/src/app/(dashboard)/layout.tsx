"use client";

import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { RetroGridBackground } from "@/components/layout/RetroGridBackground";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { QuickAddModal } from "@/components/memories/QuickAddModal";
import React, { Suspense, useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Global ⌘K / Ctrl+K keyboard shortcut to open Quick Add
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsQuickAddOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex bg-[#08080c] text-gray-100 relative">
      <RetroGridBackground />

      {/* Desktop Sidebar wrapped in Suspense */}
      <Suspense fallback={<div className="w-64 hidden md:block bg-[#0c0b14]/90 border-r border-[#222034]" />}>
        <Sidebar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 pb-16 md:pb-6">
        <Suspense fallback={<div className="h-14 border-b border-[#1f1d2e] bg-[#08080c]" />}>
          <TopHeader onOpenQuickAdd={() => setIsQuickAddOpen(true)} />
        </Suspense>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Suspense fallback={<div className="p-8 text-center text-xs font-mono-retro text-gray-400">Loading view...</div>}>
            {children}
          </Suspense>
        </main>
      </div>

      {/* Mobile Navigation wrapped in Suspense */}
      <Suspense fallback={null}>
        <MobileBottomNav onOpenQuickAdd={() => setIsQuickAddOpen(true)} />
      </Suspense>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
}
