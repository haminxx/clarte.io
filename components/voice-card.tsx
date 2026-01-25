"use client"

import { Phone, FileText, BookOpen, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceCardProps {
  onStartCall?: () => void
  isActive?: boolean
}

export function VoiceCard({ onStartCall, isActive }: VoiceCardProps) {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#2a2a2a]/90 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-white/80">
          Welcome to Clarte — your voice, reimagined.
        </p>
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
          <div className={`h-2 w-2 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-green-400"}`} />
          <span className="text-sm text-white/70">Jane</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={onStartCall}
        >
          <Phone className="h-4 w-4" />
          Test a call
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-white/20 bg-transparent text-white hover:bg-white/10"
        >
          <FileText className="h-4 w-4" />
          Create a voice line
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-white/20 bg-transparent text-white hover:bg-white/10"
        >
          <BookOpen className="h-4 w-4" />
          Narrate an article
        </Button>
        <Button
          size="icon"
          className="ml-auto h-10 w-10 rounded-full bg-white text-black hover:bg-white/90"
          onClick={onStartCall}
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
