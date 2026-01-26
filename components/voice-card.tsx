"use client"

import { Phone, BookOpen, Play, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceCardProps {
  onStartCall?: (withScreenShare?: boolean) => void
  isActive?: boolean
}

export function VoiceCard({ onStartCall, isActive }: VoiceCardProps) {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-md">
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

      {/* Action buttons section - on bottom */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-border bg-transparent text-foreground hover:bg-secondary"
          onClick={() => onStartCall?.(false)}
        >
          <Phone className="h-4 w-4" />
          Test a call
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-border bg-transparent text-foreground hover:bg-secondary"
          onClick={() => onStartCall?.(true)}
        >
          <Monitor className="h-4 w-4" />
          Call with screen
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-border bg-transparent text-foreground hover:bg-secondary"
        >
          <BookOpen className="h-4 w-4" />
          Narrate an article
        </Button>
        <Button
          size="icon"
          className="ml-auto h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => onStartCall?.(true)}
          title="Start call with screen sharing"
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
