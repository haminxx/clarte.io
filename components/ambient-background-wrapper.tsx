"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AmbientBackground } from "@/components/ambient-background"

type AmbientBackgroundWrapperProps = {
  children?: React.ReactNode
  className?: string
  /** Optional: pass a custom class for the content wrapper (e.g. min-h-screen) */
  contentClassName?: string
}

/**
 * Reusable layout wrapper that applies the Clarte "Dark Mode Ambient Radial Glow"
 * background and renders content above it (z-index) for clear readability.
 * Use for any page that should match the main landing page background style.
 */
export function AmbientBackgroundWrapper({
  children,
  className,
  contentClassName,
}: AmbientBackgroundWrapperProps) {
  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Background: fixed behind content, non-interactive */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <AmbientBackground />
      </div>
      {/* Content sits clearly above the glow */}
      {children != null ? (
        <div className={cn("relative z-10", contentClassName)}>
          {children}
        </div>
      ) : null}
    </div>
  )
}
