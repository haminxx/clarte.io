"use client"

import { useState, useEffect } from "react"
import { VoiceCard } from "@/components/voice-card"

const LIVEKIT_URL_RAW = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? ""
/** Treat placeholder URLs (from CI when secrets missing) as not configured. */
const LIVEKIT_URL = !LIVEKIT_URL_RAW || LIVEKIT_URL_RAW.includes("placeholder") ? "" : LIVEKIT_URL_RAW

/** Use Vapi when LiveKit not configured; otherwise use Room (LiveKit) for full features. */
const useVapi = !LIVEKIT_URL

interface VoiceAgentCardProps {
  userId?: string | null
  userDisplayName?: string | null
  getAuthToken?: () => Promise<string | null>
  onConversationSaved?: () => void
}

/**
 * Voice agent card for dashboard embedding.
 * Voice-only: uses VapiRoom when LiveKit unset.
 * Otherwise lazy-loads Room (LiveKit) when user clicks Connect.
 */
export function VoiceAgentCard({ userId, userDisplayName, getAuthToken, onConversationSaved }: VoiceAgentCardProps) {
  const [inCall, setInCall] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState("marin")
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ko">("en")
  const [Room, setRoom] = useState<React.ComponentType<any> | null>(null)
  const [VapiRoom, setVapiRoom] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    if (!inCall) {
      setRoom(null)
      setVapiRoom(null)
      return
    }
    if (useVapi) {
      import("@/components/voice/VapiRoom").then((m) =>
        setVapiRoom(() => m.VapiRoom)
      )
    } else {
      import("@/components/voice/Room").then((m) => setRoom(() => m.Room))
    }
  }, [inCall])

  const handleStartCall = () => setInCall(true)
  const handleDisconnect = () => setInCall(false)

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-4 sm:p-6">
      {inCall && VapiRoom ? (
        <VapiRoom onDisconnect={handleDisconnect} autoStart cardLayout />
      ) : inCall && Room ? (
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
          userDisplayName={userDisplayName}
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
