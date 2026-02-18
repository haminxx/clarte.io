"use client"

import { useState } from "react"
import { Phone, BookOpen, Play, Monitor, Sparkles, HelpCircle, MessageSquare, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CallMode, TierPreset } from "@/components/voice/Room"

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
      {/* Welcome section - on top */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-foreground/80">
          Welcome to Clarte — your voice, reimagined.
        </p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <div className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-emerald-400"}`} />
          <span className="text-sm text-muted-foreground">{isActive ? "Active" : "Ready"}</span>
        </div>
      </div>

      {/* Call mode row */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Call mode</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant={selectedMode === "voice-only" ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 ${
              selectedMode === "voice-only"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-transparent text-foreground hover:bg-secondary"
            }`}
            onClick={() => setSelectedMode("voice-only")}
          >
            <Phone className="h-4 w-4" />
            Test a call
          </Button>
          <Button
            variant={selectedMode === "voice-with-screen" ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 ${
              selectedMode === "voice-with-screen"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-transparent text-foreground hover:bg-secondary"
            }`}
            onClick={() => setSelectedMode("voice-with-screen")}
          >
            <Monitor className="h-4 w-4" />
            Call with screen
          </Button>
          <Button
            variant={selectedMode === "narrate-only" ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 ${
              selectedMode === "narrate-only"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-transparent text-foreground hover:bg-secondary"
            }`}
            onClick={() => setSelectedMode("narrate-only")}
          >
            <BookOpen className="h-4 w-4" />
            Narrate an article
          </Button>
        </div>

        {/* Tier preset row */}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">Interaction style</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant={selectedTier === "auto" ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 ${
              selectedTier === "auto"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-transparent text-foreground hover:bg-secondary"
            }`}
            onClick={() => setSelectedTier("auto")}
          >
            <Sparkles className="h-4 w-4" />
            Auto
          </Button>
          <Button
            variant={selectedTier === "tier1" ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 ${
              selectedTier === "tier1"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-transparent text-foreground hover:bg-secondary"
            }`}
            onClick={() => setSelectedTier("tier1")}
          >
            <HelpCircle className="h-4 w-4" />
            Guide
          </Button>
          <Button
            variant={selectedTier === "tier2" ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 ${
              selectedTier === "tier2"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-transparent text-foreground hover:bg-secondary"
            }`}
            onClick={() => setSelectedTier("tier2")}
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </Button>
          <Button
            variant={selectedTier === "tier3" ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 ${
              selectedTier === "tier3"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-transparent text-foreground hover:bg-secondary"
            }`}
            onClick={() => setSelectedTier("tier3")}
          >
            <Lightbulb className="h-4 w-4" />
            Informative
          </Button>
        </div>
        
        {/* Play button */}
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
            title={selectedMode ? `Start ${selectedMode.replace("-", " ")}` : "Select call mode first"}
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
