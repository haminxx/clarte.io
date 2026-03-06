"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { VoiceCard } from "@/components/voice-card"

const Room = dynamic(() => import("@/components/voice/Room").then((m) => ({ default: m.Room })), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card/90">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
    </div>
  ),
})
import { ParticleOrb } from "@/components/particle-orb"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { useClientSpeechRecognition, isClientSpeechRecognitionSupported } from "@/hooks/use-client-speech-recognition"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_LIVEKIT_URL) {
  console.warn("[Clarte] NEXT_PUBLIC_LIVEKIT_URL is undefined. Voice calls may not work.")
}

export default function DemoPage() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  const [inCall, setInCall] = useState(false)
  const [connectionActive, setConnectionActive] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState("aura-2-thalia-en")
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ko" | "es" | "zh" | "ja" | "hi">("en")
  const [transcriptEntries, setTranscriptEntries] = useState<{ role: string; content: string }[]>([])
  const [transcriptPartial, setTranscriptPartial] = useState<string>("")
  const transcriptContainerRef = useRef<HTMLDivElement>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Prefill from URL (e.g. from Chrome extension popup)
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const lang = params.get("language")
    const voice = params.get("voice")
    if (lang && ["en", "ko", "es", "zh", "ja", "hi"].includes(lang)) {
      setSelectedLanguage(lang as "en" | "ko" | "es" | "zh" | "ja" | "hi")
    }
    if (voice) setSelectedVoice(voice)
  }, [])

  const handleStartCall = () => {
    setInCall(true)
  }

  const handleDisconnect = () => {
    setInCall(false)
    setConnectionActive(false)
    setTranscriptEntries([])
    setTranscriptPartial("")
  }

  const handleTranscriptAdd = useCallback((role: string, content: string) => {
    setTranscriptEntries((prev) => [...prev, { role, content }])
    setTranscriptPartial("")
  }, [])

  const handleTranscriptPartial = useCallback((role: string, content: string) => {
    if (role === "user") setTranscriptPartial(content)
  }, [])

  const useClientSTT = isClientSpeechRecognitionSupported()
  useClientSpeechRecognition({
    enabled: inCall && useClientSTT && connectionActive,
    language: selectedLanguage,
    onTranscriptPartial: handleTranscriptPartial,
    onTranscriptAdd: handleTranscriptAdd,
  })

  useEffect(() => {
    const container = transcriptContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    } else {
      transcriptEndRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" })
    }
  }, [transcriptEntries, transcriptPartial])

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
            <div className="pointer-events-none absolute left-1/2 top-24 h-[150vmin] w-[150vmin] -translate-x-1/2 -translate-y-1/2 overflow-hidden sm:top-28">
              <ParticleOrb variant={isBright ? "bright" : "dark"} />
            </div>
            <div className="relative z-20 w-full max-w-[min(32rem,92vw)] xl:max-w-[min(36rem,88vw)] 2xl:max-w-[min(42rem,85vw)] flex flex-col gap-4">
              <div className="w-full rounded-2xl border border-border bg-card/90 p-4 sm:p-5 md:p-6 shadow-2xl backdrop-blur-md mx-auto min-w-0">
                {inCall ? (
                  <Room
                    mode="voice-only"
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
                    onTranscriptAdd={useClientSTT ? undefined : handleTranscriptAdd}
                    onTranscriptPartial={useClientSTT ? undefined : handleTranscriptPartial}
                  />
                ) : (
                  <VoiceCard
                    onStartCall={handleStartCall}
                    isActive={false}
                    selectedVoiceId={selectedVoice}
                    onVoiceChange={setSelectedVoice}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                  />
                )}
              </div>
              <div className="w-full rounded-2xl border border-border bg-card/90 p-4 sm:p-5 md:p-6 shadow-xl backdrop-blur-md mx-auto min-w-0">
                <p className="mb-2 text-[clamp(0.6875rem,1vw,0.75rem)] font-medium uppercase tracking-wider text-muted-foreground">
                  Live transcript (Speech to text)
                </p>
                <div
                  ref={transcriptContainerRef}
                  className="max-h-[clamp(8rem,20vh,14rem)] overflow-y-auto overflow-x-hidden rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-[clamp(0.8125rem,1.1vw,0.875rem)] text-foreground flex flex-col gap-1.5 justify-end"
                >
                  {transcriptEntries.length === 0 && !transcriptPartial ? (
                    <span className="text-muted-foreground">Your speech and Clarte&apos;s replies will appear here...</span>
                  ) : (
                    <div className="space-y-1.5">
                      {transcriptEntries.map((entry, i) => (
                        <div key={i} className={cn("leading-tight", entry.role === "user" ? "text-foreground/90" : "text-blue-600 dark:text-blue-400")}>
                          <span className="font-medium">{entry.role === "user" ? "You: " : "Clarte: "}</span>
                          {entry.content}
                        </div>
                      ))}
                      {transcriptPartial ? (
                        <div className="leading-tight text-foreground/90">
                          <span className="font-medium">You: </span>
                          <span>
                            {transcriptPartial}
                            <span className="animate-pulse">|</span>
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )}
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
