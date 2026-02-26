"use client"

/**
 * Clarte Voice – LiveKit + Clarte agent.
 * Single pipeline: voice-only by default. Screen share and camera are enabled only when
 * the agent requests them via data messages (user sees a modal and can Allow or Deny).
 */
import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Loader2, Phone, Play, Monitor, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { VOICE_OPTIONS, LANGUAGE_OPTIONS } from "@/components/voice-card"
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant, useDataChannel } from "@livekit/components-react"
import { useKrispNoiseFilter } from "@livekit/components-react/krisp"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  compact,
}: {
  onDisconnect: () => void
  withScreen: boolean
  withCamera: boolean
  compact?: boolean
}) {
  const krisp = useKrispNoiseFilter()
  return <RoomInner onDisconnect={onDisconnect} withScreen={withScreen} withCamera={withCamera} krisp={krisp} compact={compact} />
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
  compact?: boolean
}) {
  const { useKrisp, compact, ...innerProps } = props
  if (!useKrisp) {
    return <RoomInner {...innerProps} krisp={null} compact={compact} />
  }
  return (
    <KrispErrorBoundary fallback={<RoomInner {...innerProps} krisp={null} compact={compact} />}>
      <RoomInnerKrispProvider {...innerProps} compact={compact} />
    </KrispErrorBoundary>
  )
}

/** Inner content so we can use useLocalParticipant inside LiveKitRoom. */
function RoomInner({
  onDisconnect,
  withScreen,
  withCamera,
  krisp,
  compact,
}: {
  onDisconnect: () => void
  withScreen: boolean
  withCamera: boolean
  krisp: { setNoiseFilterEnabled: (v: boolean) => Promise<void> } | null
  compact?: boolean
}) {
  const { localParticipant, isMicrophoneEnabled, microphoneTrack, isScreenShareEnabled, isCameraEnabled } =
    useLocalParticipant()
  const [screenSharePending, setScreenSharePending] = useState(false)
  const [cameraPending, setCameraPending] = useState(false)
  const [showScreenShareRequest, setShowScreenShareRequest] = useState(false)
  const [showCameraRequest, setShowCameraRequest] = useState(false)

  useDataChannel((msg) => {
    try {
      const text = new TextDecoder().decode(msg.payload)
      const data = JSON.parse(text) as { type?: string }
      if (data?.type === "request_screen_share") setShowScreenShareRequest(true)
      if (data?.type === "request_camera") setShowCameraRequest(true)
    } catch {
      /* ignore */
    }
  })

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

  const handleAllowScreenShare = useCallback(async () => {
    setShowScreenShareRequest(false)
    if (!localParticipant) return
    setScreenSharePending(true)
    try {
      await localParticipant.setScreenShareEnabled(true)
    } catch (e) {
      console.warn("[Clarte Voice] Screen share failed:", e)
    } finally {
      setScreenSharePending(false)
    }
  }, [localParticipant])

  const handleAllowCamera = useCallback(async () => {
    setShowCameraRequest(false)
    if (!localParticipant) return
    setCameraPending(true)
    try {
      await localParticipant.setCameraEnabled(true)
    } catch (e) {
      console.warn("[Clarte Voice] Camera failed:", e)
    } finally {
      setCameraPending(false)
    }
  }, [localParticipant])

  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-col items-center gap-4 py-4"}>
      <RoomAudioRenderer />
      {!compact && (
        <p className="text-sm text-muted-foreground">
          In call with Assistant {!isMicrophoneEnabled && "(mic off — check permissions)"}
          {isScreenShareEnabled && " · Screen shared"}
          {isCameraEnabled && " · Camera on"}
        </p>
      )}
      <Dialog open={showScreenShareRequest} onOpenChange={setShowScreenShareRequest}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Share your screen?</DialogTitle>
            <DialogDescription>
              Clarte would like to see your screen to help you. Allow to share your display.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScreenShareRequest(false)}>
              Not now
            </Button>
            <Button onClick={handleAllowScreenShare} disabled={screenSharePending}>
              {screenSharePending ? "Starting…" : "Allow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showCameraRequest} onOpenChange={setShowCameraRequest}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Turn on camera?</DialogTitle>
            <DialogDescription>
              Clarte would like to see your camera (e.g. to see your drawing). Allow to turn on your camera.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCameraRequest(false)}>
              Not now
            </Button>
            <Button onClick={handleAllowCamera} disabled={cameraPending}>
              {cameraPending ? "Starting…" : "Allow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex items-center gap-2">
        {isScreenShareEnabled && (
          <Button
            variant="default"
            size="sm"
            onClick={toggleScreenShare}
            disabled={screenSharePending}
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            Stop sharing
          </Button>
        )}
        {isCameraEnabled && (
          <Button
            variant="default"
            size="sm"
            onClick={toggleCamera}
            disabled={cameraPending}
            className="gap-2"
          >
            <Video className="h-4 w-4" />
            Camera off
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
  mode: CallMode,
  voice?: string,
  language?: string
): Promise<{ token: string; room: string } | { error: string }> {
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      voice: voice ?? "cedar",
      mode: toAgentMode(mode),
      language: language === "ko" ? "ko" : "en",
    }),
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
  voice?: string
  language?: "en" | "ko"
  autoStart?: boolean
  onDisconnect?: () => void
  /** When true, use VoiceCard-style layout (header, badge, voice toggle) for idle/starting/active. */
  cardLayout?: boolean
  selectedVoiceId?: string
  onVoiceChange?: (voiceId: string) => void
  selectedLanguage?: "en" | "ko"
  onLanguageChange?: (lang: "en" | "ko") => void
}

export function Room({
  mode = "voice-only",
  voice,
  language = "en",
  autoStart = false,
  onDisconnect,
  cardLayout = false,
  selectedVoiceId = "cedar",
  onVoiceChange,
  selectedLanguage = "en",
  onLanguageChange,
}: RoomProps) {
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
      const result = await fetchToken(tokenUrl, mode, voice, language)
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
  }, [mode, voice, language])

  const configured = Boolean(LIVEKIT_URL)

  useEffect(() => {
    if (autoStart && status === "idle" && configured) {
      startCall()
    }
  }, [autoStart, configured, status, startCall])

  const cardHeader = (
    <div className="mb-6 flex items-center justify-between">
      <p className="text-foreground/80">
        Welcome to Clarte — your Executive Assistant.
      </p>
      <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
        <div
          className={`h-2 w-2 rounded-full bg-emerald-400 ${status === "active" ? "animate-[clarte-pulse_1.5s_ease-in-out_infinite]" : ""}`}
        />
        <span className="text-sm text-muted-foreground">
          {status === "starting" ? "Connecting…" : status === "active" ? "Active" : "Ready"}
        </span>
      </div>
    </div>
  )

  const languageToggle = (
    <div
      role="group"
      aria-label="Language selection"
      className={cn(
        "inline-flex rounded-full bg-muted/50 p-1 ring-1 ring-border/50 shadow-sm",
        (status === "starting" || status === "active") && "opacity-60 pointer-events-none"
      )}
    >
      {LANGUAGE_OPTIONS.map(({ name, langId }) => (
        <button
          key={langId}
          type="button"
          onClick={() => (status !== "starting" && status !== "active") && onLanguageChange?.(langId)}
          aria-pressed={selectedLanguage === langId}
          aria-label={`Language: ${name}`}
          disabled={status === "starting" || status === "active"}
          className={cn(
            "relative px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
            selectedLanguage === langId
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {name}
        </button>
      ))}
    </div>
  )

  const voiceToggle = (
    <div
      role="group"
      aria-label="Voice selection"
      className={cn(
        "inline-flex rounded-full bg-muted/50 p-1 ring-1 ring-border/50 shadow-sm",
        (status === "starting" || status === "active") && "opacity-60 pointer-events-none"
      )}
    >
      {VOICE_OPTIONS.map(({ name, voiceId }) => (
        <button
          key={voiceId}
          type="button"
          onClick={() => (status !== "starting" && status !== "active") && onVoiceChange?.(voiceId)}
          aria-pressed={selectedVoiceId === voiceId}
          aria-label={`Voice: ${name}`}
          disabled={status === "starting" || status === "active"}
          className={cn(
            "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            selectedVoiceId === voiceId
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {name}
        </button>
      ))}
    </div>
  )

  if (status === "active" && token && roomName) {
    if (cardLayout) {
      return (
        <>
          {cardHeader}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Start with voice. Ask Clarte to see your screen or camera when you need it.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">{languageToggle}{voiceToggle}</div>
              <LiveKitRoom
                serverUrl={LIVEKIT_URL}
                token={token}
                connect={true}
                audio={true}
                video={false}
                onConnected={() => console.log("[Clarte Voice] Connected to LiveKit room")}
                onDisconnected={disconnect}
                onError={(err) => {
                  console.error("[Clarte Voice] LiveKit error:", err)
                  setToken(null)
                  setRoomName(null)
                  setStatus("error")
                  setError(err?.message ?? "Connection error")
                }}
                className="flex items-center gap-2"
              >
                <RoomInnerWithKrisp
                  onDisconnect={disconnect}
                  withScreen={withScreen}
                  withCamera={withCamera}
                  useKrisp={useKrisp}
                  compact
                />
              </LiveKitRoom>
            </div>
          </div>
        </>
      )
    }
    return (
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md mx-auto">
        <LiveKitRoom
          serverUrl={LIVEKIT_URL}
          token={token}
          connect={true}
          audio={true}
          video={false}
          onConnected={() => console.log("[Clarte Voice] Connected to LiveKit room")}
          onDisconnected={disconnect}
          onError={(err) => {
            console.error("[Clarte Voice] LiveKit error:", err)
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

  if (cardLayout) {
    return (
      <>
        {cardHeader}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Start with voice. Ask Clarte to see your screen or camera when you need it.
          </p>
          <div className="flex flex-col items-center gap-4 py-2">
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-3">{languageToggle}{voiceToggle}</div>
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
                    <Play className="h-4 w-4" />
                  )}
                  {status === "starting" ? "Connecting…" : "Connect to Assistant"}
                </Button>
              </div>
            </div>
          </div>
          {!configured && (
            <p className="text-xs text-muted-foreground text-center max-w-xs mt-2">
              Set NEXT_PUBLIC_LIVEKIT_URL. For hosted (Firebase), also set NEXT_PUBLIC_VOICE_AGENT_URL to your Render token server URL.
            </p>
          )}
        </div>
      </>
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
