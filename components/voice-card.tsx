"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** Voice name (UI) -> OpenAI voice ID. Sage = female, Cedar = male. */
export const VOICE_OPTIONS = [
  { name: "Sage", voiceId: "shimmer" },
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Voice:</span>
            <ToggleGroup
              type="single"
              value={selectedVoiceId}
              onValueChange={(v) => v && onVoiceChange?.(v)}
              variant="outline"
              size="sm"
            >
              {VOICE_OPTIONS.map(({ name, voiceId }) => (
                <ToggleGroupItem key={voiceId} value={voiceId} aria-label={`Voice: ${name}`}>
                  {name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
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
