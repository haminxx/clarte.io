"use client"

/**
 * Vapi.ai voice-only room. Default Tier 1 flow.
 * Listens for screen/camera keywords in user transcript and triggers onSwitchToScreenMode.
 */
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Loader2, Phone } from "lucide-react"
import { useClarteTheme } from "@/lib/clarte-theme-context"

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? ""
const VAPI_ASSISTANT_ID_DEMO = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_Demo_EN ?? ""
const VAPI_ASSISTANT_ID_LEGACY = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? ""

const SCREEN_KEYWORDS = /\b(screen|read my screen|see my screen|look at my screen|share my screen)\b/i
const CAMERA_KEYWORDS = /\b(see me|look at me|camera|face|see my face|look at my face)\b/i

function detectScreenCameraRequest(text: string): "screen" | "camera" | "both" | null {
  const hasScreen = SCREEN_KEYWORDS.test(text)
  const hasCamera = CAMERA_KEYWORDS.test(text)
  if (hasScreen && hasCamera) return "both"
  if (hasScreen) return "screen"
  if (hasCamera) return "camera"
  return null
}

export type SwitchMode = "screen" | "camera" | "both"

interface VapiRoomProps {
  onDisconnect?: () => void
  autoStart?: boolean
  cardLayout?: boolean
  onTranscriptAdd?: (role: string, content: string) => void
  onTranscriptPartial?: (role: string, content: string) => void
  /** When provided, triggers parallel mode: call this instead of stopping Vapi and switching to LiveKit. */
  onRequestScreenContext?: (mode: SwitchMode) => void
  /** Legacy: when onRequestScreenContext is not set, stop Vapi and switch to full LiveKit Room. */
  onSwitchToScreenMode?: (mode: SwitchMode) => void
  /** Called when Vapi call is active; parent can store ref for vapi.send(). */
  onVapiReady?: (vapi: InstanceType<typeof import("@vapi-ai/web").default>) => void
  /** Optional ref: VapiRoom assigns a function that injects context via vapi.send(add-message). */
  sendContextRef?: React.MutableRefObject<((content: string) => void) | null>
  /** When true, screen/camera context is requested (SecretaryRoom visible). Shows contextual message. */
  screenContextRequested?: boolean
  /** Vapi assistant ID. If not provided, uses Demo tier or legacy NEXT_PUBLIC_VAPI_ASSISTANT_ID. */
  assistantId?: string
}

export function VapiRoom({
  onDisconnect,
  autoStart = false,
  cardLayout = false,
  onTranscriptAdd,
  onTranscriptPartial,
  onRequestScreenContext,
  onSwitchToScreenMode,
  onVapiReady,
  sendContextRef,
  screenContextRequested = false,
  assistantId: assistantIdProp,
}: VapiRoomProps) {
  const resolvedAssistantId =
    assistantIdProp?.trim() ||
    VAPI_ASSISTANT_ID_DEMO ||
    VAPI_ASSISTANT_ID_LEGACY
  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const vapiRef = useRef<InstanceType<typeof import("@vapi-ai/web").default> | null>(null)
  const switchRequestedRef = useRef(false)

  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  const disconnect = useCallback(() => {
    if (vapiRef.current) {
      try {
        vapiRef.current.stop()
      } catch {
        /* ignore */
      }
      vapiRef.current = null
    }
    setStatus("idle")
    setError(null)
    onDisconnect?.()
  }, [onDisconnect])

  const startCall = useCallback(async () => {
    if (!VAPI_PUBLIC_KEY || !resolvedAssistantId) {
      setError("Vapi keys not configured. Add NEXT_PUBLIC_VAPI_PUBLIC_KEY and a tier assistant ID (e.g. NEXT_PUBLIC_VAPI_ASSISTANT_ID_Demo_EN) to your environment (Render dashboard or .env.local).")
      setStatus("error")
      return
    }
    setStatus("connecting")
    setError(null)
    switchRequestedRef.current = false

    try {
      const { default: Vapi } = await import("@vapi-ai/web")
      const vapi = new Vapi(VAPI_PUBLIC_KEY)
      vapiRef.current = vapi

      vapi.on("call-start", () => {
        setStatus("active")
        onVapiReady?.(vapi)
        if (sendContextRef) {
          sendContextRef.current = (content: string) => {
            try {
              vapi.send?.({
                type: "add-message",
                message: { role: "system", content: `[Screen context from Secretary: ${content}]` },
              })
            } catch (e) {
              console.warn("[VapiRoom] sendContext failed:", e)
            }
          }
        }
      })

      vapi.on("call-end", () => {
        if (sendContextRef) sendContextRef.current = null
        if (!switchRequestedRef.current) {
          setStatus("idle")
          vapiRef.current = null
          onDisconnect?.()
        }
      })

      vapi.on("message", (message: { type?: string; role?: string; transcript?: string }) => {
        if (message.type === "transcript" && message.transcript) {
          const role = message.role === "user" ? "user" : "assistant"
          onTranscriptAdd?.(role, message.transcript)
          onTranscriptPartial?.(role, "")

          if (message.role === "user") {
            const mode = detectScreenCameraRequest(message.transcript)
            if (mode) {
              if (onRequestScreenContext) {
                onRequestScreenContext(mode)
              } else if (onSwitchToScreenMode) {
                switchRequestedRef.current = true
                vapi.stop()
                onSwitchToScreenMode(mode)
              }
            }
          }
        }
      })

      vapi.on("error", (e: unknown) => {
        setError(e instanceof Error ? e.message : "Vapi error")
        setStatus("error")
      })

      vapi.start(resolvedAssistantId)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start Vapi call")
      setStatus("error")
    }
  }, [resolvedAssistantId, onTranscriptAdd, onTranscriptPartial, onRequestScreenContext, onSwitchToScreenMode, onVapiReady, sendContextRef, onDisconnect])

  useEffect(() => {
    if (autoStart && status === "idle" && VAPI_PUBLIC_KEY && resolvedAssistantId) {
      startCall()
    }
  }, [autoStart, status, startCall, resolvedAssistantId])

  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop()
        } catch {
          /* ignore */
        }
        vapiRef.current = null
      }
    }
  }, [])

  const configured = Boolean(VAPI_PUBLIC_KEY && resolvedAssistantId)

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
          {status === "connecting" ? "Connecting…" : status === "active" ? "Active" : "Ready"}
        </span>
      </div>
    </div>
  )

  if (status === "active") {
    return (
      <>
        {cardLayout ? cardHeader : null}
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            {screenContextRequested
              ? "Share your screen or camera below so Clarte can see your context."
              : "In call with Clarte. Say \"see my screen\" or \"look at me\" to enable screen share or camera."}
          </p>
          <Button variant="outline" size="sm" onClick={disconnect} className="gap-2">
            <PhoneOff className="h-4 w-4" />
            End call
          </Button>
        </div>
      </>
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
              <div className="flex items-center gap-2">
                {autoStart && onDisconnect && (
                  <Button variant="outline" size="sm" onClick={onDisconnect} className="gap-2">
                    <PhoneOff className="h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={startCall}
                  disabled={!configured || status === "connecting"}
                  className="gap-2 h-12 px-6 rounded-full"
                >
                  {status === "connecting" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Phone className="h-5 w-5" />
                  )}
                  {status === "connecting" ? "Connecting…" : "Call Clarte"}
                </Button>
              </div>
            </div>
          </div>
          {!configured && (
            <p className="text-xs text-muted-foreground text-center max-w-xs mt-2">
              Vapi keys not configured. Add NEXT_PUBLIC_VAPI_PUBLIC_KEY and a tier assistant ID (e.g. NEXT_PUBLIC_VAPI_ASSISTANT_ID_Demo_EN) to your environment (Render dashboard or .env.local).
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
          Voice-only mode — Vapi.ai
        </p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <span className="text-sm text-muted-foreground">
            {status === "connecting" ? "Connecting…" : "Ready"}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 py-6">
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <div className="flex items-center gap-2">
          {autoStart && onDisconnect && (
            <Button variant="outline" size="sm" onClick={onDisconnect} className="gap-2">
              <PhoneOff className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            onClick={startCall}
            disabled={!configured || status === "connecting"}
            className="gap-2 h-12 px-6 rounded-full"
          >
            {status === "connecting" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Phone className="h-5 w-5" />
            )}
            {status === "connecting" ? "Connecting…" : status === "error" ? "Retry" : "Start voice call"}
          </Button>
        </div>
        {!configured && (
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Vapi keys not configured. Add NEXT_PUBLIC_VAPI_PUBLIC_KEY and a tier assistant ID (e.g. NEXT_PUBLIC_VAPI_ASSISTANT_ID_Demo_EN) to your environment (Render dashboard or .env.local).
          </p>
        )}
      </div>
    </div>
  )
}
