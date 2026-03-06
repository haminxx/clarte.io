"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Shared ambient background visual: dark black base with centered
 * radial glow (blues with subtle purple, heavy blur). Used by PageThemeBg and
 * AmbientBackgroundWrapper so all pages share the same "Dark Mode Ambient
 * Radial Glow" style.
 */
export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
      {/* Base: very dark black */}
      <div className="absolute inset-0 bg-[#0A0A14]" />

      {/* Centered soft radial gradient — blue with subtle purple fading to transparent */}
      <div
        className="absolute left-1/2 top-1/2 h-[min(140vmax,1800px)] w-[min(140vmax,1800px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(circle at center, rgba(30,58,138,0.5) 0%, rgba(37,99,235,0.35) 20%, rgba(67,56,202,0.2) 45%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Secondary orb for depth — subtle drift animation */}
      <div
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] md:h-[900px] md:w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-hero-gradient-drift opacity-80"
        style={{
          background: "radial-gradient(circle, rgba(30,58,138,0.3) 0%, rgba(67,56,202,0.12) 50%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Accent orbs — blue with subtle purple */}
      <div
        className="absolute right-1/4 top-1/3 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full animate-hero-gradient-drift opacity-70"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 65%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="absolute left-1/4 bottom-1/3 h-[250px] w-[250px] md:h-[400px] md:w-[400px] rounded-full animate-hero-gradient-drift opacity-70"
        style={{
          background: "radial-gradient(circle, rgba(67,56,202,0.2) 0%, transparent 65%)",
          filter: "blur(100px)",
        }}
      />

      {/* Bottom gradient fade for continuity */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[280px] md:h-[400px]"
        style={{
          background: "linear-gradient(to top, rgba(10,10,20,0.95) 0%, transparent 100%)",
        }}
      />
    </div>
  )
}
