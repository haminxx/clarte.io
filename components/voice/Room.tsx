"use client"

/**
 * Clarte Voice – LiveKit + Clarte agent.
 * Fetches token from voice-agent (Render), connects to LiveKit; agent joins and speaks.
 */
import React, { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Loader2, Phone } from "lucide-react"
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react"

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
    const url = `${VOICE_AGENT_URL.replace(/\/$/, "")}/token`
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Token request failed: ${res.status}`)
      }
      const data = (await res.json()) as { token: string; room: string }
      setToken(data.token)
      setRoomName(data.room)
      setStatus("active")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get token")
      setStatus("error")
    }
  }, [])

  const configured = Boolean(LIVEKIT_URL && VOICE_AGENT_URL)

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
          className="rounded-2xl overflow-hidden"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <RoomAudioRenderer />
            <p className="text-sm text-muted-foreground">In call with Clarte</p>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnect}
              className="gap-2"
            >
              <PhoneOff className="h-4 w-4" />
              End call
            </Button>
          </div>
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
          <p className="text-xs text-muted-foreground text-center">
            Set NEXT_PUBLIC_LIVEKIT_URL and NEXT_PUBLIC_VOICE_AGENT_URL (token server).
          </p>
        )}
      </div>
    </div>
  )
}
