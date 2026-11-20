"use client";

import React from "react";

export function RetroGridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 24px dot-matrix background pattern */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" 
      />

      {/* Subtle retro vignette */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_0%,rgba(139,92,246,0.10),transparent_80%)]" 
      />

      {/* Ambient subtle neon purple glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
