"use client"

import { useState } from "react"
import { Play, Mic, Monitor, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CallMode } from "@/components/voice/Room"

const MODE_OPTIONS: { id: CallMode; icon: typeof Mic; label: string }[] = [
  { id: "voice-only", icon: Mic, label: "Voice only (Tier 1)" },
  { id: "voice-with-screen", icon: Monitor, label: "Screen share (Tier 2)" },
  { id: "voice-with-camera", icon: Video, label: "Camera (Tier 3)" },
]

interface VoiceCardProps {
  onStartCall?: (mode: CallMode) => void
  isActive?: boolean
}

export function VoiceCard({ onStartCall, isActive }: VoiceCardProps) {
  const [selectedMode, setSelectedMode] = useState<CallMode>("voice-only")

  const handleConnect = () => {
    if (onStartCall) {
      onStartCall(selectedMode)
    }
  }

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
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Call mode</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {MODE_OPTIONS.map(({ id, icon: Icon, label }) => (
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

        <div className="flex justify-end pt-2">
          <Button
            size="lg"
            className="h-12 px-6 rounded-full gap-2"
            onClick={handleConnect}
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
