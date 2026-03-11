"use client"

/**
 * Clarte Voice – LiveKit + Clarte agent.
 * Single pipeline: voice-only by default. Screen share and camera are enabled only when
 * the agent requests them via data messages (user sees a modal and can Allow or Deny).
 */
import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Loader2, Phone, Play, Monitor, Video } from "lucide-react"
import {
  VOICE_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/components/voice-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useDataChannel,
  useRemoteParticipants,
  useSpeakingParticipants,
} from "@livekit/components-react"
import { useKrispNoiseFilter } from "@livekit/components-react/krisp"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useClarteTheme } from "@/lib/clarte-theme-context"

export type CallMode = "voice-only" | "voice-with-screen" | "voice-with-screen-camera" | "voice-with-camera"

type SupportedLanguage = "en" | "ko" | "es" | "zh" | "ja" | "hi"

/** Phase 2: Fail fast if LiveKit URL is not set (client env inlined at build). */
const LIVEKIT_URL_RAW = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? ""
const VOICE_AGENT_URL_RAW = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ""
/** Treat placeholder URLs (from CI when secrets missing) as not configured. */
const isPlaceholderUrl = (url: string) => !url || url.includes("placeholder")
const LIVEKIT_URL = isPlaceholderUrl(LIVEKIT_URL_RAW) ? "" : LIVEKIT_URL_RAW
const VOICE_AGENT_URL = isPlaceholderUrl(VOICE_AGENT_URL_RAW) ? "" : VOICE_AGENT_URL_RAW

// LIVEKIT_URL required only for Tier 2/3 (screen share, camera). Tier 1 uses VoiceRoomDirect.

/** Mobile detection for mic error messaging */
function isMobile(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/** User-friendly mic error message based on error type */
function getMicErrorMessage(err: unknown): string {
  const name = err instanceof Error ? err.name : ""
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return isMobile()
      ? "Tap Allow when your browser asks for microphone access. If you already allowed, try refreshing the page."
      : "Microphone access was denied. Please allow microphone permission and try again."
  }
  if (name === "NotFoundError") {
    return "No microphone found. Please connect a microphone and try again."
  }
  if (name === "NotReadableError") {
    return "Microphone is in use by another app. Close other apps using the mic and try again."
  }
  return "Microphone access is required. Please allow microphone permission and try again."
}

/** Wrapper that provides Krisp to RoomInner. Uses error boundary to fall back to no-Krisp if unsupported. */
function RoomInnerKrispProvider({
  onDisconnect,
  withScreen,
  withCamera,
  compact,
  onTranscriptAdd,
  onTranscriptPartial,
}: {
  onDisconnect: () => void
  withScreen: boolean
  withCamera: boolean
  compact?: boolean
  onTranscriptAdd?: (role: string, content: string) => void
  onTranscriptPartial?: (role: string, content: string) => void
}) {
  const krisp = useKrispNoiseFilter()
  return (
    <RoomInner
      onDisconnect={onDisconnect}
      withScreen={withScreen}
      withCamera={withCamera}
      krisp={krisp}
      compact={compact}
      onTranscriptAdd={onTranscriptAdd}
      onTranscriptPartial={onTranscriptPartial}
    />
  )
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
  onTranscriptAdd?: (role: string, content: string) => void
  onTranscriptPartial?: (role: string, content: string) => void
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
  onTranscriptAdd,
  onTranscriptPartial,
}: {
  onDisconnect: () => void
  withScreen: boolean
  withCamera: boolean
  krisp: { setNoiseFilterEnabled: (v: boolean) => Promise<void> } | null
  compact?: boolean
  onTranscriptAdd?: (role: string, content: string) => void
  onTranscriptPartial?: (role: string, content: string) => void
}) {
  const { localParticipant, isMicrophoneEnabled, microphoneTrack, isScreenShareEnabled, isCameraEnabled } =
    useLocalParticipant()
  const [screenSharePending, setScreenSharePending] = useState(false)
  const [cameraPending, setCameraPending] = useState(false)
  const [showScreenShareRequest, setShowScreenShareRequest] = useState(false)
  const [showCameraRequest, setShowCameraRequest] = useState(false)
  const [isAgentThinking, setIsAgentThinking] = useState(false)

  const remoteParticipants = useRemoteParticipants()
  const agentParticipant = remoteParticipants[0] ?? null
  const speakingParticipants = useSpeakingParticipants()
  const isAgentSpeaking = agentParticipant !== null && speakingParticipants.includes(agentParticipant)

  useDataChannel((msg) => {
    try {
      const text = new TextDecoder().decode(msg.payload)
      const data = JSON.parse(text) as { type?: string; role?: string; content?: string }
      if (data?.type === "request_screen_share") setShowScreenShareRequest(true)
      if (data?.type === "request_camera") setShowCameraRequest(true)
      if (data?.type === "agent_thinking") setIsAgentThinking(true)
      if (data?.type === "transcript_add" && data.role && data.content && onTranscriptAdd) {
        onTranscriptAdd(data.role, data.content)
      }
      if (data?.type === "transcript_partial" && data.role && data.content !== undefined && onTranscriptPartial) {
        onTranscriptPartial(data.role, data.content)
      }
    } catch {
      /* ignore */
    }
  })

  useEffect(() => {
    if (isAgentSpeaking && isAgentThinking) setIsAgentThinking(false)
  }, [isAgentSpeaking, isAgentThinking])

  useEffect(() => {
    if (!isAgentThinking) return
    const timeout = setTimeout(() => setIsAgentThinking(false), 10_000)
    return () => clearTimeout(timeout)
  }, [isAgentThinking])

  useEffect(() => {
    if (!isAgentThinking) return
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = 250
    gain.gain.value = 0.04
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    return () => {
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      setTimeout(() => {
        osc.stop()
        ctx.close()
      }, 120)
    }
  }, [isAgentThinking])

  React.useEffect(() => {
    if (microphoneTrack && krisp) {
      void krisp.setNoiseFilterEnabled(true)
    }
  }, [microphoneTrack, krisp])

  /* LiveKit path uses Krisp for noise filtering. High-pass filter applied in VoiceRoomDirect (WebSocket path). */

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
      <div className={compact ? "flex flex-col items-center gap-2" : "flex items-center gap-2"}>
        {compact ? (
          <>
            <div className="flex justify-end w-full">
              <Button
                variant="outline"
                size="lg"
                onClick={onDisconnect}
                className="gap-2 h-12 px-6 rounded-full"
              >
                <PhoneOff className="h-4 w-4" />
                End call
              </Button>
            </div>
            {(isScreenShareEnabled || isCameraEnabled) && (
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
              </div>
            )}
          </>
        ) : (
          <>
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
            <Button
              variant="outline"
              size="sm"
              onClick={onDisconnect}
              className="gap-2"
            >
              <PhoneOff className="h-4 w-4" />
              End call
            </Button>
          </>
        )}
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
  language?: SupportedLanguage,
  user_name?: string | null,
  voiceProfileId?: string | null,
  agentMode?: string | null,
  signal?: AbortSignal
): Promise<{ token: string; room: string } | { error: string }> {
  const normalizedLanguage: SupportedLanguage =
    language && ["en", "ko", "es", "zh", "ja", "hi"].includes(language)
      ? language
      : "en"

  const body: Record<string, string> = {
    voice: voice ?? "marin",
    mode: toAgentMode(mode),
    language: normalizedLanguage,
  }
  const trimmed = user_name?.trim?.()
  if (trimmed && trimmed !== "undefined" && trimmed !== "null" && !trimmed.startsWith("user-") && trimmed.length >= 2) {
    body.user_name = trimmed
  }
  const vpId = voiceProfileId?.trim?.()
  if (vpId && vpId.length >= 3) {
    body.voice_profile_id = vpId
  }
  if (agentMode && (agentMode === "silent_secretary" || agentMode === "both_agents")) {
    body.agent_mode = agentMode
  }
  let res: Response
  try {
    res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    })
  } catch (e) {
    const isAbort = e instanceof Error && e.name === "AbortError"
    return {
      error: isAbort
        ? "Token request timed out. Voice service may be slow. Retry in a few seconds."
        : "Cannot reach voice service. Check NEXT_PUBLIC_VOICE_AGENT_URL and network.",
    }
  }
  const raw = await res.text()
  if (!res.ok) {
    if (res.status === 503) {
      return {
        error:
          "LiveKit API key/secret not configured on the voice service. Add LIVEKIT_API_KEY and LIVEKIT_API_SECRET to Render.",
      }
    }
    if (res.status === 404 && tokenUrl === "/api/token") {
      return {
        error:
          "Token endpoint not found. For production (e.g. Firebase Hosting), set NEXT_PUBLIC_VOICE_AGENT_URL to your Render service URL and rebuild.",
      }
    }
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
  language?: SupportedLanguage
  autoStart?: boolean
  onDisconnect?: () => void
  /** Called when voice connection is active (mic acquired). Use to delay client SpeechRecognition. */
  onConnectionActive?: () => void
  /** When true, use VoiceCard-style layout (header, badge, voice toggle) for idle/starting/active. */
  cardLayout?: boolean
  selectedVoiceId?: string
  onVoiceChange?: (voiceId: string) => void
  selectedLanguage?: SupportedLanguage
  onLanguageChange?: (lang: SupportedLanguage) => void
  /** For saving conversation to Firestore. If provided, transcript is sent on disconnect. */
  userId?: string | null
  /** User display name for personalized greeting. Passed to token request. */
  userDisplayName?: string | null
  getAuthToken?: () => Promise<string | null>
  /** Called after conversation is saved (e.g. to refetch list). */
  onConversationSaved?: () => void
  /** Called when transcript is added (for live display, e.g. hero transcript box). */
  onTranscriptAdd?: (role: string, content: string) => void
  /** Called when partial transcript is received (real-time word-by-word). */
  onTranscriptPartial?: (role: string, content: string) => void
  /** Optional: Deepgram VoiceProfile ID for cloned/custom voices (dashboard/desktop/iOS, not demo). */
  voiceProfileId?: string | null
  /** Two-agent mode: "silent_secretary" (default, only Clarte speaks) or "both_agents" (user hears both). */
  agentMode?: "silent_secretary" | "both_agents" | null
  /** Called when user changes agent mode. */
  onAgentModeChange?: (mode: "silent_secretary" | "both_agents") => void
}

export function Room({
  mode = "voice-only",
  voice,
  language = "en",
  autoStart = false,
  onDisconnect,
  onConnectionActive,
  cardLayout = false,
  selectedVoiceId = "marin",
  onVoiceChange,
  selectedLanguage = "en",
  onLanguageChange,
  userId,
  userDisplayName,
  getAuthToken,
  onConversationSaved,
  onTranscriptAdd,
  onTranscriptPartial,
  voiceProfileId,
  agentMode = "silent_secretary",
  onAgentModeChange,
}: RoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const transcriptRef = React.useRef<{ role: string; content: string }[]>([])

  const withScreen = mode === "voice-with-screen" || mode === "voice-with-screen-camera"
  const withCamera = mode === "voice-with-screen-camera" || mode === "voice-with-camera"
  const useKrisp = true
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  const addTranscript = useCallback(
    (role: string, content: string) => {
      transcriptRef.current.push({ role, content })
      onTranscriptAdd?.(role, content)
    },
    [onTranscriptAdd]
  )

  const addTranscriptPartial = useCallback(
    (role: string, content: string) => {
      onTranscriptPartial?.(role, content)
    },
    [onTranscriptPartial]
  )

  const disconnect = useCallback(async () => {
    const transcript = [...transcriptRef.current]
    const savedRoomName = roomName
    transcriptRef.current = []
    setToken(null)
    setRoomName(null)
    setStatus("idle")
    setError(null)

    if (userId && getAuthToken) {
      try {
        const authToken = await getAuthToken()
        if (authToken) {
          const baseUrl = (VOICE_AGENT_URL ?? "").replace(/\/$/, "")
          const saveUrl = baseUrl ? `${baseUrl}/conversations/save` : "/api/conversations/save"
          const res = await fetch(saveUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              transcript,
              room_name: savedRoomName,
            }),
          })
          if (res.ok) onConversationSaved?.()
        }
      } catch (e) {
        console.warn("[Clarte Voice] Save conversation failed:", e)
      }
    }

    onDisconnect?.()
  }, [onDisconnect, userId, getAuthToken, roomName, onConversationSaved])

  const startCall = useCallback(async () => {
    if (!LIVEKIT_URL) {
      setError("Voice is not configured. Set NEXT_PUBLIC_LIVEKIT_URL in your environment.")
      setStatus("error")
      return
    }
    setStatus("starting")
    setError(null)
    let stream: MediaStream | null = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (micErr) {
      await new Promise((r) => setTimeout(r, 400))
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (micErr2) {
        console.error("[Clarte Voice] Microphone access denied or failed:", micErr2)
        setError(getMicErrorMessage(micErr2))
        setStatus("error")
        return
      }
    }
    if (stream) stream.getTracks().forEach((t) => t.stop())

    const baseUrl = VOICE_AGENT_URL?.replace(/\/$/, "") ?? ""
    const tokenUrl = baseUrl ? `${baseUrl}/token` : "/api/token"
    if (baseUrl) {
      console.log("[Clarte Voice] Using Render token server:", tokenUrl)
    } else {
      console.log("[Clarte Voice] Using local /api/token for dev")
    }
    if (baseUrl) {
      const healthController = new AbortController()
      const healthTimeout = setTimeout(() => healthController.abort(), 30_000)
      try {
        const healthRes = await fetch(`${baseUrl}/health`, {
          method: "GET",
          signal: healthController.signal,
        })
        clearTimeout(healthTimeout)
        if (!healthRes.ok) {
          setError("Voice service unhealthy. Check Render logs and OPENAI_API_KEY.")
          setStatus("error")
          return
        }
      } catch (e) {
        clearTimeout(healthTimeout)
        setError(
          "Voice service unreachable. Render may be cold-starting. Retry in a few seconds."
        )
        setStatus("error")
        return
      }
    }
    try {
      const tokenController = new AbortController()
      const tokenTimeout = setTimeout(() => tokenController.abort(), 30_000)
      const result = await fetchToken(
        tokenUrl,
        mode,
        voice,
        language,
        userDisplayName,
        voiceProfileId ?? null,
        agentMode ?? null,
        tokenController.signal
      )
      clearTimeout(tokenTimeout)
      if ("error" in result) {
        setError(result.error)
        setStatus("error")
        return
      }
      setToken(result.token)
      setRoomName(result.room)
      setStatus("active")
      onConnectionActive?.()
    } catch (e) {
      setError(
        baseUrl
          ? "Cannot reach voice service. Check NEXT_PUBLIC_VOICE_AGENT_URL and that the Render service is running."
          : (e instanceof Error ? e.message : "Failed to get token")
      )
      setStatus("error")
    }
  }, [mode, voice, language, userDisplayName, voiceProfileId, agentMode, onConnectionActive])

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
      <div
        className={
          isBright
            ? "flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5"
            : "flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5"
        }
      >
        <div
          className={`h-2 w-2 rounded-full bg-emerald-400 ${status === "active" ? "animate-[clarte-pulse_1.5s_ease-in-out_infinite]" : ""}`}
        />
        <span
          className={
            isBright ? "text-sm text-black/60" : "text-sm text-muted-foreground"
          }
        >
          {status === "starting" ? "Connecting…" : status === "active" ? "Active" : "Ready"}
        </span>
      </div>
    </div>
  )

  const pickerDisabled = status === "starting" || status === "active"

  const languageSelect = (
    <Select
      disabled={pickerDisabled}
      value={selectedLanguage}
      onValueChange={(value) => onLanguageChange?.(value as SupportedLanguage)}
    >
      <SelectTrigger className="w-[120px] rounded-full">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGE_OPTIONS.map((opt) => (
          <SelectItem key={opt.langId} value={opt.langId}>
            {opt.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const voiceSelect = (
    <Select
      disabled={pickerDisabled}
      value={selectedVoiceId}
      onValueChange={(value) => onVoiceChange?.(value)}
    >
      <SelectTrigger className="w-[140px] rounded-full">
        <SelectValue placeholder="Voice" />
      </SelectTrigger>
      <SelectContent>
        {VOICE_OPTIONS.map((opt) => (
          <SelectItem key={opt.voiceId} value={opt.voiceId}>
            {opt.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const agentModeToggle = onAgentModeChange ? (
    <div className="flex items-center gap-2">
      <Switch
        id="agent-mode"
        checked={agentMode === "both_agents"}
        onCheckedChange={(checked) =>
          onAgentModeChange(checked ? "both_agents" : "silent_secretary")
        }
        disabled={pickerDisabled}
      />
      <Label htmlFor="agent-mode" className="text-sm cursor-pointer">
        Hear both agents
      </Label>
    </div>
  ) : null

  if (status === "active" && token && roomName) {
    if (cardLayout) {
      return (
        <>
          {cardHeader}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 flex-wrap">
                {languageSelect}
                {voiceSelect}
                {agentModeToggle}
              </div>
              <LiveKitRoom
                serverUrl={LIVEKIT_URL}
                token={token}
                connect={true}
                audio={true}
                video={false}
                onConnected={() => {
                  console.log("[Clarte Voice] Connected to LiveKit room")
                }}
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
                  onTranscriptAdd={addTranscript}
                  onTranscriptPartial={addTranscriptPartial}
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
          onConnected={() => {
            console.log("[Clarte Voice] Connected to LiveKit room")
          }}
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
          <RoomInnerWithKrisp
            onDisconnect={disconnect}
            withScreen={withScreen}
            withCamera={withCamera}
            useKrisp={useKrisp}
            onTranscriptAdd={addTranscript}
            onTranscriptPartial={addTranscriptPartial}
          />
        </LiveKitRoom>
      </div>
    )
  }

  if (cardLayout) {
    return (
        <>
          {cardHeader}
          <div className="space-y-3">
          <div className="flex flex-col items-center gap-4 py-2">
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-3 flex-wrap">
                {languageSelect}
                {voiceSelect}
                {agentModeToggle}
              </div>
              <div className="flex items-center gap-2">
                {autoStart && onDisconnect && status === "active" && (
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
                  {status === "starting" ? "Connecting…" : "Call Clarte"}
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
          {autoStart && onDisconnect && status === "active" && (
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
