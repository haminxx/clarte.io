"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClarteTheme } from "@/lib/clarte-theme-context"

/** Voice persona options used to select Deepgram Aura voices on the backend. */
export const VOICE_OPTIONS = [
  { name: "Female", voiceId: "female" },
  { name: "Male", voiceId: "male" },
] as const

export const LANGUAGE_OPTIONS = [
  { name: "EN", langId: "en" as const },
  { name: "KO", langId: "ko" as const },
  { name: "ES", langId: "es" as const },
  { name: "Mandarin", langId: "zh" as const },
  { name: "日本語", langId: "ja" as const },
  { name: "हिन्दी", langId: "hi" as const },
] as const

type SupportedLanguage = "en" | "ko" | "es" | "zh" | "ja" | "hi"

interface VoiceCardProps {
  onStartCall?: () => void
  isActive?: boolean
  selectedVoiceId?: string
  onVoiceChange?: (voiceId: string) => void
  selectedLanguage?: SupportedLanguage
  onLanguageChange?: (lang: SupportedLanguage) => void
}

export function VoiceCard({
  onStartCall,
  isActive,
  selectedVoiceId = "female",
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
            <Select
              value={selectedLanguage}
              onValueChange={(value) => onLanguageChange?.(value as SupportedLanguage)}
            >
              <SelectTrigger className="w-[120px] rounded-full justify-between">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.langId} value={opt.langId}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedVoiceId}
              onValueChange={(value) => onVoiceChange?.(value)}
            >
              <SelectTrigger className="w-[140px] rounded-full justify-between">
                <SelectValue placeholder="Voice" />
              </SelectTrigger>
              <SelectContent>
                {VOICE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.voiceId} value={opt.voiceId}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
