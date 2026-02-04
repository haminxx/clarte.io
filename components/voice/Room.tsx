"use client"

/**
 * Clarte Voice - VAPI.ai Web SDK
 * Starts/stops voice calls using the VAPI assistant (public key + assistant ID from env).
 */
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Loader2 } from "lucide-react"

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? ""
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? ""

export function Room() {
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const vapiRef = useRef<InstanceType<typeof import("@vapi-ai/web").default> | null>(null)

  const stopCall = useCallback(() => {
    const vapi = vapiRef.current
    if (vapi) {
      try {
        vapi.stop()
      } catch (_) {}
      vapiRef.current = null
    }
    setStatus("idle")
    setError(null)
  }, [])

  const startCall = useCallback(async () => {
    if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID) {
      setError("VAPI is not configured. Set NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env.local.")
      setStatus("error")
      return
    }
    setStatus("starting")
    setError(null)
    try {
      const Vapi = (await import("@vapi-ai/web")).default
      const vapi = new Vapi(VAPI_PUBLIC_KEY)
      vapiRef.current = vapi

      vapi.on("call-start", () => setStatus("active"))
      vapi.on("call-end", stopCall)
      vapi.on("error", (e: { message?: string }) => {
        setError(e?.message ?? "Call error")
        setStatus("error")
      })

      vapi.start(VAPI_ASSISTANT_ID)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start call"
      setError(message)
      setStatus("error")
    }
  }, [stopCall])

  useEffect(() => {
    return () => {
      stopCall()
    }
  }, [stopCall])

  const configured = Boolean(VAPI_PUBLIC_KEY && VAPI_ASSISTANT_ID)

  return (
    <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-md max-w-lg mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-foreground/80">Clarte Voice AI Agent (VAPI)</p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <span className="text-sm text-muted-foreground">
            {status === "active" ? "In call" : status === "starting" ? "Starting…" : status === "error" ? "Error" : "Ready"}
          </span>
        </div>
      </div>

      {!configured && (
        <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
          Set NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env.local. Get your key and create an assistant at dashboard.vapi.ai.
        </p>
      )}
      {error && (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {status === "idle" && (
          <Button
            className="flex items-center gap-2"
            onClick={startCall}
            disabled={!configured}
          >
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
        {(status === "active" || status === "error") && (
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={stopCall}
          >
            <PhoneOff className="h-4 w-4" />
            End call
          </Button>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Voice powered by VAPI. Create and configure your assistant at dashboard.vapi.ai.
      </p>
    </div>
  )
}
