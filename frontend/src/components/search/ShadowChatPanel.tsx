"use client";

import { shadowStore } from "@/lib/storage/store";
import { ChatMessage } from "@/types/database";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  CornerDownLeft,
  Loader2,
  Send,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { CitationBadge } from "./CitationBadge";

export function ShadowChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Greetings. I am Shadow, your digital memory assistant. I am bound by strict grounding: I will only answer using details explicitly recorded in your memories, and cite every record I reference.",
      timestamp: new Date().toISOString(),
      isGrounded: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const samplePrompts = [
    "Where did I have coffee with Alex and what was our thesis?",
    "What was Alain de Botton's insight on architecture?",
    "Tell me about my walk through Giou-ji temple in Kyoto",
    "Did I record anything about buying a motorcycle?",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const memories = shadowStore.getMemories();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          memories,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          timestamp: new Date().toISOString(),
          citations: data.citations || [],
          isGrounded: data.isGrounded,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error("Chat request failed");
      }
    } catch {
      // Local fallback grounded answer
      const searchResults = shadowStore.search(textToSend.trim());
      const relevant = searchResults.filter((r) => r.similarity >= 0.28);

      let content = "";
      let citations = undefined;

      if (relevant.length === 0) {
        content =
          "I could not find any saved memories or details in your archive regarding this question.";
      } else {
        const top = relevant[0].memory;
        content = `Based on your memory [Memory #${top.id}: "${top.title}"]: ${top.summary}\n\nFull excerpt:\n"${top.content.slice(0, 200)}..."`;
        citations = relevant.slice(0, 3).map((r) => ({
          memory_id: r.memory.id,
          title: r.memory.title,
          date: new Date(r.memory.memory_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          snippet: r.memory.summary || r.memory.content.slice(0, 100),
        }));
      }

      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
        citations,
        isGrounded: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-[650px] rounded-2xl bg-[#0c0b16] border border-purple-900/30 overflow-hidden shadow-2xl">
      {/* Chat Header with Strict Grounding Pill */}
      <div className="px-5 py-3.5 border-b border-[#201e32] bg-[#111020] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
              Shadow AI Memory Partner
            </h3>
            <p className="text-[10px] text-gray-400 font-mono-retro">
              Strictly grounded on your private vault
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[10px] font-mono-retro text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>ZERO FABRICATION RULE ACTIVE</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-purple-300 flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                  isUser
                    ? "bg-purple-900/40 text-purple-100 border border-purple-600/40 rounded-tr-none font-sans"
                    : "bg-[#141224] text-gray-200 border border-[#25223c] rounded-tl-none font-serif"
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>

                {/* Grounding Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-[#232038] space-y-1.5 not-sr-only">
                    <p className="text-[10px] font-mono-retro text-purple-400 uppercase tracking-wider">
                      Citations from your memory:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c) => (
                        <CitationBadge key={c.memory_id} citation={c} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-300 flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono-retro text-purple-400 p-3 bg-[#141224] rounded-xl border border-purple-900/30 w-fit">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Consulting your memory embeddings...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters (if conversation is fresh) */}
      {messages.length <= 2 && (
        <div className="px-5 py-2 bg-[#090812] border-t border-[#1d1b2e] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-mono-retro text-gray-400 flex-shrink-0">
            Suggested:
          </span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(p)}
              className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[#161426] hover:bg-purple-950/60 text-purple-300/80 hover:text-purple-200 border border-purple-900/40 text-[11px] font-mono-retro transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3 bg-[#0f0e1a] border-t border-[#201e32]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask Shadow about your memories (e.g. 'What was my espresso recipe?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="w-full bg-[#151426] border border-[#272440] focus:border-purple-500/60 rounded-xl pl-4 pr-12 py-3 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
