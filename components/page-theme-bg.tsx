"use client"

import * as React from "react"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
}

export function PageThemeBg({ className }: Props) {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 -z-10", className)}
    >
      {isBright ? (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-blue-50/90 to-sky-100/80" />
      ) : (
        <div className="absolute inset-0 bg-[#0a0a14]" />
      )}
      {/* Soft orbs similar to landing page */}
      <div className="absolute inset-0 overflow-hidden">
        {isBright ? (
          <>
            <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-sky-200/35 via-blue-200/25 to-transparent blur-3xl animate-hero-gradient-drift" />
            <div className="absolute right-1/4 top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-sky-200/25 blur-3xl animate-hero-gradient-drift" />
          </>
        ) : (
          <>
            <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl animate-hero-gradient-drift" />
            <div className="absolute right-1/4 top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-blue-500/8 blur-3xl animate-hero-gradient-drift" />
          </>
        )}
      </div>
    </div>
  )
}

