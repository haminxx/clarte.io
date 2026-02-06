"use client"

/**
 * Clarte Voice – LiveKit + Speech-First Agent
 * Fetches token from voice-agent token server, connects to LiveKit, agent joins and handles voice + tools.
 */
import React, { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Loader2 } from "lucide-react"
import { LiveKitRoom, RoomAudioRenderer, TrackToggle } from "@livekit/components-react"
import { Track } from "livekit-client"

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? ""
const VOICE_AGENT_URL = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ""

export function Room() {
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const disconnect = useCallback(() => {
    setToken(null)
    setRoomName(null)
    setStatus("idle")
    setError(null)
  }, [])

  const startCall = useCallback(async () => {
    if (!LIVEKIT_URL || !VOICE_AGENT_URL) {
      setError("Voice not configured. Set NEXT_PUBLIC_LIVEKIT_URL and NEXT_PUBLIC_VOICE_AGENT_URL.")
      setStatus("error")
      return
    }
    setStatus("starting")
    setError(null)
    try {
      const res = await fetch(`${VOICE_AGENT_URL.replace(/\/$/, "")}/token`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || res.statusText || "Failed to get token")
      }
      const data = (await res.json()) as { token: string; room: string }
      setToken(data.token)
      setRoomName(data.room)
      setStatus("active")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start call"
      setError(message)
      setStatus("error")
    }
  }, [])

  const configured = Boolean(LIVEKIT_URL && VOICE_AGENT_URL)

  if (token && roomName) {
    return (
      <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-md max-w-lg mx-auto">
        <LiveKitRoom
          token={token}
          serverUrl={LIVEKIT_URL}
          connect={true}
          audio={true}
          video={false}
          onDisconnected={disconnect}
          onError={(e) => {
            setError(e?.message ?? "Connection error")
            setStatus("error")
          }}
          data-lk-theme="default"
          style={{ height: "100%", minHeight: 200 }}
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">In call — speak to the agent. Agent uses local knowledge + Exa research.</p>
            <RoomAudioRenderer />
            <div className="flex flex-wrap items-center gap-2">
              <TrackToggle source={Track.Source.ScreenShare} className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4" />
              <Button variant="destructive" className="flex items-center gap-2 w-fit" onClick={disconnect}>
                <PhoneOff className="h-4 w-4" />
                End call
              </Button>
            </div>
          </div>
        </LiveKitRoom>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-md max-w-lg mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-foreground/80">Clarte Voice (LiveKit + OpenAI Realtime)</p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <span className="text-sm text-muted-foreground">
            {status === "active" ? "In call" : status === "starting" ? "Starting…" : status === "error" ? "Error" : "Ready"}
          </span>
        </div>
      </div>

      {!configured && (
        <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
          Set NEXT_PUBLIC_LIVEKIT_URL and NEXT_PUBLIC_VOICE_AGENT_URL (token server). Run the voice-agent and point frontend to it.
        </p>
      )}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        {status === "idle" && (
          <Button className="flex items-center gap-2" onClick={startCall} disabled={!configured}>
            <Loader2 className="h-4 w-4" />
            Start voice call
          </Button>
        )}
        {status === "starting" && (
          <Button disabled className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting…
          </Button>
        )}
        {status === "error" && (
          <Button className="flex items-center gap-2" onClick={startCall}>
            Try again
          </Button>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Speech-first: local DB + Exa research. Configure voice-agent/.env and run agent + token server.
      </p>
    </div>
  )
}
