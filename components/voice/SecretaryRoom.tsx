"use client"

/**
 * SecretaryRoom – LiveKit room with Secretary agent only (Option C parallel pipeline).
 * Joins with secretary_only token, receives secretary_context via data channel,
 * and forwards to parent via onSendContext for injection into Vapi.
 */
import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Monitor, Video } from "lucide-react"
import { LiveKitRoom, useLocalParticipant, useDataChannel, useRoomContext } from "@livekit/components-react"
import { useClarteTheme } from "@/lib/clarte-theme-context"

type SupportedLanguage = "en" | "ko" | "es" | "zh" | "ja" | "hi"

const LIVEKIT_URL_RAW = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? ""
const VOICE_AGENT_URL_RAW = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ""
const isPlaceholderUrl = (url: string) => !url || url.includes("placeholder")
const LIVEKIT_URL = isPlaceholderUrl(LIVEKIT_URL_RAW) ? "" : LIVEKIT_URL_RAW
const VOICE_AGENT_URL = isPlaceholderUrl(VOICE_AGENT_URL_RAW) ? "" : VOICE_AGENT_URL_RAW

async function fetchSecretaryToken(
  voice?: string,
  language?: SupportedLanguage,
  signal?: AbortSignal
): Promise<{ token: string; room: string } | { error: string }> {
  const baseUrl = VOICE_AGENT_URL?.replace(/\/$/, "") ?? ""
  const tokenUrl = baseUrl ? `${baseUrl}/token` : "/api/token"

  const body: Record<string, unknown> = {
    voice: voice ?? "marin",
    mode: "expert",
    language: language ?? "en",
    secretary_only: true,
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
        ? "Token request timed out. Retry in a few seconds."
        : "Cannot reach voice service. Check NEXT_PUBLIC_VOICE_AGENT_URL and network.",
    }
  }

  const raw = await res.text()
  if (!res.ok) {
    if (res.status === 503) {
      return { error: "LiveKit not configured. Add LIVEKIT_API_KEY and LIVEKIT_API_SECRET." }
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
  return { token, room: room ?? `secretary-${Date.now()}` }
}

interface SecretaryRoomProps {
  voice?: string
  language?: SupportedLanguage
  onSendContext: (content: string) => void
  onError?: (message: string) => void
  cardLayout?: boolean
  /** Called when user wants to end screen share only (does not end Vapi call). */
  onEndScreenShare?: () => void
}

function SecretaryRoomInner({
  onSendContext,
  onEndScreenShare,
  cardLayout,
}: {
  onSendContext: (content: string) => void
  onEndScreenShare?: () => void
  cardLayout?: boolean
}) {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const [screenSharePending, setScreenSharePending] = useState(false)
  const [cameraPending, setCameraPending] = useState(false)
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false)
  const [isCameraEnabled, setIsCameraEnabled] = useState(false)
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  useDataChannel((msg) => {
    try {
      const text = new TextDecoder().decode(msg.payload)
      const data = JSON.parse(text) as { type?: string; content?: string }
      if (data?.type === "secretary_context" && typeof data.content === "string") {
        onSendContext(data.content)
      }
    } catch {
      /* ignore */
    }
  })

  const toggleScreenShare = useCallback(async () => {
    if (!localParticipant) return
    setScreenSharePending(true)
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled)
      setIsScreenShareEnabled(!isScreenShareEnabled)
    } catch (e) {
      console.warn("[SecretaryRoom] Screen share failed:", e)
    } finally {
      setScreenSharePending(false)
    }
  }, [localParticipant, isScreenShareEnabled])

  const toggleCamera = useCallback(async () => {
    if (!localParticipant) return
    setCameraPending(true)
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled)
      setIsCameraEnabled(!isCameraEnabled)
    } catch (e) {
      console.warn("[SecretaryRoom] Camera failed:", e)
    } finally {
      setCameraPending(false)
    }
  }, [localParticipant, isCameraEnabled])

  return (
    <div className={cardLayout ? "flex flex-col items-center gap-3 py-2" : "flex flex-col items-center gap-4 py-4"}>
      <p className="text-sm text-muted-foreground">
        Share your screen or camera so Clarte can see what you&apos;re working on.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant={isScreenShareEnabled ? "default" : "outline"}
          size="sm"
          onClick={toggleScreenShare}
          disabled={screenSharePending}
          className="gap-2"
        >
          <Monitor className="h-4 w-4" />
          {isScreenShareEnabled ? "Stop screen" : "Share screen"}
        </Button>
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
        {onEndScreenShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              room.disconnect()
              onEndScreenShare()
            }}
            className="gap-2"
          >
            End screen share
          </Button>
        )}
      </div>
    </div>
  )
}

export function SecretaryRoom({
  voice = "marin",
  language = "en",
  onSendContext,
  onError,
  cardLayout = false,
  onEndScreenShare,
}: SecretaryRoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  const startConnection = useCallback(async () => {
    if (!LIVEKIT_URL) {
      setError("LiveKit not configured. Set NEXT_PUBLIC_LIVEKIT_URL.")
      setStatus("error")
      onError?.("LiveKit not configured.")
      return
    }
    setStatus("starting")
    setError(null)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30_000)
      const result = await fetchSecretaryToken(voice, language, controller.signal)
      clearTimeout(timeout)
      if ("error" in result) {
        setError(result.error)
        setStatus("error")
        onError?.(result.error)
        return
      }
      setToken(result.token)
      setRoomName(result.room)
      setStatus("active")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to connect"
      setError(msg)
      setStatus("error")
      onError?.(msg)
    }
  }, [voice, language, onError])

  useEffect(() => {
    startConnection()
  }, [startConnection])

  const disconnect = useCallback(() => {
    setToken(null)
    setRoomName(null)
    setStatus("idle")
    setError(null)
    onEndScreenShare?.()
  }, [onEndScreenShare])

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <p className="text-sm text-destructive text-center">{error}</p>
        <Button variant="outline" size="sm" onClick={startConnection}>
          Retry
        </Button>
      </div>
    )
  }

  if (status === "starting") {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        <p className="text-sm text-muted-foreground">Connecting to screen share…</p>
      </div>
    )
  }

  if (status === "active" && token && roomName) {
    const header = cardLayout ? (
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-foreground/80">Screen & camera context</p>
        <div
          className={
            isBright
              ? "flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5"
              : "flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5"
          }
        >
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-[clarte-pulse_1.5s_ease-in-out_infinite]" />
          <span className={isBright ? "text-sm text-black/60" : "text-sm text-muted-foreground"}>
            Active
          </span>
        </div>
      </div>
    ) : null

    return (
      <>
        {header}
        <LiveKitRoom
          serverUrl={LIVEKIT_URL}
          token={token}
          connect={true}
          audio={false}
          video={false}
          onConnected={() => {
            console.log("[SecretaryRoom] Connected to LiveKit")
          }}
          onDisconnected={disconnect}
          onError={(err) => {
            console.error("[SecretaryRoom] LiveKit error:", err)
            setToken(null)
            setRoomName(null)
            setStatus("error")
            setError(err?.message ?? "Connection error")
            onError?.(err?.message ?? "Connection error")
          }}
          className="w-full"
        >
          <SecretaryRoomInner
            onSendContext={onSendContext}
            onEndScreenShare={onEndScreenShare}
            cardLayout={cardLayout}
          />
        </LiveKitRoom>
      </>
    )
  }

  return null
}
