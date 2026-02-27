"use client"

import { useState } from "react"
import { Room } from "@/components/voice/Room"
import { VoiceCard } from "@/components/voice-card"

/**
 * Voice agent card for dashboard embedding.
 * Reuses VoiceCard + Room from the landing page hero.
 */
export function VoiceAgentCard() {
  const [inCall, setInCall] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState("marin")
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ko">("en")

  const handleStartCall = () => setInCall(true)
  const handleDisconnect = () => setInCall(false)

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-4 sm:p-6">
      {inCall ? (
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
        />
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
