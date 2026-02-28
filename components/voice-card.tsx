"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Voice name (UI) -> OpenAI voice ID. Marin = female, Cedar = male (both high-quality Realtime voices). */
export const VOICE_OPTIONS = [
  { name: "Marin", voiceId: "marin" },
  { name: "Cedar", voiceId: "cedar" },
] as const

export const LANGUAGE_OPTIONS = [
  { name: "EN", langId: "en" as const },
  { name: "KO", langId: "ko" as const },
] as const

interface VoiceCardProps {
  onStartCall?: () => void
  isActive?: boolean
  selectedVoiceId?: string
  onVoiceChange?: (voiceId: string) => void
  selectedLanguage?: "en" | "ko"
  onLanguageChange?: (lang: "en" | "ko") => void
}

export function VoiceCard({
  onStartCall,
  isActive,
  selectedVoiceId = "marin",
  onVoiceChange,
  selectedLanguage = "en",
  onLanguageChange,
}: VoiceCardProps) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-foreground/80">
          Welcome to Clarte — your Executive Assistant.
        </p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <div className={`h-2 w-2 rounded-full bg-emerald-400 ${isActive ? "animate-[clarte-pulse_1.5s_ease-in-out_infinite]" : ""}`} />
          <span className="text-sm text-muted-foreground">{isActive ? "Active" : "Ready"}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <div
              role="group"
              aria-label="Language selection"
              className="relative inline-flex rounded-full bg-muted/50 p-1 ring-1 ring-border/50 shadow-sm"
            >
              <span
                className="absolute inset-y-0 left-0 w-1/2 h-full rounded-full bg-primary shadow-md transition-transform duration-200 ease-out"
                style={{ transform: selectedLanguage === "ko" ? "translateX(100%)" : "translateX(0)" }}
              />
              {LANGUAGE_OPTIONS.map(({ name, langId }) => (
                <button
                  key={langId}
                  type="button"
                  onClick={() => onLanguageChange?.(langId)}
                  aria-pressed={selectedLanguage === langId}
                  aria-label={`Language: ${name}`}
                  className={cn(
                    "relative z-10 w-[52px] px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                    selectedLanguage === langId
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
            <div
              role="group"
              aria-label="Voice selection"
              className="relative inline-flex rounded-full bg-muted/50 p-1 ring-1 ring-border/50 shadow-sm"
            >
              <span
                className="absolute inset-y-0 left-0 w-1/2 h-full rounded-full bg-primary shadow-md transition-transform duration-200 ease-out"
                style={{ transform: selectedVoiceId === "cedar" ? "translateX(100%)" : "translateX(0)" }}
              />
              {VOICE_OPTIONS.map(({ name, voiceId }) => (
                <button
                  key={voiceId}
                  type="button"
                  onClick={() => onVoiceChange?.(voiceId)}
                  aria-pressed={selectedVoiceId === voiceId}
                  aria-label={`Voice: ${name}`}
                  className={cn(
                    "relative z-10 w-[72px] px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                    selectedVoiceId === voiceId
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <Button
            size="lg"
            className="h-12 px-6 rounded-full gap-2 ml-auto"
            onClick={() => onStartCall?.()}
            disabled={isActive}
          >
            <Play className="h-4 w-4" />
            Call Clarte
          </Button>
        </div>
      </div>
    </>
  )
}
