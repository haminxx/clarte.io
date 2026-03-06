"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AmbientBackground } from "@/components/ambient-background"

type Props = {
  className?: string
}

/**
 * Full-page ambient background layer (Dark Mode Ambient Radial Glow).
 * Applied globally: every page that renders this component gets the same gradient.
 * Renders behind page content; ensure content has relative z-10 so it sits above.
 * For a layout that wraps children, use AmbientBackgroundWrapper instead.
 */
export function PageThemeBg({ className }: Props) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 -z-10", className)}
    >
      <AmbientBackground />
    </div>
  )
}
