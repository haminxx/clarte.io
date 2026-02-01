"use client"

/**
 * Clarte Voice Room - Daily.co WebRTC + Screen Share
 * Joins a Daily room (created by Pipecat backend), starts screen share via getDisplayMedia,
 * and attaches the screen track to the Daily call so the Pipecat/Gemini bot receives video frames.
 */
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Monitor, MonitorOff, PhoneOff, Loader2 } from "lucide-react"

const BACKEND_URL = process.env.NEXT_PUBLIC_PIPECAT_BACKEND_URL || "http://localhost:8000"

interface SessionResponse {
  room_url: string
  token: string
  room_name: string
}

export function Room() {
  const [status, setStatus] = useState<"idle" | "creating" | "joining" | "joined" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const callObjectRef = useRef<any>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const leaveCall = useCallback(() => {
    const call = callObjectRef.current
    if (call) {
      call.leave()
      call.destroy()
      callObjectRef.current = null
    }
    setStatus("idle")
    setError(null)
    setIsScreenSharing(false)
  }, [])

  const startScreenShare = useCallback(async () => {
    const call = callObjectRef.current
    if (!call || status !== "joined") return

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" },
        audio: false,
      })
      const screenVideoTrack = stream.getVideoTracks()[0]
      if (screenVideoTrack) {
        await call.updateInputSettings({
          screenVideo: {
            source: screenVideoTrack,
            send: true,
          },
        })
        setIsScreenSharing(true)
        screenVideoTrack.onended = () => setIsScreenSharing(false)
      }
    } catch (err) {
      console.error("Screen share error:", err)
      setError("Screen share was cancelled or failed")
    }
  }, [status])

  const stopScreenShare = useCallback(() => {
    const call = callObjectRef.current
    if (call) {
      call.updateInputSettings({ screenVideo: false })
      setIsScreenSharing(false)
    }
  }, [])

  const joinRoom = useCallback(async () => {
    setStatus("creating")
    setError(null)

    try {
      const res = await fetch(`${BACKEND_URL}/session`, { method: "POST" })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to create session")
      }
      const { room_url, token }: SessionResponse = await res.json()

      setStatus("joining")

      const { createCallObject } = await import("@daily-co/daily-js")
      const call = createCallObject({
        audioSource: true,
        videoSource: true,
        subscribeToTracksAutomatically: true,
      })
      callObjectRef.current = call

      call.on("joined-meeting", () => {
        setStatus("joined")
      })
      call.on("left-meeting", leaveCall)
      call.on("error", (e: any) => {
        setError(e.errorMsg || "Call error")
        setStatus("error")
      })

      await call.join({ url: room_url, token })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join"
      setError(message)
      setStatus("error")
    }
  }, [leaveCall])

  useEffect(() => {
    return () => {
      leaveCall()
    }
  }, [leaveCall])

  return (
    <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-md max-w-lg mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-foreground/80">Clarte Voice — Direct Multimodal (Pipecat + Daily + Gemini)</p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <span className="text-sm text-muted-foreground">
            {status === "joined" ? "In call" : status === "joining" ? "Joining…" : status === "creating" ? "Creating…" : "Ready"}
          </span>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {status === "idle" && (
          <Button
            className="flex items-center gap-2"
            onClick={joinRoom}
          >
            <Loader2 className="h-4 w-4" />
            Start voice call
          </Button>
        )}
        {(status === "creating" || status === "joining") && (
          <Button disabled className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {status === "creating" ? "Creating room…" : "Joining…"}
          </Button>
        )}
        {status === "joined" && (
          <>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            >
              {isScreenSharing ? (
                <>
                  <MonitorOff className="h-4 w-4" />
                  Stop screen share
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Share screen
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={leaveCall}
            >
              <PhoneOff className="h-4 w-4" />
              End call
            </Button>
          </>
        )}
        {status === "error" && (
          <Button className="flex items-center gap-2" onClick={joinRoom}>
            Try again
          </Button>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Share your screen so the Gemini bot can see it in real time (&lt;1s latency).
      </p>
    </div>
  )
}
