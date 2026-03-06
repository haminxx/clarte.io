"use client"

import * as React from "react"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
}

/**
 * Full-page theme-aware background layer.
 * Bright: white + light blue gradient. Dark: black + blue with subtle purple.
 * Renders behind page content; ensure content has relative z-10 so it sits above.
 */
export function PageThemeBg({ className }: Props) {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 -z-10", className)}
    >
      {isBright ? (
        <div className="absolute inset-0 bg-gradient-to-b from-white via-sky-50/90 to-blue-50/80" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a14] via-[#0c0f1a] to-[#0a0a14]" />
      )}
      {/* Soft orbs similar to landing page */}
      <div className="absolute inset-0 overflow-hidden">
        {isBright ? (
          <>
            <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-sky-200/40 via-blue-200/30 to-transparent blur-3xl animate-hero-gradient-drift" />
            <div className="absolute right-1/4 top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-sky-200/30 blur-3xl animate-hero-gradient-drift" />
          </>
        ) : (
          <>
            <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/20 via-blue-500/12 to-transparent blur-3xl animate-hero-gradient-drift" />
            <div className="absolute right-1/4 top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl animate-hero-gradient-drift" />
          </>
        )}
      </div>
    </div>
  )
}
