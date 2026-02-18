"use client"

import { useState } from "react"
import { Phone, Play, Monitor, Video, Sparkles, HelpCircle, MessageSquare, Lightbulb } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CallMode, TierPreset } from "@/components/voice/Room"

const CALL_MODES: { id: CallMode; icon: LucideIcon; label: string }[] = [
  { id: "voice-only", icon: Phone, label: "Call only" },
  { id: "voice-with-screen", icon: Monitor, label: "Call + screen" },
  { id: "voice-with-screen-camera", icon: Video, label: "Call + screen + camera" },
]

const TIER_OPTIONS: { id: TierPreset; icon: LucideIcon; label: string }[] = [
  { id: "auto", icon: Sparkles, label: "Auto" },
  { id: "tier1", icon: HelpCircle, label: "Guide" },
  { id: "tier2", icon: MessageSquare, label: "Feedback" },
  { id: "tier3", icon: Lightbulb, label: "Informative" },
]

interface VoiceCardProps {
  onStartCall?: (mode: CallMode, tier: TierPreset) => void
  isActive?: boolean
}

export function VoiceCard({ onStartCall, isActive }: VoiceCardProps) {
  const [selectedMode, setSelectedMode] = useState<CallMode | null>(null)
  const [selectedTier, setSelectedTier] = useState<TierPreset>("auto")

  const handlePlay = () => {
    if (selectedMode && onStartCall) {
      onStartCall(selectedMode, selectedTier)
    }
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-foreground/80">
          Welcome to Clarte — your voice, reimagined.
        </p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <div className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-emerald-400"}`} />
          <span className="text-sm text-muted-foreground">{isActive ? "Active" : "Ready"}</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Call mode</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {CALL_MODES.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={selectedMode === id ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-2 ${
                selectedMode === id
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border bg-transparent text-foreground hover:bg-secondary"
              }`}
              onClick={() => setSelectedMode(id)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">Interaction style</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {TIER_OPTIONS.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={selectedTier === id ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-2 ${
                selectedTier === id
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border bg-transparent text-foreground hover:bg-secondary"
              }`}
              onClick={() => setSelectedTier(id)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            size="icon"
            className={`h-10 w-10 rounded-full ${
              selectedMode
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            onClick={handlePlay}
            disabled={!selectedMode || isActive}
            title={selectedMode ? `Start ${selectedMode.replace(/-/g, " ")}` : "Select call mode first"}
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
