"use client";

import { authStore } from "@/lib/auth/auth-store";
import { ArrowLeft, ArrowRight, Compass, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const result = authStore.signIn({ email, password });
    if (!result.success) {
      setErrorMessage(result.error || "Authentication failed.");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    router.push("/");
  };

  const handleDemoLogin = () => {
    authStore.signInDemo();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#08080c] relative overflow-hidden text-gray-100 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.12),rgba(8,8,12,0.98))]" />
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0c0b14]/90 border border-[#23203c] shadow-[0_8px_40px_rgba(0,0,0,0.6)] space-y-6 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block group">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center border border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.35)] group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono-retro">
            WAYFARER
          </h1>
          <p className="text-xs text-gray-400">
            Sign in to access community trips, hotel prices, and traveler advice.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 font-mono-retro animate-in fade-in duration-150">
            {errorMessage}
          </div>
        )}

        {/* 1-Click Demo Traveler Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-mono-retro text-sky-200 bg-sky-950/50 hover:bg-sky-900/60 border border-sky-700/50 hover:border-sky-400/60 transition-all shadow-[0_0_15px_rgba(56,189,248,0.15)] flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Explore as Verified Traveler (1-Click)</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#1e1c30] w-full" />
          <span className="bg-[#0c0b14] px-3 text-[10px] font-mono-retro text-gray-500 uppercase tracking-wider">
            or sign in with email
          </span>
          <div className="border-t border-[#1e1c30] w-full" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-gray-300 font-mono-retro mb-1.5 text-[11px]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131122] border border-[#25223c] focus:border-sky-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-gray-300 font-mono-retro text-[11px]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-mono-retro text-sky-400 hover:text-sky-300"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131122] border border-[#25223c] focus:border-sky-500 rounded-xl pl-9 pr-9 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-xs shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Verifying Credentials..." : "Sign In to Account"}
          </button>
        </form>

        {/* Footer */}
        <div className="space-y-3 pt-2 text-center text-xs text-gray-400 font-mono-retro border-t border-[#1a182c]">
          <div>
            <span>Don't have an account yet? </span>
            <Link href="/signup" className="text-sky-400 hover:text-sky-300 font-medium hover:underline">
              Create an Account →
            </Link>
          </div>
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-3 h-3" />
              <span>Browse Community Trips Without Signing In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
