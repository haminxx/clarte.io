"use client"

import { useCallback, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageThemeBg } from "@/components/page-theme-bg"
import { ParticleOrb } from "@/components/particle-orb"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { DemoVoiceInput } from "@/components/demo/demo-voice-input"
import { DemoConclusionSection } from "@/components/demo/demo-conclusion-section"
import { useDemoSession } from "@/hooks/use-demo-session"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"
import type { VoiceInputStatus } from "@/components/ui/voice-input"

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_LIVEKIT_URL) {
  console.warn("[Clarte] NEXT_PUBLIC_LIVEKIT_URL is undefined. Voice calls may not work.")
}

export default function DemoPage() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  const [connectionActive, setConnectionActive] = useState(false)

  const [selectedVoice, setSelectedVoice] = useState("aura-2-thalia-en")
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ko" | "es" | "zh" | "ja" | "hi">("en")

  const {
    phase,
    remainingSeconds,
    partialCaption,
    conclusion,
    conclusionLoading,
    endReason,
    startSession,
    endSession,
    resetDemo,
    addTranscript,
    addPartial,
    registerDisconnect,
  } = useDemoSession()

  const sessionLive = phase === "active" || phase === "ending"

  const voiceStatus: VoiceInputStatus = useMemo(() => {
    if (phase === "ending") return "ending"
    if (phase === "active") {
      if (sessionLive && !connectionActive) return "connecting"
      return "active"
    }
    return "idle"
  }, [phase, sessionLive, connectionActive])

  const handleToggle = useCallback(() => {
    if (phase === "active" || phase === "ending") {
      void endSession("manual")
      setConnectionActive(false)
      return
    }
    if (phase === "concluded") {
      resetDemo()
    }
    startSession()
    setConnectionActive(false)
  }, [phase, endSession, resetDemo, startSession])

  const handleSessionConcluded = useCallback(() => {
    void endSession("natural")
    setConnectionActive(false)
  }, [endSession])

  const handleStartNew = useCallback(() => {
    resetDemo()
    setConnectionActive(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [resetDemo])

  const pickerDisabled = phase === "active" || phase === "ending"

  const latestCaption = partialCaption
    ? partialCaption
    : undefined

  return (
    <div className="min-h-screen bg-transparent">
      <PageThemeBg />

      <Header />

      <main className="relative z-10 mx-auto w-full max-w-[min(52rem,94vw)] px-4 pt-[clamp(6rem,18vh,12rem)] pb-24">
        <AnimateOnScroll animation="fade-up" animateOnMount delay={100}>
          <div className="mb-10 text-center">
            <h1 className={cn("font-bold text-[clamp(2rem,5vw,3.25rem)]", isBright ? "text-black" : "text-white")}>
              Try Clarte
            </h1>
            <p className={cn("mx-auto mt-3 max-w-xl text-[clamp(0.9375rem,1.5vw,1.0625rem)]", isBright ? "text-black/60" : "text-white/60")}>
              5-minute demo · Fresh session every time · No account memory stored
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up" delay={200}>
          <div className="relative flex min-h-[50vh] flex-col items-center justify-center">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2">
              <ParticleOrb variant={isBright ? "bright" : "dark"} />
            </div>

            <div className="relative z-20 flex w-full justify-center py-8">
              {(phase === "idle" || phase === "active" || phase === "ending" || phase === "concluded") && (
                <DemoVoiceInput
                  voiceStatus={voiceStatus}
                  onToggle={handleToggle}
                  remainingSeconds={phase === "active" ? remainingSeconds : null}
                  caption={latestCaption}
                  selectedVoice={selectedVoice}
                  onVoiceChange={setSelectedVoice}
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  pickerDisabled={pickerDisabled}
                  isBright={isBright}
                  inCall={sessionLive}
                  onRegisterDisconnect={registerDisconnect}
                  onSessionConcluded={handleSessionConcluded}
                  onTranscriptAdd={addTranscript}
                  onTranscriptPartial={addPartial}
                  onConnectionActive={() => setConnectionActive(true)}
                />
              )}
            </div>
          </div>
        </AnimateOnScroll>

        <DemoConclusionSection
          visible={phase === "concluded" || phase === "ending"}
          loading={conclusionLoading || phase === "ending"}
          data={conclusion}
          endReason={endReason}
          onStartNew={handleStartNew}
          isBright={isBright}
        />
      </main>

      <Footer />
    </div>
  )
}
