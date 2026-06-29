"use client"

import * as React from "react"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

/**
 * Theme-aware page background: clean white/blue (bright) or dark radial glow (dark).
 */
export function AmbientBackground({ className }: { className?: string }) {
  const { theme } = useClarteTheme()

  if (theme === "bright") {
    return (
      <div className={cn("absolute inset-0 overflow-hidden bg-[#FAFAFA]", className)} aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] via-[#F7FAFF] to-[#EEF4FF]/90" />
        <div
          className="absolute left-1/2 top-[-10%] h-[520px] w-[min(100%,920px)] -translate-x-1/2 rounded-full opacity-80"
          style={{
            background: "radial-gradient(circle, rgba(0,114,245,0.09) 0%, transparent 68%)",
            filter: "blur(48px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{ background: "linear-gradient(to top, rgba(250,250,250,0.95), transparent)" }}
        />
      </div>
    )
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute inset-0 bg-[#0A0A14]" />
      <div
        className="absolute left-1/2 top-1/2 h-[min(140vmax,1800px)] w-[min(140vmax,1800px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(circle at center, rgba(59,7,100,0.55) 0%, rgba(76,29,149,0.4) 20%, rgba(49,46,129,0.25) 45%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[280px] md:h-[400px]"
        style={{ background: "linear-gradient(to top, rgba(10,10,20,0.95) 0%, transparent 100%)" }}
      />
    </div>
  )
}
