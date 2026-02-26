"use client"

/**
 * Clarte Voice – LiveKit + Clarte agent.
 * Fetches token from VOICE_AGENT_URL/token (Render) when set, else /api/token (local Next.js).
 * Connects to LiveKit; agent joins and speaks.
 * Supports voice-only, voice-with-screen (screen share), and voice-with-screen-camera modes.
 */
import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Loader2, Phone, Monitor, Video } from "lucide-react"
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant } from "@livekit/components-react"
import { useKrispNoiseFilter } from "@livekit/components-react/krisp"

export type CallMode = "voice-only" | "voice-with-screen" | "voice-with-screen-camera" | "voice-with-camera"

/** Phase 2: Fail fast if LiveKit URL is not set (client env inlined at build). */
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? ""
const VOICE_AGENT_URL = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ""

// LIVEKIT_URL required only for Tier 2/3 (screen share, camera). Tier 1 uses VoiceRoomDirect.

/** Wrapper that provides Krisp to RoomInner. Uses error boundary to fall back to no-Krisp if unsupported. */
function RoomInnerKrispProvider({
  onDisconnect,
  withScreen,
  withCamera,
}: {
  onDisconnect: () => void
  withScreen: boolean
  withCamera: boolean
}) {
  const krisp = useKrispNoiseFilter()
  return <RoomInner onDisconnect={onDisconnect} withScreen={withScreen} withCamera={withCamera} krisp={krisp} />
}

class KrispErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError = () => ({ hasError: true })
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

function RoomInnerWithKrisp(props: {
  onDisconnect: () => void
  withScreen: boolean
  withCamera: boolean
  useKrisp: boolean
}) {
  const { useKrisp, ...innerProps } = props
  if (!useKrisp) {
    return <RoomInner {...innerProps} krisp={null} />
  }
  return (
    <KrispErrorBoundary fallback={<RoomInner {...innerProps} krisp={null} />}>
      <RoomInnerKrispProvider {...innerProps} />
    </KrispErrorBoundary>
  )
}

/** Inner content so we can use useLocalParticipant inside LiveKitRoom. */
function RoomInner({
  onDisconnect,
  withScreen,
  withCamera,
  krisp,
}: {
  onDisconnect: () => void
  withScreen: boolean
  withCamera: boolean
  krisp: { setNoiseFilterEnabled: (v: boolean) => Promise<void> } | null
}) {
  const { localParticipant, isMicrophoneEnabled, microphoneTrack, isScreenShareEnabled, isCameraEnabled } =
    useLocalParticipant()
  const [screenSharePending, setScreenSharePending] = useState(false)
  const [cameraPending, setCameraPending] = useState(false)

  React.useEffect(() => {
    if (microphoneTrack && krisp) {
      void krisp.setNoiseFilterEnabled(true)
    }
  }, [microphoneTrack, krisp])

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

  const toggleScreenShare = useCallback(async () => {
    if (!localParticipant) return
    setScreenSharePending(true)
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled)
    } catch (e) {
      console.warn("[Clarte Voice] Screen share failed:", e)
    } finally {
      setScreenSharePending(false)
    }
  }, [localParticipant, isScreenShareEnabled])

  const toggleCamera = useCallback(async () => {
    if (!localParticipant) return
    setCameraPending(true)
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled)
    } catch (e) {
      console.warn("[Clarte Voice] Camera failed:", e)
    } finally {
      setCameraPending(false)
    }
  }, [localParticipant, isCameraEnabled])

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <RoomAudioRenderer />
      <p className="text-sm text-muted-foreground">
        In call with Assistant {!isMicrophoneEnabled && "(mic off — check permissions)"}
        {withScreen && isScreenShareEnabled && " · Screen shared"}
        {withCamera && isCameraEnabled && " · Camera on"}
      </p>
      <div className="flex items-center gap-2">
        {withScreen && (
          <Button
            variant={isScreenShareEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleScreenShare}
            disabled={screenSharePending}
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            {isScreenShareEnabled ? "Stop sharing" : "Share screen"}
          </Button>
        )}
        {withCamera && (
          <Button
            variant={isCameraEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleCamera}
            disabled={cameraPending}
            className="gap-2"
          >
            <Video className="h-4 w-4" />
            {isCameraEnabled ? "Camera off" : "Camera on"}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onDisconnect} className="gap-2">
          <PhoneOff className="h-4 w-4" />
          End call
        </Button>
      </div>
    </div>
  )
}

function toAgentMode(mode: CallMode): "casual" | "expert" {
  return mode === "voice-only" ? "casual" : "expert"
}

async function fetchToken(
  tokenUrl: string,
  mode: CallMode
): Promise<{ token: string; room: string } | { error: string }> {
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voice: "cedar", mode: toAgentMode(mode) }),
  })
  const raw = await res.text()
  if (!res.ok) {
    let errMsg = raw || `Token request failed: ${res.status}`
    try {
      const parsed = JSON.parse(raw) as { error?: string; detail?: string }
      if (parsed?.error) errMsg = parsed.error
      else if (parsed?.detail) errMsg = parsed.detail
    } catch {
      /* use raw */
    }
    return { error: errMsg }
  }
  let data: { token?: string; room?: string }
  try {
    data = JSON.parse(raw) as { token?: string; room?: string }
  } catch {
    return { error: "Invalid token response" }
  }
  const token = data?.token ?? null
  const room = data?.room ?? null
  if (!token || token.trim() === "") return { error: "Token is empty" }
  return { token, room: room ?? `room-${Date.now()}` }
}

interface RoomProps {
  mode?: CallMode
  tier?: TierPreset
  autoStart?: boolean
  onDisconnect?: () => void
}

export function Room({ mode = "voice-only", tier = "auto", autoStart = false, onDisconnect }: RoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const withScreen = mode === "voice-with-screen" || mode === "voice-with-screen-camera"
  const withCamera = mode === "voice-with-screen-camera" || mode === "voice-with-camera"
  const useKrisp = withScreen || withCamera

  const disconnect = useCallback(() => {
    setToken(null)
    setRoomName(null)
    setStatus("idle")
    setError(null)
    onDisconnect?.()
  }, [onDisconnect])

  const startCall = useCallback(async () => {
    if (!LIVEKIT_URL) {
      setError("Voice is not configured. Set NEXT_PUBLIC_LIVEKIT_URL in your environment.")
      setStatus("error")
      return
    }
    setStatus("starting")
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
    } catch (micErr) {
      console.error("[Clarte Voice] Microphone access denied or failed:", micErr)
      setError("Microphone access is required. Please allow microphone permission and try again.")
      setStatus("error")
      return
    }

    const baseUrl = VOICE_AGENT_URL?.replace(/\/$/, "") ?? ""
    const tokenUrl = baseUrl ? `${baseUrl}/token` : "/api/token"
    if (baseUrl) {
      console.log("[Clarte Voice] Using Render token server:", tokenUrl)
    } else {
      console.log("[Clarte Voice] Using local /api/token for dev")
    }
    if (baseUrl) {
      try {
        await fetch(`${baseUrl}/health`)
      } catch {
        /* ignore warmup failures */
      }
    }
    try {
      const result = await fetchToken(tokenUrl, mode)
      if ("error" in result) {
        setError(result.error)
        setStatus("error")
        return
      }
      setToken(result.token)
      setRoomName(result.room)
      setStatus("active")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get token")
      setStatus("error")
    }
  }, [mode])

  const configured = Boolean(LIVEKIT_URL)

  useEffect(() => {
    if (autoStart && status === "idle" && configured) {
      startCall()
    }
  }, [autoStart, configured, status, startCall])

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
          <RoomInnerWithKrisp onDisconnect={disconnect} withScreen={withScreen} withCamera={withCamera} useKrisp={useKrisp} />
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
        <div className="flex items-center gap-2">
          {autoStart && onDisconnect && (
            <Button variant="outline" size="sm" onClick={onDisconnect} className="gap-2">
              <PhoneOff className="h-4 w-4" />
              Back
            </Button>
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
        </div>
        {!configured && (
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Set NEXT_PUBLIC_LIVEKIT_URL. For hosted (Firebase), also set NEXT_PUBLIC_VOICE_AGENT_URL to your Render token server URL.
          </p>
        )}
      </div>
    </div>
  )
}
