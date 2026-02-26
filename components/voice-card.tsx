"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Voice name (UI) -> OpenAI voice ID. Marin = female, Cedar = male (both high-quality Realtime voices). */
export const VOICE_OPTIONS = [
  { name: "Marin", voiceId: "marin" },
  { name: "Cedar", voiceId: "cedar" },
] as const

interface VoiceCardProps {
  onStartCall?: () => void
  isActive?: boolean
  selectedVoiceId?: string
  onVoiceChange?: (voiceId: string) => void
}

export function VoiceCard({ onStartCall, isActive, selectedVoiceId = "cedar", onVoiceChange }: VoiceCardProps) {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-foreground/80">
          Welcome to Clarte — your Executive Assistant.
        </p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <div className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-emerald-400"}`} />
          <span className="text-sm text-muted-foreground">{isActive ? "Active" : "Ready"}</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Start with voice. Ask Clarte to see your screen or camera when you need it.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Voice:</span>
            <div
              role="group"
              aria-label="Voice selection"
              className="inline-flex rounded-full bg-muted/50 p-1 ring-1 ring-border/50 shadow-sm"
            >
              {VOICE_OPTIONS.map(({ name, voiceId }) => (
                <button
                  key={voiceId}
                  type="button"
                  onClick={() => onVoiceChange?.(voiceId)}
                  aria-pressed={selectedVoiceId === voiceId}
                  aria-label={`Voice: ${name}`}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    selectedVoiceId === voiceId
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <Button
            size="lg"
            className="h-12 px-6 rounded-full gap-2"
            onClick={() => onStartCall?.()}
            disabled={isActive}
          >
            <Play className="h-4 w-4" />
            Connect to Assistant
          </Button>
        </div>
      </div>
    </div>
  )
}
