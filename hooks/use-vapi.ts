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
  const narrationModeRef = useRef<boolean>(false)

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
          userMessage: includeInMessage ? "Analyze the current screen context for the ongoing conversation. Pay attention to what the user is working on, any visible content, UI elements, text, images, or applications shown on screen." : undefined,
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

  const startCall = useCallback(async (withScreenShare: boolean = false, narrationMode: boolean = false) => {
    if (isInitializingRef.current || state.isConnected) return

    narrationModeRef.current = narrationMode
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

      // Start periodic screen analysis if screen capture is available (works dynamically)
      const startPeriodicAnalysis = () => {
        if (screenAnalysisIntervalRef.current) {
          clearInterval(screenAnalysisIntervalRef.current)
        }
        
        screenAnalysisIntervalRef.current = setInterval(async () => {
          // Check dynamically if screen capture is available
          if (captureFrameRef.current && state.isConnected) {
            const analysis = await analyzeScreenForContext()
            if (analysis && vapiRef.current) {
              if (narrationMode) {
                // In narration mode, send screen content as a user message to trigger narration
                vapiRef.current.send({
                  type: "add-message",
                  message: { 
                    role: "user", 
                    content: `[Screen Update - Please narrate this]: ${analysis}` 
                  },
                })
              } else {
                // In interactive mode, send as system context
                vapiRef.current.send({
                  type: "add-message",
                  message: { role: "system", content: `[Screen Context Update]: ${analysis}` },
                })
              }
            }
          }
        }, narrationMode ? 3000 : 5000) // More frequent updates for narration mode
      }

      vapi.on("call-start", async () => {
        // In narration mode, disable microphone (mute it)
        if (narrationModeRef.current && vapiRef.current) {
          vapiRef.current.setMuted(true)
          setState((prev) => ({ ...prev, isConnected: true, isListening: false }))
        } else {
          setState((prev) => ({ ...prev, isConnected: true, isListening: true }))
        }
        
        // Start periodic analysis if screen capture is available (check dynamically)
        if (captureFrameRef.current) {
          startPeriodicAnalysis()
          
          // In narration mode, immediately analyze and start narrating
          if (narrationModeRef.current) {
            setTimeout(async () => {
              const analysis = await analyzeScreenForContext(true)
              if (analysis && vapiRef.current) {
                vapiRef.current.send({
                  type: "add-message",
                  message: { 
                    role: "user", 
                    content: `[Initial Screen - Please narrate this content]: ${analysis}` 
                  },
                })
              }
            }, 2000) // Wait 2 seconds for call to fully initialize
          }
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
          
          // When user speaks, immediately capture and analyze screen if sharing is active
          // Check dynamically using captureFrameRef instead of withScreenShare flag
          if (message.role === "user" && captureFrameRef.current) {
            // Analyze screen immediately when user speaks
            const screenAnalysis = await analyzeScreenForContext(true)
            
            if (screenAnalysis && vapiRef.current) {
              // Send screen context as a system message right after user speaks
              // This ensures the assistant has screen context for the next response
              vapiRef.current.send({
                type: "add-message",
                message: { 
                  role: "system", 
                  content: `[Current Screen Context]: ${screenAnalysis}\n\nUser just said: "${message.transcript}"\n\nIMPORTANT: The user is speaking about what they see on their screen. Use the screen context above to provide relevant, contextual responses. Reference specific elements visible on screen when helpful. If the user asks about something on screen, respond directly about what you see.` 
                },
              })
              
              // Start periodic analysis if not already running
              if (!screenAnalysisIntervalRef.current) {
                startPeriodicAnalysis()
              }
              
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

      // Enhanced system message - different for each mode
      let systemMessage: string
      let firstMessage: string
      
      if (narrationModeRef.current) {
        // Narration mode: AI continuously reads and narrates screen content, NO user interaction
        systemMessage = `You are a helpful AI narrator for Clarte. Your role is to continuously read and narrate what you see on the user's screen. You will receive real-time screen analysis updates every few seconds.

NARRATION MODE BEHAVIOR:
- Continuously describe what you see on the screen in a natural, conversational way
- Read text content aloud as it appears
- Describe images, UI elements, and visual content
- Narrate changes as they happen on screen
- Speak naturally and conversationally, as if reading an article or document
- DO NOT interact with the user or ask questions
- DO NOT wait for user input - keep narrating as screen content updates
- Focus on the main content and important details
- Use a clear, engaging narration style
- The microphone is disabled - you will not receive any user input

The user has enabled narration mode, so you should start narrating immediately when you receive screen context. Do not greet the user or ask how you can help - just start narrating the screen content.`
        
        firstMessage = undefined // No first message - start narrating immediately
      } else if (withScreenShare) {
        // Voice with screen: Conversation while reading screen
        systemMessage = `You are a helpful AI assistant for Clarte. You have the ability to see the user's screen in real-time while having a conversation. When users speak, you will receive their words along with a detailed analysis of what's currently on their screen. 

IMPORTANT BEHAVIOR:
- Actively read and reference what you see on the user's screen while conversing
- When you receive screen context updates, actively reference what you see on the user's screen
- If the user mentions something visible on their screen, respond directly about it
- Proactively comment on interesting or relevant elements you notice on their screen
- Ask questions about what you see if it would be helpful
- Use screen context to provide highly relevant, contextual assistance
- Reference specific UI elements, text, images, or applications when helpful
- Continue having a natural conversation while being aware of the screen content

Help users plan, organize, and achieve their goals. After the call, users can export the conversation as timelines, milestones, or documents.`
        
        firstMessage = "Hello! Welcome to Clarte. I can see your screen and I'm ready to help. How can I assist you today?"
      } else {
        // Voice only: Normal conversation without screen context
        systemMessage = `You are a helpful AI assistant for Clarte. Help users plan, organize, and achieve their goals. After the call, users can export the conversation as timelines, milestones, or documents.`
        
        firstMessage = "Hello! Welcome to Clarte. How can I help you plan your goals today?"
      }

      // Configure assistant with screen analysis support
      const assistantConfig: any = {
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [{ role: "system", content: systemMessage }],
        },
        voice: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM" },
      }
      
      // Only add firstMessage if it's defined (not for narration mode)
      if (firstMessage) {
        assistantConfig.firstMessage = firstMessage
      }

      // Log screen sharing status
      if (withScreenShare) {
        console.log("[v0] Screen sharing enabled at call start - screen context will be included in messages")
      } else {
        console.log("[v0] Screen sharing can be enabled during the call - screen context will be included automatically when active")
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
    const analysis = await analyzeScreenForContext(true)
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
