import { useCallback, useEffect, useState } from "react"
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant } from "@livekit/components-react"
interface VoiceRoomProps {
  livekitUrl: string
  voiceAgentUrl: string
  voice: string
  onDisconnect: () => void
}

async function getToken(
  baseUrl: string,
  voice: string
): Promise<{ token: string; room: string } | { error: string }> {
  const tokenUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/token` : "/api/token"
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voice, mode: "casual" }),
  })
  const raw = await res.text()
  if (!res.ok) return { error: raw || `Failed: ${res.status}` }
  const data = JSON.parse(raw) as { token?: string; room?: string }
  const token = data?.token ?? ""
  const room = data?.room ?? `room-${Date.now()}`
  if (!token) return { error: "Token is empty" }
  return { token, room }
}

function RoomInner({ onDisconnect }: { onDisconnect: () => void }) {
  const { localParticipant, isMicrophoneEnabled, microphoneTrack } = useLocalParticipant()

  useEffect(() => {
    if (microphoneTrack && !isMicrophoneEnabled) {
      localParticipant?.setMicrophoneEnabled(true).catch(console.warn)
    }
  }, [localParticipant, microphoneTrack, isMicrophoneEnabled])

  return (
    <div className="flex flex-col gap-4 p-4">
      <RoomAudioRenderer />
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--muted-foreground)]">
          {isMicrophoneEnabled ? "Mic on" : "Mic off"}
        </span>
        <button
          onClick={onDisconnect}
          className="flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.81-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.69-1.68-1.32-2.66-1.81-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
          </svg>
          End call
        </button>
      </div>
    </div>
  )
}

export function VoiceRoom({ livekitUrl, voiceAgentUrl, voice, onDisconnect }: VoiceRoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const startCall = useCallback(async () => {
    if (!livekitUrl) {
      setError("Set VITE_LIVEKIT_URL in .env")
      setStatus("error")
      return
    }
    setStatus("starting")
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
    } catch {
      setError("Microphone access required")
      setStatus("error")
      return
    }
    const result = await getToken(voiceAgentUrl, voice)
    if ("error" in result) {
      setError(result.error)
      setStatus("error")
      return
    }
    setToken(result.token)
    setRoomName(result.room)
    setStatus("active")
  }, [livekitUrl, voiceAgentUrl, voice])

  useEffect(() => {
    if (status === "idle" && livekitUrl) startCall()
  }, [status, livekitUrl, startCall])

  const disconnect = useCallback(() => {
    setToken(null)
    setRoomName(null)
    setStatus("idle")
    setError(null)
    onDisconnect()
  }, [onDisconnect])

  if (status === "active" && token && roomName) {
    return (
      <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
        <LiveKitRoom
          serverUrl={livekitUrl}
          token={token}
          connect={true}
          audio={true}
          video={false}
          onDisconnected={disconnect}
          onError={(err) => {
            setError(err?.message ?? "Connection error")
            setStatus("error")
          }}
        >
          <RoomInner onDisconnect={disconnect} />
        </LiveKitRoom>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
      <div className="flex flex-col items-center gap-4 py-6">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <p className="text-sm text-[var(--muted-foreground)]">
          {status === "starting" ? "Connecting…" : "Ready"}
        </p>
        <button
          onClick={disconnect}
          className="rounded-full bg-[var(--muted)] px-4 py-2 text-sm hover:bg-[var(--muted)]/80"
        >
          Back
        </button>
      </div>
    </div>
  )
}
