"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ArrowRight, Bot, Lock, Mail, ShieldCheck, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Supabase signup failed:", err);
      }
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#08080c] relative overflow-hidden text-gray-100 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.18),rgba(8,8,12,0.95))]" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#a855f7_1px,transparent_1px),linear-gradient(to_bottom,#a855f7_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0e0d18]/90 border border-purple-500/30 shadow-[0_0_50px_rgba(147,51,234,0.2)] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center border border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <span className="font-mono-retro font-bold text-white text-xl">Ψ</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-100 font-mono-retro">
            INITIALIZE VAULT
          </h1>
          <p className="text-xs text-gray-400 font-serif">
            Create your private, grounded digital memory archive.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-xs text-rose-300 font-mono-retro">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-gray-400 font-mono-retro mb-1">
              Your Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                placeholder="Kaelen Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#131122] border border-[#26233e] focus:border-purple-500/70 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-mono-retro mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                placeholder="archivist@shadow.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131122] border border-[#26233e] focus:border-purple-500/70 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-mono-retro mb-1">
              Vault Passphrase
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131122] border border-[#26233e] focus:border-purple-500/70 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all active:scale-[0.98]"
          >
            {isLoading ? "Provisioning..." : "Create Vault & Begin Archiving"}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-400 font-mono-retro">
          <span>Already have a vault? </span>
          <Link href="/login" className="text-purple-400 hover:underline">
            Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
}
