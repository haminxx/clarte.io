"use client"

import { useState, useCallback, useRef } from "react"

interface ScreenShareState {
  isSharing: boolean
  stream: MediaStream | null
  error: string | null
}

export function useScreenShare() {
  const [state, setState] = useState<ScreenShareState>({
    isSharing: false,
    stream: null,
    error: null,
  })
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
        },
        audio: false,
      })

      // Create hidden video element to capture frames
      const video = document.createElement("video")
      video.srcObject = stream
      video.autoplay = true
      video.muted = true
      videoRef.current = video

      // Create canvas for capturing frames
      const canvas = document.createElement("canvas")
      canvasRef.current = canvas

      // Handle stream end (user clicks "Stop sharing")
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }

      await video.play()

      setState({
        isSharing: true,
        stream,
        error: null,
      })

      return stream
    } catch (error: any) {
      console.error("[v0] Screen share error:", error)
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to start screen sharing",
      }))
      return null
    }
  }, [])

  const stopScreenShare = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop())
    }
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current = null
    }

    canvasRef.current = null

    setState({
      isSharing: false,
      stream: null,
      error: null,
    })
  }, [state.stream])

  const captureFrame = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current || !state.isSharing) {
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0)

    // Convert to base64 JPEG (smaller than PNG)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7)
    return dataUrl
  }, [state.isSharing])

  return {
    ...state,
    startScreenShare,
    stopScreenShare,
    captureFrame,
  }
}
