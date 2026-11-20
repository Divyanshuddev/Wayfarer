"use client";

import { ArrowLeft, CheckCircle2, Compass, Mail, Send } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    // Simulate instant recovery email dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#08080c] relative overflow-hidden text-gray-100 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.12),rgba(8,8,12,0.98))]" />
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0c0b14]/90 border border-[#23203c] shadow-[0_8px_40px_rgba(0,0,0,0.6)] space-y-6 backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center border border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.35)]">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono-retro">
            RESET PASSWORD
          </h1>
          <p className="text-xs text-gray-400">
            Enter your email to receive password recovery instructions.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-center space-y-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="font-semibold text-sm text-gray-100">Recovery Link Sent</h3>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              We have dispatched a reset link to <span className="font-mono-retro font-bold text-white">{email}</span>. Please check your inbox.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-mono-retro text-sky-400 hover:text-sky-300 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
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

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-xs shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isLoading ? "Sending Link..." : "Send Reset Link"}</span>
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-mono-retro text-gray-400 hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
