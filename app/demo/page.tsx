"use client"

import React, { useState, useCallback, useRef, useEffect, useLayoutEffect, type ComponentType } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { VoiceCard } from "@/components/voice-card"
import type { CallMode } from "@/components/voice/Room"
import type { SwitchMode } from "@/components/voice/VapiRoom"

const DEMO_ASSISTANT_ID =
  process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_Demo_EN ?? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? ""

const LIVEKIT_URL_RAW = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? ""
const isPlaceholderUrl = (url: string) => !url || url.includes("placeholder")
const LIVEKIT_URL = isPlaceholderUrl(LIVEKIT_URL_RAW) ? "" : LIVEKIT_URL_RAW

const ASL_WS_URL = process.env.NEXT_PUBLIC_ASL_WS_URL ?? "ws://localhost:8765"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { useClientSpeechRecognition, isClientSpeechRecognitionSupported } from "@/hooks/use-client-speech-recognition"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"
import { SDHTranscript } from "@/components/voice/SDHTranscript"
import { useASLPipeline } from "@/hooks/use-asl-pipeline"

function switchModeToCallMode(mode: SwitchMode): CallMode {
  if (mode === "screen") return "voice-with-screen"
  if (mode === "camera") return "voice-with-camera"
  return "voice-with-screen-camera"
}

export type TranscriptEntry = { role: string; content: string; emotion?: string }

export default function DemoPage() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  const [inCall, setInCall] = useState(false)
  const [connectionActive, setConnectionActive] = useState(false)
  const [callMode, setCallMode] = useState<"vapi" | "livekit" | "parallel">("vapi")
  const [showSecretaryRoom, setShowSecretaryRoom] = useState(false)
  const [livekitMode, setLivekitMode] = useState<CallMode>("voice-with-screen")
  const [RoomComponent, setRoomComponent] = useState<ComponentType<any> | null>(null)
  const [VapiRoomComponent, setVapiRoomComponent] = useState<ComponentType<any> | null>(null)
  const [SecretaryRoomComponent, setSecretaryRoomComponent] = useState<ComponentType<any> | null>(null)
  const sendContextRef = useRef<((content: string) => void) | null>(null)
  const sendASLRef = useRef<((content: string) => void) | null>(null)
  const aslPipelineRef = useRef<{ sendTest: () => void } | null>(null)
  const [aslEnabled, setAslEnabled] = useState(false)
  const [aslStatus, setAslStatus] = useState<"disconnected" | "connecting" | "ready">("disconnected")

  useEffect(() => {
    if (!inCall) {
      setRoomComponent(null)
      setVapiRoomComponent(null)
      setSecretaryRoomComponent(null)
      return
    }
    import("@/components/voice/VapiRoom").then((m) => setVapiRoomComponent(() => m.VapiRoom))
    if (callMode === "livekit") {
      import("@/components/voice/Room").then((m) => setRoomComponent(() => m.Room))
    } else if (callMode === "parallel" || showSecretaryRoom) {
      import("@/components/voice/SecretaryRoom").then((m) => setSecretaryRoomComponent(() => m.SecretaryRoom))
    }
  }, [inCall, callMode, showSecretaryRoom])
  const [selectedVoice, setSelectedVoice] = useState("aura-2-thalia-en")
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ko" | "es" | "zh" | "ja" | "hi">("en")
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([])
  const [transcriptPartial, setTranscriptPartial] = useState<string>("")
  const [assistantPartial, setAssistantPartial] = useState<string>("")
  const [assistantPartialEmotion, setAssistantPartialEmotion] = useState<string | undefined>()
  const transcriptContainerRef = useRef<HTMLDivElement>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const partialDebounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Prefill from URL (e.g. from Chrome extension popup). Language restricted to en for now.
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const lang = params.get("language")
    const voice = params.get("voice")
    if (lang === "en") setSelectedLanguage("en")
    if (voice) setSelectedVoice(voice)
  }, [])

  const handleStartCall = () => {
    setInCall(true)
  }

  const handleDisconnect = () => {
    setInCall(false)
    setConnectionActive(false)
    setCallMode("vapi")
    setShowSecretaryRoom(false)
    setAslEnabled(false)
    setAslStatus("disconnected")
    setTranscriptEntries([])
    setTranscriptPartial("")
    setAssistantPartial("")
    sendContextRef.current = null
    sendASLRef.current = null
  }

  const handleRequestScreenContext = useCallback((mode: SwitchMode) => {
    setCallMode("parallel")
    setShowSecretaryRoom(true)
  }, [])

  const handleSwitchToScreenMode = useCallback((mode: SwitchMode) => {
    setLivekitMode(switchModeToCallMode(mode))
    setCallMode("livekit")
  }, [])

  const handleSendContext = useCallback((content: string) => {
    sendContextRef.current?.(content)
  }, [])

  const handleEndScreenShare = useCallback(() => {
    setShowSecretaryRoom(false)
  }, [])

  const handleTranscriptAdd = useCallback(
    (role: string, content: string, meta?: { emotion?: string }) => {
      if (partialDebounceRef.current) {
        clearTimeout(partialDebounceRef.current)
        partialDebounceRef.current = undefined
      }
      setTranscriptEntries((prev) => [
        ...prev,
        { role, content, emotion: meta?.emotion },
      ])
      if (role === "user") setTranscriptPartial("")
      else setAssistantPartial("")
    },
    []
  )

  const handleTranscriptPartial = useCallback(
    (role: string, content: string, meta?: { emotion?: string }) => {
      if (role === "user") {
        if (partialDebounceRef.current) {
          clearTimeout(partialDebounceRef.current)
          partialDebounceRef.current = undefined
        }
        setTranscriptPartial(content)
        setAssistantPartial("")
        setAssistantPartialEmotion(undefined)
        return
      }
      if (partialDebounceRef.current) clearTimeout(partialDebounceRef.current)
      partialDebounceRef.current = setTimeout(() => {
        setAssistantPartial(content)
        setTranscriptPartial("")
        setAssistantPartialEmotion(meta?.emotion)
        partialDebounceRef.current = undefined
      }, 12)
    },
    []
  )

  const useClientSTT = isClientSpeechRecognitionSupported()
  useClientSpeechRecognition({
    enabled: inCall && callMode === "livekit" && useClientSTT && connectionActive,
    language: selectedLanguage,
    onTranscriptPartial: handleTranscriptPartial,
    onTranscriptAdd: handleTranscriptAdd,
  })

  // When client STT is used, user transcript comes from the hook; we still need Room's assistant (Clarte) entries.
  const onTranscriptAddFromRoom = useCallback(
    (role: string, content: string) => {
      if (useClientSTT && role === "user") return
      handleTranscriptAdd(role, content)
    },
    [useClientSTT, handleTranscriptAdd]
  )
  const onTranscriptPartialFromRoom = useClientSTT ? undefined : handleTranscriptPartial

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      const container = transcriptContainerRef.current
      if (container) {
        container.scrollTop = container.scrollHeight
      } else {
        transcriptEndRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" })
      }
    })
    return () => cancelAnimationFrame(id)
  }, [transcriptEntries, transcriptPartial, assistantPartial])

  useEffect(() => {
    return () => {
      if (partialDebounceRef.current) clearTimeout(partialDebounceRef.current)
    }
  }, [])

  // ASL pipeline: browser camera + WebSocket to Python inference server
  // Run `npm run asl:server` or `python src/inference.py --browser` to start the server
  useASLPipeline({
    enabled: aslEnabled && inCall && (callMode === "vapi" || callMode === "parallel"),
    wsUrl: ASL_WS_URL,
    onStatusChange: setAslStatus,
    onASLText: (text) => {
      sendASLRef.current?.(text)
      handleTranscriptAdd("user", text)
    },
    pipelineRef: aslPipelineRef,
  })

  return (
    <div className="min-h-screen bg-transparent">
      <Header />

      <main className="relative z-10 mx-auto w-full max-w-[min(48rem,92vw)] xl:max-w-[min(56rem,88vw)] 2xl:max-w-[min(64rem,85vw)] px-4 pt-[clamp(7rem,22vh,14rem)] pb-24">
        <AnimateOnScroll animation="fade-up" animateOnMount delay={100}>
          <div className="mb-8 text-center">
            <h1 className={cn("font-bold text-[clamp(2rem,5vw,3.5rem)] md:text-[clamp(2.25rem,5.5vw,3.75rem)]", isBright ? "text-black" : "text-white")}>
              Try Clarte
            </h1>
            <p className={cn("mx-auto mt-4 max-w-2xl text-[clamp(0.9375rem,1.5vw,1.125rem)]", isBright ? "text-black/60" : "text-white/60")}>
              Say &quot;see my screen&quot; or &quot;look at me&quot; to activate screen-share and camera access
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up" delay={200}>
          <div className="relative mt-6 flex min-h-[60vh] w-full flex-col items-center justify-start">
            <div className="relative z-10 w-full max-w-[min(32rem,92vw)] xl:max-w-[min(36rem,88vw)] 2xl:max-w-[min(42rem,85vw)] flex flex-col gap-4">
              <div data-clarte-card className="w-full rounded-2xl border border-border bg-card/90 p-4 sm:p-5 md:p-6 shadow-2xl backdrop-blur-md mx-auto min-w-0">
                {inCall && (callMode === "vapi" || callMode === "parallel") && VapiRoomComponent ? (
                  <div className="flex flex-col gap-4">
                    <VapiRoomComponent
                      onDisconnect={handleDisconnect}
                      autoStart
                      cardLayout
                      assistantId={DEMO_ASSISTANT_ID}
                      onTranscriptAdd={handleTranscriptAdd}
                      onTranscriptPartial={handleTranscriptPartial}
                      onRequestScreenContext={handleRequestScreenContext}
                      sendContextRef={sendContextRef}
                      sendASLRef={sendASLRef}
                      screenContextRequested={showSecretaryRoom}
                    />
                    {aslEnabled && aslStatus === "ready" && (
                      <p className="text-xs text-muted-foreground text-center">
                        ASL camera active.{" "}
                        <button
                          type="button"
                          onClick={() => aslPipelineRef.current?.sendTest()}
                          className="underline hover:text-foreground"
                        >
                          Test ASL
                        </button>{" "}
                        (sends &quot;test&quot; to verify pipeline)
                      </p>
                    )}
                    {callMode === "parallel" && showSecretaryRoom && SecretaryRoomComponent && (
                      <SecretaryRoomComponent
                        voice={selectedVoice}
                        language={selectedLanguage}
                        onSendContext={handleSendContext}
                        cardLayout
                        onEndScreenShare={handleEndScreenShare}
                      />
                    )}
                  </div>
                ) : inCall && callMode === "livekit" && RoomComponent ? (
                  <RoomComponent
                    mode={livekitMode}
                    voice={selectedVoice}
                    language={selectedLanguage}
                    autoStart
                    onDisconnect={handleDisconnect}
                    onConnectionActive={() => setConnectionActive(true)}
                    cardLayout
                    selectedVoiceId={selectedVoice}
                    onVoiceChange={setSelectedVoice}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                    onTranscriptAdd={onTranscriptAddFromRoom}
                    onTranscriptPartial={onTranscriptPartialFromRoom}
                  />
                ) : inCall ? (
                  <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card/90">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                  </div>
                ) : (
                  <VoiceCard
                    onStartCall={handleStartCall}
                    isActive={false}
                    hideAgentOptions
                    showAllLanguagesGreyed
                    selectedVoiceId={selectedVoice}
                    onVoiceChange={setSelectedVoice}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                    aslEnabled={aslEnabled}
                    onAslChange={setAslEnabled}
                    aslStatus={aslStatus}
                  />
                )}
              </div>
              <div data-clarte-card className="w-full rounded-2xl border border-border bg-card/90 p-4 sm:p-5 md:p-6 shadow-xl backdrop-blur-md mx-auto min-w-0">
                <p className="mb-2 text-[clamp(0.6875rem,1vw,0.75rem)] font-medium uppercase tracking-wider text-muted-foreground">
                  Live transcript (SDH)
                </p>
                <div
                  ref={transcriptContainerRef}
                  className="max-h-[clamp(8rem,20vh,14rem)] overflow-y-auto overflow-x-hidden rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-[clamp(0.8125rem,1.1vw,0.875rem)] text-foreground"
                >
                  <SDHTranscript
                    entries={transcriptEntries}
                    userInterim={transcriptPartial || null}
                    assistantInterim={
                      assistantPartial
                        ? { content: assistantPartial, emotion: assistantPartialEmotion }
                        : null
                    }
                    emptyMessage="Your speech and Clarte's replies will appear here..."
                    className="min-h-[2rem]"
                  />
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </main>

      <Footer />
    </div>
  )
}
