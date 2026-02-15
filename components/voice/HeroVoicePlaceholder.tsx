"use client"

/**
 * Placeholder for the hero voice section. UI-only; no LiveKit or voice backend.
 * Replace with your voice/call UI when you add a new pipeline.
 */
import React from "react"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"

export function HeroVoicePlaceholder() {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-foreground/80 text-sm sm:text-base">
          Your voice experience — coming soon.
        </p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <span className="text-sm text-muted-foreground">Ready</span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 py-6">
        <div className="rounded-full bg-muted p-4">
          <Phone className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Connect a new voice pipeline to enable calls here.
        </p>
        <Button variant="outline" size="sm" className="pointer-events-none opacity-70" disabled>
          Start call (not configured)
        </Button>
      </div>
    </div>
  )
}
