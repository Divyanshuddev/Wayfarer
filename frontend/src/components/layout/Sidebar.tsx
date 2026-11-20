"use client";

import { authStore } from "@/lib/auth/auth-store";
import { tripStore } from "@/lib/storage/trip-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Bell,
  Clock,
  Compass,
  FolderHeart,
  Globe,
  LogIn,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface SidebarProps {
  onOpenQuickAdd: () => void;
}

export function Sidebar({ onOpenQuickAdd }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [tripCount, setTripCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const update = () => {
      setTripCount(tripStore.getTrips().length);
      setQuestionCount(tripStore.getQuestions().length);
      setCurrentUser(authStore.getCurrentUser());
    };
    update();
    const unsubTrips = tripStore.subscribe(update);
    const unsubAuth = authStore.subscribe(update);
    return () => {
      unsubTrips();
      unsubAuth();
    };
  }, []);

  const handleLogout = async () => {
    authStore.signOut();
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase sign out error:", err);
      }
    }
    setShowLogoutModal(false);
    router.push("/login");
  };

  interface NavItem {
    href: string;
    label: string;
    icon: any;
    count?: number;
    badge?: string;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: "COMMUNITY",
      items: [
        { href: "/", label: "Explore & Trending", icon: Compass },
        { href: "/trips", label: "All Trips & Reviews", icon: Globe, count: tripCount },
        { href: "/qa", label: "Traveler Q&A Hub", icon: MessageSquare, count: questionCount, badge: "Hotel Q&A" },
      ],
    },
    {
      title: "DISCOVER",
      items: [
        { href: "/collections", label: "Curated Collections", icon: FolderHeart },
        { href: "/timeline", label: "Travel Timeline", icon: Clock },
        { href: "/reminders", label: "Booking Alerts", icon: Bell, badge: "Alerts" },
        { href: "/search", label: "Search Destinations", icon: Search, badge: "⌘F" },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { href: "/settings", label: "Profile & Preferences", icon: Settings },
      ],
    },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 border-r border-[#222036] bg-[#0c0b14]/95 backdrop-blur-xl h-screen sticky top-0 z-40 select-none overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#201e32]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.4)] group-hover:shadow-[0_0_20px_rgba(56,189,248,0.6)] transition-all flex-shrink-0">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono-retro font-bold text-base tracking-wider text-white">
                  WAYFARER
                </span>
                <span className="text-[10px] font-mono-retro px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800/60">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-[#8E8AA6] font-medium tracking-tight truncate">
                Real trips. Firsthand hotel intel.
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Share CTA Button */}
        <div className="p-3">
          <button
            onClick={onOpenQuickAdd}
            className="w-full flex items-center justify-between py-2 px-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-xs transition-all shadow-[0_0_18px_rgba(56,189,248,0.3)] hover:shadow-[0_0_24px_rgba(56,189,248,0.5)] border border-sky-400/30 active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
              <span>Share Trip & Tips</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono-retro bg-sky-950/80 rounded border border-sky-400/30 text-sky-200">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 px-3 py-1 space-y-4 overflow-y-auto custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-mono-retro font-semibold tracking-wider text-[#5C5873] uppercase">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? "bg-sky-950/40 text-sky-200 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.15)]"
                          : "text-[#8E8AA6] hover:text-[#F4F3F8] hover:bg-[#161524] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? "text-sky-400"
                              : "text-[#8E8AA6] group-hover:text-sky-300"
                          }`}
                        />
                        <span>{link.label}</span>
                      </div>
                      {link.count !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-retro ${
                            isActive
                              ? "bg-sky-800/60 text-sky-300"
                              : "bg-[#181628] text-[#8E8AA6] group-hover:text-gray-300"
                          }`}
                        >
                          {link.count}
                        </span>
                      )}
                      {link.badge && link.count === undefined && (
                        <span className="text-[9px] font-mono-retro text-sky-400/80 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Profile & Log Out Footer */}
        <div className="p-3 border-t border-[#1e1c2e] bg-[#090810]/80 space-y-2">
          {/* User Profile Info Card */}
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-[#12111D] border border-[#201e30]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 border border-sky-400/40 flex items-center justify-center font-mono-retro text-[11px] font-semibold text-white flex-shrink-0">
              {currentUser?.full_name ? currentUser.full_name.slice(0, 2).toUpperCase() : "WT"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">
                {currentUser?.full_name || "Wayfarer Traveler"}
              </p>
              <p className="text-[10px] text-gray-400 font-mono-retro truncate">
                {currentUser?.email || "Guest Explorer"}
              </p>
            </div>
            {currentUser ? (
              <span className="text-[9px] font-mono-retro text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/40">
                MEMBER
              </span>
            ) : (
              <Link
                href="/login"
                className="text-[9px] font-mono-retro text-sky-300 bg-sky-950 hover:bg-sky-900 px-1.5 py-0.5 rounded border border-sky-700/60 transition-colors"
              >
                SIGN IN
              </Link>
            )}
          </div>

          {/* Action Button: Sign Out if authed, or Sign In button if guest */}
          {currentUser ? (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono-retro text-red-400/80 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Session</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono-retro text-sky-400/90 hover:text-sky-300 hover:bg-sky-950/40 border border-sky-900/30 hover:border-sky-700/50 transition-all active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Join</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Log Out Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#0E0D18] border border-[#2E2A44] p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F4F3F8]">
                  Sign Out of Wayfarer
                </h3>
                <p className="text-xs text-[#8E8AA6]">
                  Are you sure you want to end your traveler session?
                </p>
              </div>
            </div>

            <p className="text-xs text-[#8E8AA6] bg-[#141224] p-3 rounded-xl border border-[#252238] font-mono-retro text-[11px]">
              Your saved trips, reviews, and hotel answers are safely preserved in the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#8E8AA6] hover:text-[#F4F3F8] hover:bg-[#191926] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.35)] transition-all"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
