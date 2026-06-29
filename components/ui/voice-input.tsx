"use client"

import * as React from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type VoiceInputStatus = "idle" | "connecting" | "active" | "ending"

export interface VoiceInputProps {
  status?: VoiceInputStatus
  onToggle?: () => void
  disabled?: boolean
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
    <div className={cn("flex flex-col items-center gap-5", className)}>
      <div className="relative flex items-center justify-center">
        {progress != null && isActive && (
          <svg
            className="absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] -rotate-90"
            viewBox="0 0 120 120"
            aria-hidden
          >
            <circle cx="60" cy="60" r="54" fill="none" stroke="#EBEBEB" strokeWidth="3" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#0072F5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
        )}

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled || isBusy || isEnding}
          aria-label={isActive ? "End voice session" : "Start voice session"}
          className={cn(
            "relative z-10 flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center rounded-full",
            "border border-[#EBEBEB] bg-gradient-to-b from-white to-[#F5F8FF]",
            "shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,114,245,0.12)]",
            "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0072F5]",
            "disabled:cursor-not-allowed disabled:opacity-60",
            isActive && "ring-2 ring-[#0072F5]/30"
          )}
        >
          {isBusy ? (
            <Loader2 className="h-12 w-12 animate-spin text-[#0072F5]" />
          ) : isActive ? (
            <MicOff className="h-12 w-12 text-[#0072F5]" />
          ) : (
            <Mic className="h-12 w-12 text-[#0072F5]" />
          )}
        </button>
      </div>

      {isActive && remainingSeconds != null && (
        <p className="text-sm font-medium tabular-nums text-[#171717]">
          {mins}:{secs.toString().padStart(2, "0")} remaining
        </p>
      )}

      <div className="flex h-6 items-end justify-center gap-1">
        {isActive
          ? Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-[#0072F5]/70 animate-pulse"
                style={{
                  height: `${10 + Math.sin(i * 0.9) * 6 + 6}px`,
                  animationDelay: `${i * 0.08}s`,
                  animationDuration: "0.9s",
                }}
              />
            ))
          : Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="h-1.5 w-1 rounded-full bg-[#D4D4D4]" />
            ))}
      </div>

      <p className="max-w-xs text-center text-sm text-[#4D4D4D]">
        {isConnecting
          ? "Connecting to Clarte…"
          : isEnding
            ? "Wrapping up your session…"
            : isActive
              ? "Tap to end · Clarte is listening"
              : "Tap the microphone to start a 5-minute demo"}
      </p>

      {caption && isActive && (
        <p className="max-w-sm text-center text-xs text-[#8F8F8F] line-clamp-2 px-2">{caption}</p>
      )}
    </div>
  )
}
