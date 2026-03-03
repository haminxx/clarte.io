"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Room } from "@/components/voice/Room"
import { VoiceCard } from "@/components/voice-card"
import { ParticleOrb } from "@/components/particle-orb"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { useClientSpeechRecognition, isClientSpeechRecognitionSupported } from "@/hooks/use-client-speech-recognition"
import { PageThemeBg } from "@/components/page-theme-bg"
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
  const [selectedVoice, setSelectedVoice] = useState("marin")
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ko">("en")
  const [transcriptEntries, setTranscriptEntries] = useState<{ role: string; content: string }[]>([])
  const [transcriptPartial, setTranscriptPartial] = useState<string>("")
  const transcriptContainerRef = useRef<HTMLDivElement>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

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
    if (role === "user") {
      setTranscriptEntries([{ role, content }])
    } else {
      setTranscriptEntries((prev) => [...prev, { role, content }])
    }
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
      <PageThemeBg />

      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-[clamp(7rem,22vh,14rem)] pb-24">
        <AnimateOnScroll animation="fade-up" animateOnMount delay={100}>
          <div className="mb-8 text-center">
            <h1 className={cn("text-4xl font-bold md:text-5xl", isBright ? "text-black" : "text-white")}>
              Try Clarte
            </h1>
            <p className={cn("mx-auto mt-4 max-w-2xl text-lg", isBright ? "text-black/60" : "text-white/60")}>
              Start a voice call with Clarte and see the live transcript in real time.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up" delay={200}>
          <div className="relative flex min-h-[calc(100vh-12rem)] w-full flex-col items-center justify-center">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[1100px] w-[1100px] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
              <ParticleOrb />
            </div>
            <div className="relative z-20 w-full max-w-lg flex flex-col gap-4">
              <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md mx-auto">
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
              <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-md mx-auto">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Live transcript (Speech to text)
                </p>
                <div
                  ref={transcriptContainerRef}
                  className="max-h-[3rem] overflow-hidden rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground flex flex-col justify-end"
                >
                  {transcriptEntries.filter((e) => e.role === "user").length === 0 && !transcriptPartial ? (
                    <span className="text-muted-foreground">Your speech will appear here...</span>
                  ) : (
                    <div className="line-clamp-2 leading-tight">
                      {transcriptPartial ? (
                        <div className="truncate">
                          <span className="text-foreground/90">
                            {transcriptPartial}
                            <span className="animate-pulse">|</span>
                          </span>
                        </div>
                      ) : (
                        transcriptEntries
                          .filter((e) => e.role === "user")
                          .slice(-1)
                          .map((entry, i) => (
                            <div key={i} className="truncate">
                              {entry.content}
                            </div>
                          ))
                      )}
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
