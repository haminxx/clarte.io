"use client"

import { useState } from "react"
import { Phone, Play, Monitor, Video, Sparkles, HelpCircle, MessageSquare, Lightbulb } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CallMode, TierPreset } from "@/components/voice/Room"

const CALL_OPTIONS: { id: "call" | "screenShare" | "camera"; icon: LucideIcon; label: string }[] = [
  { id: "call", icon: Phone, label: "Call" },
  { id: "screenShare", icon: Monitor, label: "Screen share" },
  { id: "camera", icon: Video, label: "Camera" },
]

const TIER_OPTIONS: { id: TierPreset; icon: LucideIcon; label: string }[] = [
  { id: "auto", icon: Sparkles, label: "Auto" },
  { id: "tier1", icon: HelpCircle, label: "Guide" },
  { id: "tier2", icon: MessageSquare, label: "Feedback" },
  { id: "tier3", icon: Lightbulb, label: "Informative" },
]

/** Derive CallMode from multi-select options. Call is required. */
function toCallMode(call: boolean, screenShare: boolean, camera: boolean): CallMode | null {
  if (!call) return null
  if (screenShare && camera) return "voice-with-screen-camera"
  if (screenShare) return "voice-with-screen"
  if (camera) return "voice-with-camera"
  return "voice-only"
}

interface VoiceCardProps {
  onStartCall?: (mode: CallMode, tier: TierPreset) => void
  isActive?: boolean
}

export function VoiceCard({ onStartCall, isActive }: VoiceCardProps) {
  const [call, setCall] = useState(true)
  const [screenShare, setScreenShare] = useState(false)
  const [camera, setCamera] = useState(false)
  const [selectedTier, setSelectedTier] = useState<TierPreset>("auto")

  const mode = toCallMode(call, screenShare, camera)
  const canStart = mode !== null

  const toggle = (id: "call" | "screenShare" | "camera") => {
    if (id === "call") setCall((c) => !c)
    else if (id === "screenShare") setScreenShare((s) => !s)
    else setCamera((c) => !c)
  }

  const handlePlay = () => {
    if (canStart && mode && onStartCall) {
      onStartCall(mode, selectedTier)
    }
  }

  const isSelected = (id: "call" | "screenShare" | "camera") => {
    if (id === "call") return call
    if (id === "screenShare") return screenShare
    return camera
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
          {CALL_OPTIONS.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={isSelected(id) ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-2 ${
                isSelected(id)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border bg-transparent text-foreground hover:bg-secondary"
              }`}
              onClick={() => toggle(id)}
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
              canStart
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            onClick={handlePlay}
            disabled={!canStart || isActive}
            title={canStart ? `Start ${mode?.replace(/-/g, " ") ?? ""}` : "Select Call to start"}
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
