"use client";

import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { RetroGridBackground } from "@/components/layout/RetroGridBackground";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { ShareTripModal } from "@/components/trips/ShareTripModal";
import { authStore } from "@/lib/auth/auth-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Authentication Guard: require real user session
  useEffect(() => {
    const isAuthed = authStore.isAuthenticated() || isSupabaseConfigured();
    if (!isAuthed) {
      router.replace("/login");
    } else {
      setIsAuthChecking(false);
    }
  }, [router]);

  // Global ⌘K / Ctrl+K keyboard shortcut and custom event to open Share Trip modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsShareModalOpen((prev) => !prev);
      }
    };
    const handleOpenCustom = () => setIsShareModalOpen(true);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-share-trip", handleOpenCustom);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-share-trip", handleOpenCustom);
    };
  }, []);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080c] text-gray-400 font-mono-retro text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>Verifying traveler session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#08080c] text-gray-100 relative">
      <RetroGridBackground />

      {/* Desktop Sidebar wrapped in Suspense */}
      <Suspense fallback={<div className="w-64 hidden md:block bg-[#0c0b14]/90 border-r border-[#222034]" />}>
        <Sidebar onOpenQuickAdd={() => setIsShareModalOpen(true)} />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 pb-16 md:pb-6">
        <Suspense fallback={<div className="h-14 border-b border-[#201d32] bg-[#08080c]" />}>
          <TopHeader onOpenQuickAdd={() => setIsShareModalOpen(true)} />
        </Suspense>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Suspense fallback={<div className="p-8 text-center text-xs font-mono-retro text-gray-400">Loading travel intel...</div>}>
            {children}
          </Suspense>
        </main>
      </div>

      {/* Mobile Navigation wrapped in Suspense */}
      <Suspense fallback={null}>
        <MobileBottomNav onOpenQuickAdd={() => setIsShareModalOpen(true)} />
      </Suspense>

      {/* Share Trip Modal */}
      <ShareTripModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
