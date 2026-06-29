"use client"

import dynamic from "next/dynamic"
import { AlertCircle } from "lucide-react"
import { VoiceInput, type VoiceInputStatus } from "@/components/ui/voice-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VOICE_OPTIONS } from "@/components/voice-card"
import { cn } from "@/lib/utils"

const Room = dynamic(() => import("@/components/voice/Room").then((m) => ({ default: m.Room })), {
  ssr: false,
})

interface DemoVoiceInputProps {
  voiceStatus: VoiceInputStatus
  onToggle: () => void
  remainingSeconds: number | null
  caption?: string
  selectedVoice: string
  onVoiceChange: (id: string) => void
  pickerDisabled?: boolean
  voiceError?: string | null
  onVoiceError?: (message: string | null) => void
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
  pickerDisabled = false,
  voiceError,
  onVoiceError,
  inCall,
  onRegisterDisconnect,
  onSessionConcluded,
  onTranscriptAdd,
  onTranscriptPartial,
  onConnectionActive,
}: DemoVoiceInputProps) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div
        className={cn(
          "w-full rounded-2xl border bg-white p-8 sm:p-10",
          "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_30px_rgba(0,0,0,0.04)]"
        )}
      >
        <VoiceInput
          status={voiceStatus}
          onToggle={onToggle}
          remainingSeconds={remainingSeconds}
          caption={caption}
          disabled={pickerDisabled && voiceStatus === "idle"}
          className="w-full"
        />
      </div>

      {voiceError && (
        <div
          role="alert"
          className="flex w-full max-w-md items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#991B1B]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{voiceError}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-[#4D4D4D]">Voice</span>
        <Select disabled={pickerDisabled} value={selectedVoice} onValueChange={onVoiceChange}>
          <SelectTrigger className="h-9 w-[148px] rounded-lg border-[#EBEBEB] bg-white text-sm shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
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
          language="en"
          autoStart
          demoMode
          variant="demo"
          selectedVoiceId={selectedVoice}
          onVoiceChange={onVoiceChange}
          selectedLanguage="en"
          onRegisterDisconnect={onRegisterDisconnect}
          onSessionConcluded={onSessionConcluded}
          onTranscriptAdd={onTranscriptAdd}
          onTranscriptPartial={onTranscriptPartial}
          onConnectionActive={onConnectionActive}
          onVoiceError={onVoiceError}
        />
      )}
    </div>
  )
}
