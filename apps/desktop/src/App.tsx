import { useEffect, useState } from "react"
import { VoiceCard } from "./components/VoiceCard"
import { VoiceRoom } from "./components/VoiceRoom"
import { setupTray } from "./tauri-tray"

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL ?? ""
const VOICE_AGENT_URL = import.meta.env.VITE_VOICE_AGENT_URL ?? ""

export default function App() {
  const [inCall, setInCall] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState("cedar")

  useEffect(() => {
    if (typeof window !== "undefined" && "__TAURI__" in window) {
      setupTray().catch(console.warn)
    }
  }, [])

  const handleStartCall = () => setInCall(true)
  const handleDisconnect = () => setInCall(false)

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {inCall ? (
          <VoiceRoom
            livekitUrl={LIVEKIT_URL}
            voiceAgentUrl={VOICE_AGENT_URL}
            voice={selectedVoice}
            onDisconnect={handleDisconnect}
          />
        ) : (
          <VoiceCard
            selectedVoiceId={selectedVoice}
            onVoiceChange={setSelectedVoice}
            onStartCall={handleStartCall}
          />
        )}
      </div>
    </div>
  )
}
