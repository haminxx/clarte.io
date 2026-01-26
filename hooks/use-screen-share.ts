"use client"

import { useState, useCallback, useRef } from "react"

interface ScreenShareState {
  isSharing: boolean
  stream: MediaStream | null
  error: string | null
  isSupported: boolean
  usesFallback: boolean
  fallbackImage: string | null
}

export function useScreenShare() {
  const [state, setState] = useState<ScreenShareState>({
    isSharing: false,
    stream: null,
    error: null,
    isSupported: true,
    usesFallback: false,
    fallbackImage: null,
  })
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Check if screen sharing is available
  const checkScreenShareSupport = useCallback(async (): Promise<boolean> => {
    // Check if we're in a secure context
    if (!window.isSecureContext) {
      return false
    }
    
    // Check if getDisplayMedia exists
    if (!navigator.mediaDevices?.getDisplayMedia) {
      return false
    }
    
    // Check permissions policy (will fail in restricted iframes)
    try {
      // Try to check if display-capture is allowed
      const permissionStatus = await navigator.permissions.query({ 
        name: "display-capture" as PermissionName 
      }).catch(() => null)
      
      if (permissionStatus?.state === "denied") {
        return false
      }
    } catch {
      // Permission query not supported, we'll try the actual API
    }
    
    return true
  }, [])

  const startScreenShare = useCallback(async () => {
    try {
      // First check basic support
      const supported = await checkScreenShareSupport()
      
      if (!supported) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          error: "Screen sharing not available in this context. Use the upload option instead.",
        }))
        return null
      }

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
        isSupported: true,
        usesFallback: false,
        fallbackImage: null,
      })

      return stream
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      // Check if this is a permissions policy error
      if (errorMessage.includes("permissions policy") || errorMessage.includes("disallowed")) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          usesFallback: true,
          error: "Screen sharing is restricted in this environment. Please use the screenshot upload option, or deploy the app to use full screen sharing.",
        }))
      } else if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
        setState(prev => ({
          ...prev,
          error: "Screen sharing was cancelled or denied.",
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: errorMessage || "Failed to start screen sharing",
        }))
      }
      return null
    }
  }, [checkScreenShareSupport])

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
      isSupported: state.isSupported,
      usesFallback: false,
      fallbackImage: null,
    })
  }, [state.stream, state.isSupported])

  const captureFrame = useCallback(async (): Promise<string | null> => {
    // If using fallback image, return that
    if (state.usesFallback && state.fallbackImage) {
      return state.fallbackImage
    }
    
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
  }, [state.isSharing, state.usesFallback, state.fallbackImage])

  // Fallback: Upload screenshot manually
  const uploadScreenshot = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setState(prev => ({
          ...prev,
          isSharing: true,
          usesFallback: true,
          fallbackImage: dataUrl,
          error: null,
        }))
        resolve(dataUrl)
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }, [])

  const clearFallbackImage = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSharing: false,
      usesFallback: false,
      fallbackImage: null,
    }))
  }, [])

  return {
    ...state,
    startScreenShare,
    stopScreenShare,
    captureFrame,
    uploadScreenshot,
    clearFallbackImage,
    fileInputRef,
  }
}
