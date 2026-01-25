"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface VapiState {
  isConnected: boolean
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  error: string | null
}

export function useVapi() {
  const [state, setState] = useState<VapiState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    transcript: "",
    error: null,
  })

  const vapiRef = useRef<any>(null)
  const isInitializingRef = useRef(false)

  const startCall = useCallback(async () => {
    if (isInitializingRef.current || state.isConnected) return

    isInitializingRef.current = true
    setState((prev) => ({ ...prev, error: null }))

    try {
      // Dynamically import Vapi SDK
      const { default: Vapi } = await import("@vapi-ai/web")

      // Get the public key from our backend
      const response = await fetch("/api/vapi/token")
      const data = await response.json()

      if (!data.publicKey) {
        throw new Error("Failed to get VAPI public key")
      }

      // Initialize Vapi with the public key
      const vapi = new Vapi(data.publicKey)
      vapiRef.current = vapi

      // Set up event listeners
      vapi.on("call-start", () => {
        setState((prev) => ({ ...prev, isConnected: true, isListening: true }))
      })

      vapi.on("call-end", () => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isListening: false,
          isSpeaking: false,
        }))
        isInitializingRef.current = false
      })

      vapi.on("speech-start", () => {
        setState((prev) => ({ ...prev, isSpeaking: true }))
      })

      vapi.on("speech-end", () => {
        setState((prev) => ({ ...prev, isSpeaking: false }))
      })

      vapi.on("message", (message: any) => {
        if (message.type === "transcript" && message.transcript) {
          setState((prev) => ({
            ...prev,
            transcript: message.transcript,
          }))
        }
      })

      vapi.on("error", (error: any) => {
        console.error("[v0] VAPI error:", error)
        setState((prev) => ({
          ...prev,
          error: error.message || "An error occurred",
        }))
        isInitializingRef.current = false
      })

      // Start the call with the assistant configuration
      await vapi.start(data.assistantId || {
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a friendly and helpful AI assistant for Clarte, a voice AI platform. 
              You help users understand our services including ultra-low latency voice synthesis, 
              scalable APIs for real-time interactions, and custom voice creation. 
              Be concise, helpful, and enthusiastic about voice AI technology.
              Keep responses brief and conversational since this is a voice call.`,
            },
          ],
        },
        voice: {
          provider: "11labs",
          voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
        },
        firstMessage: "Hello! Welcome to Clarte. How can I help you explore our voice AI platform today?",
      })
    } catch (error: any) {
      console.error("[v0] Failed to start VAPI call:", error)
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to start call",
      }))
      isInitializingRef.current = false
    }
  }, [state.isConnected])

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop()
      vapiRef.current = null
    }
    setState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      transcript: "",
      error: null,
    })
    isInitializingRef.current = false
  }, [])

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      const isMuted = vapiRef.current.isMuted()
      vapiRef.current.setMuted(!isMuted)
      setState((prev) => ({ ...prev, isListening: isMuted }))
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
    }
  }, [])

  return {
    ...state,
    startCall,
    endCall,
    toggleMute,
  }
}
