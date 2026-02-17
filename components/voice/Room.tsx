"use client"

/**
 * Clarte Voice – LiveKit + Clarte agent.
 * Fetches token from VOICE_AGENT_URL/token (Render) when set, else /api/token (local Next.js).
 * Connects to LiveKit; agent joins and speaks.
 */
import React, { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Loader2, Phone } from "lucide-react"
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant } from "@livekit/components-react"

/** Phase 2: Fail fast if LiveKit URL is not set (client env inlined at build). */
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? ""
const VOICE_AGENT_URL = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ""
if (typeof window === "undefined" && !LIVEKIT_URL) {
  throw new Error("Missing NEXT_PUBLIC_LIVEKIT_URL")
}

/** Inner content so we can use useLocalParticipant inside LiveKitRoom. */
function RoomInner({ onDisconnect }: { onDisconnect: () => void }) {
  const { localParticipant, isMicrophoneEnabled, microphoneTrack } = useLocalParticipant()

  React.useEffect(() => {
    console.log("[Clarte Voice] Mic state:", {
      isMicrophoneEnabled,
      hasMicTrack: !!microphoneTrack,
      micPublicationKind: microphoneTrack?.kind,
    })
  }, [isMicrophoneEnabled, microphoneTrack])

  React.useEffect(() => {
    if (!localParticipant) return
    const enableMic = async () => {
      try {
        await localParticipant.setMicrophoneEnabled(true)
        console.log("[Clarte Voice] Microphone explicitly enabled")
      } catch (e) {
        console.warn("[Clarte Voice] Failed to enable microphone:", e)
      }
    }
    enableMic()
  }, [localParticipant])

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

  const disconnect = useCallback(() => {
    setToken(null)
    setRoomName(null)
    setStatus("idle")
    setError(null)
  }, [])

  const startCall = useCallback(async () => {
    // #region agent log
    if (typeof window !== "undefined") {
      fetch("http://127.0.0.1:7243/ingest/363e9ab2-528b-4bb8-8b5a-1ca9564ffd54", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "Room.tsx:startCall:entry",
          message: "startCall invoked",
          data: {
            hasLiveKitUrl: !!LIVEKIT_URL,
            liveKitUrlLength: LIVEKIT_URL?.length ?? 0,
            hasVoiceAgentUrl: !!VOICE_AGENT_URL,
            voiceAgentUrl: VOICE_AGENT_URL || "(empty)",
            tokenUrlUsed: VOICE_AGENT_URL ? `${VOICE_AGENT_URL.replace(/\/$/, "")}/token` : "/api/token",
            origin: typeof window !== "undefined" ? window.location.origin : "ssr",
          },
          timestamp: Date.now(),
          hypothesisId: "H1",
        }),
      }).catch(() => {})
    }
    // #endregion
    if (!LIVEKIT_URL) {
      // #region agent log
      if (typeof window !== "undefined") {
        fetch("http://127.0.0.1:7243/ingest/363e9ab2-528b-4bb8-8b5a-1ca9564ffd54", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "Room.tsx:startCall:earlyExit",
            message: "LIVEKIT_URL empty - Voice not configured",
            data: { hypothesisId: "H1" },
            timestamp: Date.now(),
            hypothesisId: "H1",
          }),
        }).catch(() => {})
      }
      // #endregion
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
    console.log("[Clarte Voice] Requesting token...")
    const tokenUrl = VOICE_AGENT_URL
      ? `${VOICE_AGENT_URL.replace(/\/$/, "")}/token`
      : "/api/token"
    try {
      // #region agent log
      if (typeof window !== "undefined") {
        fetch("http://127.0.0.1:7243/ingest/363e9ab2-528b-4bb8-8b5a-1ca9564ffd54", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "Room.tsx:startCall:beforeFetch",
            message: "Fetching token",
            data: {
              tokenUrl,
              fullUrl: tokenUrl.startsWith("http") ? tokenUrl : `${window.location.origin}${tokenUrl}`,
              hypothesisId: "H2",
            },
            timestamp: Date.now(),
            hypothesisId: "H2",
          }),
        }).catch(() => {})
      }
      // #endregion
      const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const raw = await res.text()
      // #region agent log
      if (typeof window !== "undefined") {
        fetch("http://127.0.0.1:7243/ingest/363e9ab2-528b-4bb8-8b5a-1ca9564ffd54", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "Room.tsx:startCall:afterFetch",
            message: "Token fetch response",
            data: {
              status: res.status,
              ok: res.ok,
              rawLength: raw.length,
              rawPreview: raw.slice(0, 150),
              hypothesisId: "H4",
            },
            timestamp: Date.now(),
            hypothesisId: "H4",
          }),
        }).catch(() => {})
      }
      // #endregion
      console.log("[Clarte Voice] Token response status:", res.status, "body length:", raw.length)
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
        console.error("[Clarte Voice] Token is empty")
        if (typeof window !== "undefined") alert("Error: Token is empty")
        setError("Token is empty")
        setStatus("error")
        return
      }
      // #region agent log
      if (typeof window !== "undefined") {
        fetch("http://127.0.0.1:7243/ingest/363e9ab2-528b-4bb8-8b5a-1ca9564ffd54", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "Room.tsx:startCall:success",
            message: "Token received successfully",
            data: { hasToken: !!receivedToken, room: receivedRoom, hypothesisId: "H4" },
            timestamp: Date.now(),
            hypothesisId: "H4",
          }),
        }).catch(() => {})
      }
      // #endregion
      console.log("[Clarte Voice] Token received successfully, room:", receivedRoom)
      setToken(receivedToken)
      setRoomName(receivedRoom ?? `room-${Date.now()}`)
      setStatus("active")
    } catch (e) {
      // #region agent log
      if (typeof window !== "undefined") {
        fetch("http://127.0.0.1:7243/ingest/363e9ab2-528b-4bb8-8b5a-1ca9564ffd54", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "Room.tsx:startCall:catch",
            message: "Token fetch threw",
            data: {
              errorName: e instanceof Error ? e.name : "unknown",
              errorMessage: e instanceof Error ? e.message : String(e),
              hypothesisId: "H5",
            },
            timestamp: Date.now(),
            hypothesisId: "H5",
          }),
        }).catch(() => {})
      }
      // #endregion
      const message = e instanceof Error ? e.message : "Failed to get token"
      console.error("[Clarte Voice] Token fetch failed:", e)
      setError(message)
      setStatus("error")
    }
  }, [])

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
          onConnected={() => {
            console.log("[Clarte Voice] LiveKit room connected")
          }}
          onDisconnected={() => {
            console.log("[Clarte Voice] LiveKit room disconnected")
            disconnect()
          }}
          onError={(error) => console.error("LiveKit Error:", error)}
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
