"use client"

import dynamic from "next/dynamic"
import { VoiceInput, type VoiceInputStatus } from "@/components/ui/voice-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LANGUAGE_OPTIONS, VOICE_OPTIONS } from "@/components/voice-card"
import { cn } from "@/lib/utils"

const Room = dynamic(() => import("@/components/voice/Room").then((m) => ({ default: m.Room })), {
  ssr: false,
})

type SupportedLanguage = "en" | "ko" | "es" | "zh" | "ja" | "hi"

interface DemoVoiceInputProps {
  voiceStatus: VoiceInputStatus
  onToggle: () => void
  remainingSeconds: number | null
  caption?: string
  selectedVoice: string
  onVoiceChange: (id: string) => void
  selectedLanguage: SupportedLanguage
  onLanguageChange: (lang: SupportedLanguage) => void
  pickerDisabled?: boolean
  isBright?: boolean
  inCall: boolean
  onRegisterDisconnect: (fn: () => void) => void
  onSessionConcluded: () => void
  onTranscriptAdd: (role: string, content: string) => void
  onTranscriptPartial: (role: string, content: string) => void
  onConnectionActive: () => void
}

export function DemoVoiceInput({
  voiceStatus,
  onToggle,
  remainingSeconds,
  caption,
  selectedVoice,
  onVoiceChange,
  selectedLanguage,
  onLanguageChange,
  pickerDisabled = false,
  isBright = false,
  inCall,
  onRegisterDisconnect,
  onSessionConcluded,
  onTranscriptAdd,
  onTranscriptPartial,
  onConnectionActive,
}: DemoVoiceInputProps) {
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-8 scale-110 sm:scale-125">
      <VoiceInput
        status={voiceStatus}
        onToggle={onToggle}
        remainingSeconds={remainingSeconds}
        caption={caption}
        disabled={pickerDisabled && voiceStatus === "idle"}
        className="w-full"
      />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Select
          disabled={pickerDisabled}
          value={selectedLanguage}
          onValueChange={(v) => onLanguageChange(v as SupportedLanguage)}
        >
          <SelectTrigger className={cn("w-[130px] rounded-full", isBright ? "bg-white/80" : "bg-white/10")}>
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
          disabled={pickerDisabled}
          value={selectedVoice}
          onValueChange={onVoiceChange}
        >
          <SelectTrigger className={cn("w-[140px] rounded-full", isBright ? "bg-white/80" : "bg-white/10")}>
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

      {inCall && (
        <Room
          mode="voice-only"
          voice={selectedVoice}
          language={selectedLanguage}
          autoStart
          demoMode
          variant="demo"
          selectedVoiceId={selectedVoice}
          onVoiceChange={onVoiceChange}
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          onRegisterDisconnect={onRegisterDisconnect}
          onSessionConcluded={onSessionConcluded}
          onTranscriptAdd={onTranscriptAdd}
          onTranscriptPartial={onTranscriptPartial}
          onConnectionActive={onConnectionActive}
        />
      )}
    </div>
  )
}
