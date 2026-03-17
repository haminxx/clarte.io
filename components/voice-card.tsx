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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

/** Deepgram Aura-2 voice options exposed on the demo page. */
export const VOICE_OPTIONS = [
  { name: "Thalia", voiceId: "aura-2-thalia-en" },
  { name: "Andromeda", voiceId: "aura-2-andromeda-en" },
  { name: "Helena", voiceId: "aura-2-helena-en" },
  { name: "Apollo", voiceId: "aura-2-apollo-en" },
  { name: "Arcas", voiceId: "aura-2-arcas-en" },
] as const

export const LANGUAGE_OPTIONS = [
  { name: "English", langId: "en" as const },
  { name: "한국어", langId: "ko" as const },
  { name: "Español", langId: "es" as const },
  { name: "中文 (Mandarin)", langId: "zh" as const },
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
  /** Languages to show in the selector. Defaults to English only for demo. */
  languagesEnabled?: SupportedLanguage[]
  /** When true, hide voice selector. Demo uses fixed agent config. */
  hideAgentOptions?: boolean
  /** When true, show all languages in dropdown but only English is selectable (others greyed). */
  showAllLanguagesGreyed?: boolean
  /** ASL toggle: enabled state */
  aslEnabled?: boolean
  /** ASL toggle: change handler */
  onAslChange?: (enabled: boolean) => void
  /** ASL toggle: status for tooltip (e.g. "ready", "connecting") */
  aslStatus?: "disconnected" | "connecting" | "ready"
}

export function VoiceCard({
  onStartCall,
  isActive,
  selectedVoiceId = "aura-2-thalia-en",
  onVoiceChange,
  selectedLanguage = "en",
  onLanguageChange,
  languagesEnabled = ["en"],
  hideAgentOptions = false,
  showAllLanguagesGreyed = false,
  aslEnabled = false,
  onAslChange,
  aslStatus,
}: VoiceCardProps) {
  const languageOptions = showAllLanguagesGreyed
    ? LANGUAGE_OPTIONS
    : LANGUAGE_OPTIONS.filter((opt) => languagesEnabled.includes(opt.langId))
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  const showLanguage = hideAgentOptions ? showAllLanguagesGreyed : !hideAgentOptions
  const showVoice = !hideAgentOptions

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
        <div className={cn("flex flex-wrap items-center gap-3 pt-2", hideAgentOptions && !showLanguage ? "justify-center" : "justify-between")}>
          {(showLanguage || showVoice) && (
            <div className="flex items-center gap-3 flex-wrap">
              {showLanguage && (
                <Select
                  value={selectedLanguage}
                  onValueChange={(value) => onLanguageChange?.(value as SupportedLanguage)}
                >
                  <SelectTrigger className="w-fit min-w-[5rem] max-w-[9rem] rounded-full justify-between px-3 py-1.5 text-sm" aria-label="Language">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((opt) => (
                      <SelectItem
                        key={opt.langId}
                        value={opt.langId}
                        disabled={showAllLanguagesGreyed && opt.langId !== "en"}
                        className={showAllLanguagesGreyed && opt.langId !== "en" ? "opacity-50" : undefined}
                      >
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {showVoice && (
                <Select
                  value={selectedVoiceId}
                  onValueChange={(value) => onVoiceChange?.(value)}
                >
                  <SelectTrigger className="w-fit min-w-[5rem] max-w-[9rem] rounded-full justify-between px-3 py-1.5 text-sm" aria-label="Voice">
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
              )}
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="lg"
              className="h-12 px-6 rounded-full gap-2"
              onClick={() => onStartCall?.()}
              disabled={isActive}
            >
              <Play className="h-4 w-4" />
              Call Clarte
            </Button>
            {onAslChange !== undefined && (
              <div className="flex items-center gap-2" title={aslStatus === "ready" ? "ASL ready" : aslStatus === "connecting" ? "Connecting..." : "Start ASL server"}>
                <Switch
                  id="asl-toggle"
                  checked={aslEnabled}
                  onCheckedChange={onAslChange}
                  aria-label="Enable ASL sign language input"
                />
                <Label htmlFor="asl-toggle" className="text-sm font-medium cursor-pointer">
                  ASL
                </Label>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
