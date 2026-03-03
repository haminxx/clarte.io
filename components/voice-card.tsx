"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollPicker, type ScrollPickerOption } from "@/components/ui/scroll-picker"
import { useClarteTheme } from "@/lib/clarte-theme-context"

/** Voice name (UI) -> OpenAI voice ID. Marin = female, Cedar = male (both high-quality Realtime voices). */
export const VOICE_OPTIONS = [
  { name: "Marin", voiceId: "marin" },
  { name: "Cedar", voiceId: "cedar" },
] as const

export const LANGUAGE_OPTIONS = [
  { name: "EN", langId: "en" as const },
  { name: "KO", langId: "ko" as const },
] as const

export const LANGUAGE_PICKER_OPTIONS: ScrollPickerOption[] = LANGUAGE_OPTIONS.map((o) => ({
  id: o.langId,
  label: o.name,
}))

export const VOICE_PICKER_OPTIONS: ScrollPickerOption[] = VOICE_OPTIONS.map((o) => ({
  id: o.voiceId,
  label: o.name,
}))

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
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-foreground/80">
          Welcome to Clarte — your Executive Assistant.
        </p>
        <div
          className={
            isBright
              ? "flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5"
              : "flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5"
          }
        >
          <div className={`h-2 w-2 rounded-full bg-emerald-400 ${isActive ? "animate-[clarte-pulse_1.5s_ease-in-out_infinite]" : ""}`} />
          <span
            className={
              isBright ? "text-sm text-black/60" : "text-sm text-muted-foreground"
            }
          >
            {isActive ? "Active" : "Ready"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <ScrollPicker
              options={LANGUAGE_PICKER_OPTIONS}
              value={selectedLanguage}
              onChange={(id) => onLanguageChange?.(id as "en" | "ko")}
              placeholder="Language"
            />
            <ScrollPicker
              options={VOICE_PICKER_OPTIONS}
              value={selectedVoiceId}
              onChange={(id) => onVoiceChange?.(id)}
              placeholder="Voice"
            />
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
