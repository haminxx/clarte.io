"use client"

import { useState, useEffect } from "react"
import { VoiceCard } from "@/components/voice-card"

interface VoiceAgentCardProps {
  userId?: string | null
  getAuthToken?: () => Promise<string | null>
  onConversationSaved?: () => void
}

/**
 * Voice agent card for dashboard embedding.
 * Lazy-loads Room (LiveKit) only when user clicks Connect to avoid heavy initial bundle.
 */
export function VoiceAgentCard({ userId, getAuthToken, onConversationSaved }: VoiceAgentCardProps) {
  const [inCall, setInCall] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState("marin")
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ko">("en")
  const [Room, setRoom] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    if (inCall) {
      import("@/components/voice/Room").then((m) => setRoom(() => m.Room))
    } else {
      setRoom(null)
    }
  }, [inCall])

  const handleStartCall = () => setInCall(true)
  const handleDisconnect = () => setInCall(false)

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-4 sm:p-6">
      {inCall && Room ? (
        <Room
          mode="voice-only"
          voice={selectedVoice}
          language={selectedLanguage}
          autoStart
          onDisconnect={handleDisconnect}
          cardLayout
          selectedVoiceId={selectedVoice}
          onVoiceChange={setSelectedVoice}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          userId={userId}
          getAuthToken={getAuthToken}
          onConversationSaved={onConversationSaved}
        />
      ) : inCall ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      ) : (
        <VoiceCard
          onStartCall={handleStartCall}
          isActive={false}
          selectedVoiceId={selectedVoice}
          onVoiceChange={setSelectedVoice}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      )}
    </div>
  )
}
