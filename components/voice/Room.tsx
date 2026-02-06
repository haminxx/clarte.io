"use client"

/**
 * Clarte Voice – LiveKit + Clarifying Observer Agent
 * Fetches token from voice-agent token server, connects to LiveKit; agent greets by name and uses Clarifying Observer persona.
 */
import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Loader2, Phone, Monitor } from "lucide-react"
import { LiveKitRoom, RoomAudioRenderer, TrackToggle, useLocalParticipant } from "@livekit/components-react"
import { Track } from "livekit-client"
import { getFirebaseAuth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? ""
const VOICE_AGENT_URL = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ""

/** Sets participant metadata to displayName so the agent can greet by name. Unknown users = "traveler". */
function SetParticipantDisplayName() {
  const { localParticipant } = useLocalParticipant()
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setDisplayName("traveler")
      return
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      const name = user?.displayName?.trim() || "traveler"
      setDisplayName(name)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!localParticipant || displayName === null) return
    const payload = JSON.stringify({ displayName })
    localParticipant.setMetadata(payload).catch(() => {})
  }, [localParticipant, displayName])

  return null
}

export function Room() {
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [voiceSelected, setVoiceSelected] = useState(true)
  const [screenShareSelected, setScreenShareSelected] = useState(false)

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
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90_000)
    try {
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || res.statusText || "Failed to get token")
      }
      const data = (await res.json()) as { token: string; room: string }
      setToken(data.token)
      setRoomName(data.room)
      setStatus("active")
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name === "AbortError") {
        setError("Server is taking too long (it may be waking up). Please try again in a moment.")
      } else {
        const message = err instanceof Error ? err.message : "Failed to start call"
        const isNetworkError = message.toLowerCase().includes("failed to fetch") || message.toLowerCase().includes("network")
        setError(
          isNetworkError
            ? "Could not reach the voice server. It may be waking up (try again in 30–60 seconds) or check your connection."
            : message
        )
      }
      setStatus("error")
    }
  }, [])

  const configured = Boolean(LIVEKIT_URL && VOICE_AGENT_URL)
  const useScreenShare = screenShareSelected

  if (token && roomName) {
    return (
      <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-md max-w-lg mx-auto">
        <LiveKitRoom
          token={token}
          serverUrl={LIVEKIT_URL}
          connect={true}
          audio={true}
          video={useScreenShare}
          onDisconnected={disconnect}
          onError={(e) => {
            setError(e?.message ?? "Connection error")
            setStatus("error")
          }}
          data-lk-theme="default"
          style={{ height: "100%", minHeight: 200 }}
        >
          <SetParticipantDisplayName />
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">In call — speak to the Clarifying Observer. Share your screen for visual context.</p>
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
      <div className="mb-4 flex items-center justify-between">
        <p className="text-foreground/80">Test - Clarte Voice Agent</p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <span className="text-sm text-muted-foreground">
            {status === "active" ? "In call" : status === "starting" ? "Starting…" : status === "error" ? "Error" : "Ready"}
          </span>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Mention &quot;help&quot; or &quot;search&quot; to receive an answer from Clarte.
      </p>

      {!configured && (
        <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
          Set NEXT_PUBLIC_LIVEKIT_URL and NEXT_PUBLIC_VOICE_AGENT_URL (token server). Run the voice-agent and point frontend to it.
        </p>
      )}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {/* Selectable options: Voice call (default) + Screen share */}
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setVoiceSelected(!voiceSelected)}
          className={`flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
            voiceSelected
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <Phone className="h-4 w-4 shrink-0" />
          Voice call
        </button>
        <button
          type="button"
          onClick={() => setScreenShareSelected(!screenShareSelected)}
          className={`flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
            screenShareSelected
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <Monitor className="h-4 w-4 shrink-0" />
          Screen share
        </button>
      </div>

      {/* Call button bottom right */}
      <div className="flex justify-end">
        {status === "idle" && (
          <Button className="flex items-center gap-2" onClick={startCall} disabled={!configured}>
            <Phone className="h-4 w-4" />
            Call
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
    </div>
  )
}
