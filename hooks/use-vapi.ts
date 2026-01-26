"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export interface ConversationMessage {
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
  isDemoMode: boolean
}

// Demo conversation messages for when VAPI is not configured
const demoConversation = [
  { role: "assistant" as const, content: "Hello! Welcome to Clarte. I'm your AI assistant. How can I help you today?" },
  { role: "user" as const, content: "I'd like to learn about building a product roadmap." },
  { role: "assistant" as const, content: "Great! I can help you create a product roadmap. Let's start by identifying your key goals. What's the main objective for your product in the next quarter?" },
  { role: "user" as const, content: "We want to launch a mobile app and increase user engagement by 50%." },
  { role: "assistant" as const, content: "Excellent goals! For launching a mobile app, I'd suggest breaking this into phases: 1) Research and planning, 2) Design and prototyping, 3) Development sprints, and 4) Testing and launch. For engagement, we should identify key metrics. Shall I create a timeline with milestones for these?" },
  { role: "user" as const, content: "Yes, that would be helpful. Can you also suggest some engagement features?" },
  { role: "assistant" as const, content: "Absolutely! For engagement, consider: push notifications for personalized updates, gamification elements like streaks and rewards, social features for sharing, and in-app messaging. I'll structure this into a timeline you can export after our call. Would you like to set specific deadlines?" },
]

export function useVapi() {
  const [state, setState] = useState<VapiState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    transcript: "",
    error: null,
    conversationHistory: [],
    isDemoMode: false,
  })

  const vapiRef = useRef<any>(null)
  const isInitializingRef = useRef(false)
  const screenAnalysisIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const captureFrameRef = useRef<(() => Promise<string | null>) | null>(null)
  const lastScreenContextRef = useRef<string>("")
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const setScreenCaptureFunction = useCallback((fn: () => Promise<string | null>) => {
    captureFrameRef.current = fn
  }, [])

  const analyzeScreenForContext = useCallback(async (includeInMessage: boolean = false) => {
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
          userMessage: includeInMessage ? "Analyze the current screen context for the ongoing conversation." : undefined,
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

  // Demo mode simulation
  const runDemoMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: true,
      isListening: true,
      isDemoMode: true,
      error: null,
    }))
    isInitializingRef.current = false

    let messageIndex = 0
    
    // Simulate conversation with delays
    const simulateConversation = () => {
      if (messageIndex < demoConversation.length) {
        const msg = demoConversation[messageIndex]
        
        if (msg.role === "assistant") {
          setState((prev) => ({ ...prev, isSpeaking: true }))
        }
        
        setState((prev) => ({ ...prev, transcript: msg.content }))
        addToHistory(msg.role, msg.content)
        
        setTimeout(() => {
          setState((prev) => ({ ...prev, isSpeaking: false }))
        }, 1500)
        
        messageIndex++
        demoIntervalRef.current = setTimeout(simulateConversation, 3000)
      }
    }

    // Start after a short delay
    demoIntervalRef.current = setTimeout(simulateConversation, 1000)
  }, [addToHistory])

  const startCall = useCallback(async (withScreenShare: boolean = false) => {
    if (isInitializingRef.current || state.isConnected) return

    isInitializingRef.current = true
    setState((prev) => ({ ...prev, error: null, conversationHistory: [], isDemoMode: false }))

    try {
      const response = await fetch("/api/vapi/token")
      
      if (!response.ok) {
        console.log("[v0] Failed to fetch VAPI token, running demo mode")
        runDemoMode()
        return
      }
      
      const data = await response.json()

      // If no VAPI key is configured, run in demo mode
      if (!data.publicKey || data.demoMode) {
        console.log("[v0] VAPI key not configured, running demo mode")
        runDemoMode()
        return
      }

      const { default: Vapi } = await import("@vapi-ai/web")

      const vapi = new Vapi(data.publicKey)
      vapiRef.current = vapi

      vapi.on("call-start", () => {
        setState((prev) => ({ ...prev, isConnected: true, isListening: true }))
        
        if (withScreenShare && captureFrameRef.current) {
          // Periodic screen analysis every 5 seconds (more frequent)
          screenAnalysisIntervalRef.current = setInterval(async () => {
            const analysis = await analyzeScreenForContext()
            if (analysis && vapiRef.current) {
              // Send periodic updates as system messages
              vapiRef.current.send({
                type: "add-message",
                message: { role: "system", content: `[Screen Context Update]: ${analysis}` },
              })
            }
          }, 5000)
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

      vapi.on("message", async (message: any) => {
        if (message.type === "transcript" && message.transcript) {
          setState((prev) => ({ ...prev, transcript: message.transcript }))
          
          // When user speaks, immediately capture and analyze screen if sharing
          if (message.role === "user" && withScreenShare && captureFrameRef.current) {
            // Analyze screen immediately when user speaks
            const screenAnalysis = await analyzeScreenForContext(true)
            
            if (screenAnalysis && vapiRef.current) {
              // Send screen context as a system message right after user speaks
              // This ensures the assistant has screen context for the next response
              vapiRef.current.send({
                type: "add-message",
                message: { 
                  role: "system", 
                  content: `[Current Screen Context]: ${screenAnalysis}\n\nUser just said: "${message.transcript}"` 
                },
              })
              
              // Add to history with screen context
              addToHistory("user", message.transcript, screenAnalysis)
            } else {
              // If no screen analysis, just add normally
              addToHistory("user", message.transcript, lastScreenContextRef.current || undefined)
            }
          } else if (message.role === "user") {
            // User message without screen sharing
            addToHistory("user", message.transcript, lastScreenContextRef.current || undefined)
          } else if (message.role === "assistant") {
            // Assistant messages
            addToHistory("assistant", message.transcript, lastScreenContextRef.current || undefined)
          }
        }
        
        if (message.type === "function-call" && message.functionCall?.name === "analyzeScreen") {
          analyzeScreenForContext(true).then((analysis) => {
            if (analysis && vapiRef.current) {
              vapiRef.current.send({
                type: "add-message",
                message: { role: "system", content: `[Screen Analysis]: ${analysis}` },
              })
            }
          })
        }
      })

      vapi.on("error", (error: any) => {
        console.error("[v0] VAPI error:", error)
        setState((prev) => ({ ...prev, error: error.message || "An error occurred" }))
        isInitializingRef.current = false
      })

      const systemMessage = withScreenShare
        ? `You are a helpful AI assistant for Clarte. You can see the user's screen in real-time. When users speak, you will receive their words along with a detailed analysis of what's currently on their screen. Use this screen context to provide highly relevant, contextual assistance. Reference specific elements you see on their screen when helpful. Help users plan, organize, and achieve their goals. After the call, users can export the conversation as timelines, milestones, or documents.`
        : `You are a helpful AI assistant for Clarte, a voice AI platform. Help users understand services and plan their projects. Keep responses brief and conversational.`

      // Configure assistant with screen analysis support when screen sharing is active
      const assistantConfig: any = {
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [{ role: "system", content: systemMessage }],
        },
        voice: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM" },
        firstMessage: "Hello! Welcome to Clarte. How can I help you plan your goals today?",
      }

      // If screen sharing is enabled, add server URL for webhook support
      // Note: Server-side tools need to be configured in VAPI dashboard
      // This ensures the assistant knows about screen analysis capabilities
      if (withScreenShare) {
        // The screen context will be included in user messages automatically
        // No additional tool configuration needed as we handle it client-side
        console.log("[v0] Screen sharing enabled - screen context will be included in messages")
      }

      await vapi.start(data.assistantId || assistantConfig)
    } catch (error: any) {
      console.log("[v0] Starting demo mode due to:", error?.message || "connection issue")
      // Fall back to demo mode on any error - no error shown to user
      runDemoMode()
    }
  }, [state.isConnected, addToHistory, analyzeScreenForContext, runDemoMode])

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop()
      vapiRef.current = null
    }
    
    if (screenAnalysisIntervalRef.current) {
      clearInterval(screenAnalysisIntervalRef.current)
      screenAnalysisIntervalRef.current = null
    }

    if (demoIntervalRef.current) {
      clearTimeout(demoIntervalRef.current)
      demoIntervalRef.current = null
    }
    
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
    setState((prev) => ({ ...prev, conversationHistory: [] }))
  }, [])

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      const isMuted = vapiRef.current.isMuted()
      vapiRef.current.setMuted(!isMuted)
      setState((prev) => ({ ...prev, isListening: isMuted }))
    }
  }, [])

  const requestScreenAnalysis = useCallback(async () => {
    const analysis = await analyzeScreenForContext()
    if (analysis && vapiRef.current && state.isConnected) {
      vapiRef.current.send({
        type: "add-message",
        message: { role: "system", content: `[Screen Analysis Update]: ${analysis}` },
      })
    }
    return analysis
  }, [analyzeScreenForContext, state.isConnected])

  useEffect(() => {
    return () => {
      if (vapiRef.current) vapiRef.current.stop()
      if (screenAnalysisIntervalRef.current) clearInterval(screenAnalysisIntervalRef.current)
      if (demoIntervalRef.current) clearTimeout(demoIntervalRef.current)
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
