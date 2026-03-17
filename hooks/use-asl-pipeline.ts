"use client"

import React, { useEffect, useRef } from "react"

const FRAME_INTERVAL_MS = 100 // 10 fps
const FRAME_WIDTH = 320
const FRAME_HEIGHT = 240

export interface UseASLPipelineOptions {
  enabled: boolean
  wsUrl: string
  onStatusChange: (status: "disconnected" | "connecting" | "ready") => void
  onASLText: (text: string) => void
  /** Optional ref to receive sendTest() for manual testing without trained models */
  pipelineRef?: React.MutableRefObject<{ sendTest: () => void } | null>
}

/**
 * ASL pipeline: requests camera, connects to WebSocket, sends video frames
 * to the Python inference server for hand sign recognition.
 * Run `python src/inference.py --browser` to start the server.
 */
export function useASLPipeline({
  enabled,
  wsUrl,
  onStatusChange,
  onASLText,
  pipelineRef,
}: UseASLPipelineOptions) {
  const streamRef = useRef<MediaStream | null>(null)
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!enabled) {
      onStatusChange("disconnected")
      return
    }

    onStatusChange("connecting")

    const video = document.createElement("video")
    video.autoplay = true
    video.playsInline = true
    video.muted = true
    video.width = FRAME_WIDTH
    video.height = FRAME_HEIGHT

    const canvas = document.createElement("canvas")
    canvas.width = FRAME_WIDTH
    canvas.height = FRAME_HEIGHT

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      onStatusChange("disconnected")
      return
    }

    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { width: FRAME_WIDTH, height: FRAME_HEIGHT, facingMode: "user" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        video.srcObject = stream
        video.play().catch(() => {})

        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          if (cancelled) return
          onStatusChange("ready")
          if (pipelineRef) {
            pipelineRef.current = {
              sendTest: () => ws.send(JSON.stringify({ type: "test" })),
            }
          }
          frameIntervalRef.current = setInterval(() => {
            if (cancelled || video.readyState < 2 || ws.readyState !== WebSocket.OPEN) return
            ctx.drawImage(video, 0, 0, FRAME_WIDTH, FRAME_HEIGHT)
            try {
              const dataUrl = canvas.toDataURL("image/jpeg", 0.7)
              const base64 = dataUrl.split(",")[1]
              if (base64) {
                ws.send(JSON.stringify({ type: "frame", data: base64 }))
              }
            } catch {
              /* ignore */
            }
          }, FRAME_INTERVAL_MS)
        }

        ws.onclose = () => {
          if (!cancelled) onStatusChange("disconnected")
        }

        ws.onerror = () => {
          if (!cancelled) onStatusChange("disconnected")
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as { type?: string; content?: string }
            if (data?.type === "asl_text" && typeof data.content === "string") {
              onASLText(data.content)
            }
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        if (!cancelled) onStatusChange("disconnected")
      })

    return () => {
      cancelled = true
      if (pipelineRef) pipelineRef.current = null
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
        frameIntervalRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      video.srcObject = null
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      onStatusChange("disconnected")
    }
  }, [enabled, wsUrl, onStatusChange, onASLText, pipelineRef])
}
