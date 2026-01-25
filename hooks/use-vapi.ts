"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface ConversationMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  screenContext?: string
}

interface VapiState {
  isConnected: boolean
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  error: string | null
  conversationHistory: ConversationMessage[]
}

export function useVapi() {
  const [state, setState] = useState<VapiState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    transcript: "",
    error: null,
    conversationHistory: [],
  })

  const vapiRef = useRef<any>(null)
  const isInitializingRef = useRef(false)
  const screenAnalysisIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const captureFrameRef = useRef<(() => Promise<string | null>) | null>(null)
  const lastScreenContextRef = useRef<string>("")

  // Set the capture frame function from outside
  const setScreenCaptureFunction = useCallback((fn: () => Promise<string | null>) => {
    captureFrameRef.current = fn
  }, [])

  // Analyze screen and inject context into conversation
  const analyzeScreenForContext = useCallback(async () => {
    if (!captureFrameRef.current || !state.isConnected) return null

    try {
      const frame = await captureFrameRef.current()
      if (!frame) return null

      const response = await fetch("/api/vision/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: frame,
          conversationContext: state.conversationHistory
            .slice(-5)
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n"),
        }),
      })

      const data = await response.json()
      if (data.analysis) {
        lastScreenContextRef.current = data.analysis
        return data.analysis
      }
      return null
    } catch (error) {
      console.error("[v0] Screen analysis error:", error)
      return null
    }
  }, [state.isConnected, state.conversationHistory])

  // Add message to conversation history
  const addToHistory = useCallback((role: "user" | "assistant" | "system", content: string, screenContext?: string) => {
    setState((prev) => ({
      ...prev,
      conversationHistory: [
        ...prev.conversationHistory,
        {
          role,
          content,
          timestamp: Date.now(),
          screenContext,
        },
      ],
    }))
  }, [])

  const startCall = useCallback(async (withScreenShare: boolean = false) => {
    if (isInitializingRef.current || state.isConnected) return

    isInitializingRef.current = true
    setState((prev) => ({ ...prev, error: null, conversationHistory: [] }))

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
        
        // If screen sharing is enabled, start periodic analysis
        if (withScreenShare && captureFrameRef.current) {
          screenAnalysisIntervalRef.current = setInterval(async () => {
            await analyzeScreenForContext()
          }, 10000) // Analyze every 10 seconds
        }
      })

      vapi.on("call-end", () => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isListening: false,
          isSpeaking: false,
        }))
        isInitializingRef.current = false
        
        // Clear screen analysis interval
        if (screenAnalysisIntervalRef.current) {
          clearInterval(screenAnalysisIntervalRef.current)
          screenAnalysisIntervalRef.current = null
        }
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
          
          // Add to conversation history
          if (message.role === "assistant" || message.role === "user") {
            addToHistory(
              message.role,
              message.transcript,
              lastScreenContextRef.current || undefined
            )
          }
        }
        
        // Handle function calls for screen analysis
        if (message.type === "function-call" && message.functionCall?.name === "analyzeScreen") {
          analyzeScreenForContext().then((analysis) => {
            if (analysis && vapiRef.current) {
              // Send screen analysis back to the assistant
              vapiRef.current.send({
                type: "add-message",
                message: {
                  role: "system",
                  content: `[Screen Analysis]: ${analysis}`,
                },
              })
            }
          })
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

      // Build system message with screen sharing context
      const systemMessage = withScreenShare
        ? `You are a friendly and helpful AI assistant for Clarte, a voice AI platform.
You have the ability to see the user's screen. You will periodically receive screen analysis updates in system messages prefixed with [Screen Analysis].
When you receive screen context, use it to provide more relevant and helpful responses.
You can reference what you see on the user's screen to assist them better.
Be concise, helpful, and proactive in offering assistance based on what you observe.
Keep responses brief and conversational since this is a voice call.
After the call, the user can export our conversation as a timeline, milestones, meeting notes, or various document formats.`
        : `You are a friendly and helpful AI assistant for Clarte, a voice AI platform.
You help users understand our services including ultra-low latency voice synthesis, scalable APIs for real-time interactions, and custom voice creation.
Be concise, helpful, and enthusiastic about voice AI technology.
Keep responses brief and conversational since this is a voice call.`

      // Start the call with the assistant configuration
      await vapi.start(data.assistantId || {
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemMessage,
            },
          ],
          ...(withScreenShare && {
            functions: [
              {
                name: "analyzeScreen",
                description: "Request analysis of the user's current screen content",
                parameters: {
                  type: "object",
                  properties: {},
                },
              },
            ],
          }),
        },
        voice: {
          provider: "11labs",
          voiceId: "21m00Tcm4TlvDq8ikWAM",
        },
        firstMessage: withScreenShare
          ? "Hello! I can see your screen now. Feel free to show me what you're working on, and I'll help you with anything I can see. What would you like assistance with?"
          : "Hello! Welcome to Clarte. How can I help you explore our voice AI platform today?",
      })
    } catch (error: any) {
      console.error("[v0] Failed to start VAPI call:", error)
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to start call",
      }))
      isInitializingRef.current = false
    }
  }, [state.isConnected, addToHistory, analyzeScreenForContext])

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop()
      vapiRef.current = null
    }
    
    if (screenAnalysisIntervalRef.current) {
      clearInterval(screenAnalysisIntervalRef.current)
      screenAnalysisIntervalRef.current = null
    }
    
    // Keep conversation history for export
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      transcript: "",
      error: null,
    }))
    isInitializingRef.current = false
  }, [])

  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      conversationHistory: [],
    }))
  }, [])

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      const isMuted = vapiRef.current.isMuted()
      vapiRef.current.setMuted(!isMuted)
      setState((prev) => ({ ...prev, isListening: isMuted }))
    }
  }, [])

  // Manually trigger screen analysis
  const requestScreenAnalysis = useCallback(async () => {
    const analysis = await analyzeScreenForContext()
    if (analysis && vapiRef.current && state.isConnected) {
      vapiRef.current.send({
        type: "add-message",
        message: {
          role: "system",
          content: `[Screen Analysis Update]: ${analysis}`,
        },
      })
    }
    return analysis
  }, [analyzeScreenForContext, state.isConnected])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
      if (screenAnalysisIntervalRef.current) {
        clearInterval(screenAnalysisIntervalRef.current)
      }
    }
  }, [])

  return {
    ...state,
    startCall,
    endCall,
    toggleMute,
    clearHistory,
    setScreenCaptureFunction,
    requestScreenAnalysis,
  }
}
