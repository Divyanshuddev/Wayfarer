"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ArrowRight, Compass, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
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

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Supabase auth failed:", err);
      }
    }

    // Direct access to dashboard
    router.push("/");
  };

  const handleGuestLogin = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#08080c] relative overflow-hidden text-gray-100 font-sans">
      {/* Subtle modern ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.12),rgba(8,8,12,0.98))]" />
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0c0b14]/90 border border-[#23203c] shadow-[0_8px_40px_rgba(0,0,0,0.6)] space-y-6 backdrop-blur-xl">
        {/* Logo and Tagline */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center border border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.35)]">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono-retro">
            WAYFARER
          </h1>
          <p className="text-xs text-gray-400">
            Real trips. Unfiltered pros & cons. Firsthand hotel intel.
          </p>
        </div>

        {/* Demo Fast Track Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-xs shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explore Community as Guest (Instant Access)</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </button>

        <div className="flex items-center gap-3 text-[11px] font-mono-retro text-gray-500">
          <div className="flex-1 h-px bg-[#201d32]" />
          <span>OR SIGN IN WITH EMAIL</span>
          <div className="flex-1 h-px bg-[#201d32]" />
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-xs text-rose-300 font-mono-retro">
            {errorMessage}
          </div>
        )}

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
                placeholder="traveler@wayfarer.com"
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
                className="text-sky-400 hover:text-sky-300 text-[11px] font-mono-retro transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
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
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#18162e] hover:bg-[#201d3a] text-sky-200 border border-sky-800/40 hover:border-sky-500/50 font-medium text-xs transition-all active:scale-[0.98]"
          >
            {isLoading ? "Signing in..." : "Sign In to Account"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-gray-400 font-mono-retro">
          <span>New to Wayfarer? </span>
          <Link href="/signup" className="text-sky-400 hover:text-sky-300 font-medium hover:underline">
            Create an Account →
          </Link>
        </div>
      </div>
    </div>
  );
}
