"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { DemoVoiceInput } from "@/components/demo/demo-voice-input"
import { DemoConclusionSection } from "@/components/demo/demo-conclusion-section"
import { useDemoSession } from "@/hooks/use-demo-session"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import type { VoiceInputStatus } from "@/components/ui/voice-input"

export default function DemoPage() {
  const { setTheme } = useClarteTheme()
  const [connectionActive, setConnectionActive] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [selectedVoice, setSelectedVoice] = useState("aura-2-thalia-en")

  useEffect(() => {
    setTheme("bright")
  }, [setTheme])

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
      setVoiceError(null)
      return
    }
    if (phase === "concluded") {
      resetDemo()
      setVoiceError(null)
    }
    startSession()
    setConnectionActive(false)
    setVoiceError(null)
  }, [phase, endSession, resetDemo, startSession])

  const handleSessionConcluded = useCallback(() => {
    void endSession("natural")
    setConnectionActive(false)
  }, [endSession])

  const handleStartNew = useCallback(() => {
    resetDemo()
    setConnectionActive(false)
    setVoiceError(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [resetDemo])

  const pickerDisabled = sessionLive

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pt-[clamp(5.5rem,14vh,9rem)] pb-24">
        <AnimateOnScroll animation="fade-up" animateOnMount delay={80}>
          <div className="mb-12 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8F8F8F]">
              Live demo
            </p>
            <h1
              className="mt-3 text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.04em] text-[#171717]"
              style={{ lineHeight: 1.05 }}
            >
              Try Clarte
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[#4D4D4D]">
              5-minute English demo · Fresh session every time · No account memory stored
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up" delay={160}>
          <div className="flex min-h-[42vh] flex-col items-center justify-center py-4">
            <DemoVoiceInput
              voiceStatus={voiceStatus}
              onToggle={handleToggle}
              remainingSeconds={phase === "active" ? remainingSeconds : null}
              caption={partialCaption || undefined}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              pickerDisabled={pickerDisabled}
              voiceError={voiceError}
              onVoiceError={setVoiceError}
              inCall={sessionLive}
              onRegisterDisconnect={registerDisconnect}
              onSessionConcluded={handleSessionConcluded}
              onTranscriptAdd={addTranscript}
              onTranscriptPartial={addPartial}
              onConnectionActive={() => setConnectionActive(true)}
            />
          </div>
        </AnimateOnScroll>

        <DemoConclusionSection
          visible={phase === "concluded" || phase === "ending"}
          loading={conclusionLoading || phase === "ending"}
          data={conclusion}
          endReason={endReason}
          onStartNew={handleStartNew}
        />
      </main>

      <Footer />
    </div>
  )
}
