"use client"

/**
 * Clarte Voice – LiveKit + Clarte agent.
 * Fetches token from VOICE_AGENT_URL/token (Render) when set, else /api/token (local Next.js).
 * Connects to LiveKit; agent joins and speaks.
 */
import React, { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Loader2, Phone } from "lucide-react"
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant, useParticipants, useRoomContext } from "@livekit/components-react"

/** Phase 2: Fail fast if LiveKit URL is not set (client env inlined at build). */
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? ""
const VOICE_AGENT_URL = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ""

/** OpenAI Realtime API voice options with gender labels for UI. */
const VOICE_OPTIONS = [
  { id: "marin", label: "Marin", gender: "Feminine" },
  { id: "shimmer", label: "Shimmer", gender: "Feminine" },
  { id: "coral", label: "Coral", gender: "Feminine" },
  { id: "sage", label: "Sage", gender: "Feminine" },
  { id: "echo", label: "Echo", gender: "Masculine" },
  { id: "ash", label: "Ash", gender: "Masculine" },
  { id: "cedar", label: "Cedar", gender: "Masculine" },
  { id: "verse", label: "Verse", gender: "Masculine" },
  { id: "ballad", label: "Ballad", gender: "Masculine" },
  { id: "alloy", label: "Alloy", gender: "Neutral" },
] as const
if (typeof window === "undefined" && !LIVEKIT_URL) {
  throw new Error("Missing NEXT_PUBLIC_LIVEKIT_URL")
}

/** Inner content so we can use useLocalParticipant inside LiveKitRoom. */
function RoomInner({ onDisconnect }: { onDisconnect: () => void }) {
  const { localParticipant, isMicrophoneEnabled, microphoneTrack } = useLocalParticipant()
  const participants = useParticipants()
  const room = useRoomContext()

  React.useEffect(() => {
    if (!localParticipant) return
    const enableMic = async () => {
      try {
        await localParticipant.setMicrophoneEnabled(true)
      } catch (e) {
        console.warn("[Clarte Voice] Mic enable failed:", e)
        // Retry once after short delay (timing can be off on connect)
        setTimeout(async () => {
          try {
            await localParticipant.setMicrophoneEnabled(true)
          } catch (e2) {
            console.warn("[Clarte Voice] Mic retry failed:", e2)
          }
        }, 500)
      }
    }
    enableMic()
  }, [localParticipant])

  // Diagnostic: log mic state and remote participants (agent)
  React.useEffect(() => {
    const remote = participants.filter((p) => p !== localParticipant)
    if (process.env.NODE_ENV === "development") {
      console.log("[Clarte Voice] Room state:", {
        isMicrophoneEnabled,
        hasMicTrack: !!microphoneTrack,
        remoteCount: remote.length,
        remoteIdentities: remote.map((p) => p.identity),
      })
    }
  }, [participants, localParticipant, isMicrophoneEnabled, microphoneTrack])

  React.useEffect(() => {
    if (!room) return
    const onTrackSubscribed = (track: unknown, publication: unknown, participant: { identity: string }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Clarte Voice] Track subscribed:", participant.identity, (track as { kind?: string })?.kind)
      }
    }
    room.on("trackSubscribed", onTrackSubscribed)
    return () => {
      room.off("trackSubscribed", onTrackSubscribed)
    }
  }, [room])

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <RoomAudioRenderer />
      <p className="text-sm text-muted-foreground">
        In call with Clarte {!isMicrophoneEnabled && "(mic off — check permissions)"}
      </p>
      <Button variant="outline" size="sm" onClick={onDisconnect} className="gap-2">
        <PhoneOff className="h-4 w-4" />
        End call
      </Button>
    </div>
  )
}

export function Room() {
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<string>("marin")

  const disconnect = useCallback(() => {
    setToken(null)
    setRoomName(null)
    setStatus("idle")
    setError(null)
  }, [])

  const startCall = useCallback(async () => {
    if (!LIVEKIT_URL) {
      setError("Voice is not configured. Set NEXT_PUBLIC_LIVEKIT_URL in your environment.")
      setStatus("error")
      return
    }
    setStatus("starting")
    setError(null)
    // Request microphone permission on user gesture so the browser prompts before we connect.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
    } catch (micErr) {
      console.error("[Clarte Voice] Microphone access denied or failed:", micErr)
      setError("Microphone access is required. Please allow microphone permission and try again.")
      setStatus("error")
      return
    }
    // Warm-up: ping health endpoint first to wake Render if sleeping (cold start)
    if (VOICE_AGENT_URL) {
      try {
        const healthUrl = VOICE_AGENT_URL.replace(/\/$/, "") + "/health"
        await fetch(healthUrl)
      } catch {
        // Ignore; token request will surface real errors
      }
    }

    const tokenUrl = VOICE_AGENT_URL
      ? `${VOICE_AGENT_URL.replace(/\/$/, "")}/token`
      : "/api/token"
    try {
      const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice: selectedVoice }),
      })
      const raw = await res.text()
      if (!res.ok) {
        let errMsg = raw || `Token request failed: ${res.status}`
        try {
          const parsed = JSON.parse(raw) as { error?: string; detail?: string }
          if (parsed?.error) errMsg = parsed.error
          else if (parsed?.detail) errMsg = parsed.detail
        } catch {
          // use raw
        }
        setError(errMsg)
        setStatus("error")
        return
      }
      let data: { token?: string; room?: string }
      try {
        data = JSON.parse(raw) as { token?: string; room?: string }
      } catch {
        setError("Invalid token response")
        setStatus("error")
        return
      }
      const receivedToken = data?.token ?? null
      const receivedRoom = data?.room ?? null
      if (!receivedToken || receivedToken.trim() === "") {
        setError("Token is empty")
        setStatus("error")
        return
      }
      setToken(receivedToken)
      setRoomName(receivedRoom ?? `room-${Date.now()}`)
      setStatus("active")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to get token"
      console.error("[Clarte Voice] Token fetch failed:", e)
      setError(message)
      setStatus("error")
    }
  }, [selectedVoice])

  const configured = Boolean(LIVEKIT_URL)

  if (status === "active" && token && roomName) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md mx-auto">
        <LiveKitRoom
          serverUrl={LIVEKIT_URL}
          token={token}
          connect={true}
          audio={true}
          video={false}
          onDisconnected={disconnect}
          onError={(err) => {
            setToken(null)
            setRoomName(null)
            setStatus("error")
            setError(err?.message ?? "Connection error")
          }}
          className="rounded-2xl overflow-hidden"
        >
          <RoomInner onDisconnect={disconnect} />
        </LiveKitRoom>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-foreground/80 text-sm sm:text-base">
          Your voice experience — ready when you are.
        </p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <span className="text-sm text-muted-foreground">
            {status === "starting" ? "Connecting…" : "Ready"}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 py-6">
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        <div className="w-full max-w-xs space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Voice
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {VOICE_OPTIONS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} ({v.gender})
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={startCall}
          disabled={!configured || status === "starting"}
          className="gap-2 h-12 px-6 rounded-full"
        >
          {status === "starting" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Phone className="h-5 w-5" />
          )}
          {status === "starting" ? "Connecting…" : "Start call"}
        </Button>
        {!configured && (
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Set NEXT_PUBLIC_LIVEKIT_URL. For hosted (Firebase), also set NEXT_PUBLIC_VOICE_AGENT_URL to your Render token server URL.
          </p>
        )}
      </div>
    </div>
  )
}
