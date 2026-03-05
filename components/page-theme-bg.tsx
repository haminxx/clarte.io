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
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-blue-50/90 to-sky-100/80" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] md:h-[900px] md:w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-sky-200/40 via-blue-200/30 to-sky-100/20 blur-3xl animate-hero-gradient-drift" />
            <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-sky-200/30 blur-3xl animate-hero-gradient-drift" />
            <div className="absolute left-1/4 bottom-1/3 h-[250px] w-[250px] md:h-[400px] md:w-[400px] rounded-full bg-blue-200/20 blur-3xl animate-hero-gradient-drift" />
            <div className="absolute bottom-0 left-0 right-0 h-[250px] md:h-[400px] bg-gradient-to-t from-sky-200/40 via-blue-100/30 to-transparent" />
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] md:h-[900px] md:w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/25 via-indigo-600/15 to-transparent blur-3xl animate-hero-gradient-drift" />
            <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-blue-500/10 blur-3xl animate-hero-gradient-drift" />
            <div className="absolute left-1/4 bottom-1/3 h-[250px] w-[250px] md:h-[400px] md:w-[400px] rounded-full bg-indigo-600/10 blur-3xl animate-hero-gradient-drift" />
            <div className="absolute bottom-0 left-0 right-0 h-[250px] md:h-[400px] bg-gradient-to-t from-blue-900/30 via-indigo-900/10 to-transparent" />
          </div>
        </>
      )}
    </div>
  )
}

