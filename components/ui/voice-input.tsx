"use client"

import * as React from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useClarteTheme } from "@/lib/clarte-theme-context"

export type VoiceInputStatus = "idle" | "connecting" | "active" | "ending"

export interface VoiceInputProps {
  status?: VoiceInputStatus
  onToggle?: () => void
  disabled?: boolean
  /** Remaining seconds for demo countdown (optional) */
  remainingSeconds?: number | null
  totalSeconds?: number
  className?: string
  caption?: string
}

export function VoiceInput({
  status = "idle",
  onToggle,
  disabled = false,
  remainingSeconds = null,
  totalSeconds = 300,
  className,
  caption,
}: VoiceInputProps) {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  const isActive = status === "active"
  const isConnecting = status === "connecting"
  const isEnding = status === "ending"
  const isBusy = isConnecting || isEnding

  const progress =
    remainingSeconds != null && totalSeconds > 0
      ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds))
      : null

  const mins = remainingSeconds != null ? Math.floor(remainingSeconds / 60) : 0
  const secs = remainingSeconds != null ? remainingSeconds % 60 : 0

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="relative flex items-center justify-center">
        {progress != null && isActive && (
          <svg
            className="absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] -rotate-90"
            viewBox="0 0 120 120"
            aria-hidden
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-white/10"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
              className="text-violet-400 transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
        )}

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled || isBusy || isEnding}
          aria-label={isActive ? "End voice session" : "Start voice session"}
          className={cn(
            "relative z-10 flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-full",
            "border border-white/20 bg-gradient-to-br from-violet-600/40 via-indigo-600/30 to-purple-900/50",
            isBright && "from-violet-500/50 via-indigo-400/40 to-purple-700/40 border-violet-300/30",
            "shadow-[0_0_60px_-12px_rgba(139,92,246,0.55)] backdrop-blur-xl",
            "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-60",
            isActive && "ring-2 ring-violet-400/50 ring-offset-2 ring-offset-transparent"
          )}
        >
          {isBusy ? (
            <Loader2 className="h-14 w-14 animate-spin text-white/90" />
          ) : isActive ? (
            <MicOff className="h-14 w-14 text-white/90" />
          ) : (
            <Mic className="h-14 w-14 text-white/90" />
          )}

          {isActive && (
            <span className="absolute inset-0 rounded-full animate-ping bg-violet-500/20" />
          )}
        </button>
      </div>

      {isActive && remainingSeconds != null && (
        <p className={cn("text-sm font-medium tabular-nums", isBright ? "text-violet-700" : "text-violet-300/90")}>
          {mins}:{secs.toString().padStart(2, "0")} remaining
        </p>
      )}

      <div className="flex h-8 items-end justify-center gap-1">
        {isActive
          ? Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-1 rounded-full animate-pulse",
                  isBright ? "bg-violet-600/80" : "bg-violet-400/80"
                )}
                style={{
                  height: `${12 + Math.sin(i * 0.8) * 8 + 8}px`,
                  animationDelay: `${i * 0.08}s`,
                  animationDuration: "0.9s",
                }}
              />
            ))
          : Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className={cn("h-2 w-1 rounded-full", isBright ? "bg-black/15" : "bg-white/15")} />
            ))}
      </div>

      <p className="max-w-sm text-center text-sm text-muted-foreground">
        {isConnecting
          ? "Connecting to Clarte…"
          : isEnding
            ? "Wrapping up your session…"
            : isActive
              ? "Tap to end · Clarte is listening"
              : "Tap the microphone to start a 5-minute demo"}
      </p>

      {caption && isActive && (
        <p className="max-w-md text-center text-xs text-foreground/70 line-clamp-2 px-4">{caption}</p>
      )}
    </div>
  )
}
