"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  showWordmark = false,
  className = "",
}: LogoProps) {
  const dimensions = {
    sm: { box: "h-6 w-6", svg: 24, text: "text-xs", sub: "text-[10px]" },
    md: { box: "h-8 w-8", svg: 32, text: "text-sm", sub: "text-[11px]" },
    lg: { box: "h-10 w-10", svg: 40, text: "text-base", sub: "text-xs" },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Geometric Emblem */}
      <div
        className={`flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-sm shrink-0 ${dimensions.box}`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full p-1"
        >
          {/* Central Stem */}
          <path
            d="M16 25V9"
            stroke="#f4f4f5"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Base Anchor */}
          <path
            d="M11 25H21"
            stroke="#71717a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Dynamic Balance Beam */}
          <path
            d="M8 14L16 12L24 10"
            stroke="#f4f4f5"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Left Pan (Lex / Law) */}
          <path
            d="M8 14V19M5.5 19H10.5"
            stroke="#a1a1aa"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Right Pan (Trade / Market) */}
          <path
            d="M24 10V15M21.5 15H26.5"
            stroke="#a1a1aa"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Deterministic Fulcrum Node */}
          <circle cx="16" cy="12" r="2" fill="#10b981" />
        </svg>
      </div>

      {/* Optional Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1">
            <span className={`font-bold tracking-tight text-zinc-100 ${dimensions.text}`}>
              LexiTrade
            </span>
            <span className="font-mono text-[9px] font-semibold text-emerald-400">
              AI
            </span>
          </div>
          <span className={`font-mono text-zinc-500 mt-0.5 ${dimensions.sub}`}>
            Autonomous Practice Agent
          </span>
        </div>
      )}
    </div>
  );
}
