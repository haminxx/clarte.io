"use client"

import { useState, useCallback, useEffect } from "react"
import { Waveform } from "./waveform"
import { Button } from "@/components/ui/button"
import { Play, Square } from "lucide-react"
import { AnimateOnScroll } from "./animate-on-scroll"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

type VoiceSample = "Marin" | "Victoria" | null

function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined") return []
  return window.speechSynthesis.getVoices()
}

/** Marin = Clarte's default voice (Deepgram Aura, e.g. Thalia). Prefer a clear English voice for preview. */
function getMarinVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const en = voices.filter((v) => v.lang.startsWith("en"))
  const marin = en.find(
    (v) =>
      v.name.toLowerCase().includes("rachel") ||
      v.name.toLowerCase().includes("marin") ||
      v.name.includes("Samantha") ||
      v.name.includes("Karen")
  )
  const female = en.filter(
    (v) =>
      v.name.toLowerCase().includes("female") ||
      v.name.includes("Zira") ||
      v.name.includes("Samantha") ||
      v.name.includes("Karen") ||
      v.name.includes("Victoria") ||
      v.name.includes("Google")
  )
  return marin ?? female[0] ?? en[0] ?? null
}

export function FeaturesSection() {
  const { theme } = useClarteTheme()
  const darkStroke = theme === "bright"
  const [playingSample, setPlayingSample] = useState<VoiceSample>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const loadVoices = () => setVoices(getVoices())
    loadVoices()
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const playSample = useCallback(
    (name: "Marin" | "Victoria") => {
      if (typeof window === "undefined") return

      if (playingSample === name) {
        setPlayingSample(null)
        if ("speechSynthesis" in window) window.speechSynthesis.cancel()
        return
      }

      if (name === "Marin") {
        const audio = new Audio("/audio/marin-sample.mp3")
        const onEnd = () => setPlayingSample(null)
        audio.onended = onEnd
        audio.onerror = () => {
          onEnd()
          const synth = window.speechSynthesis
          synth.cancel()
          const text = "Hello! I'm Clarte, your executive assistant."
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.rate = 0.95
          utterance.pitch = 1
          const preferred = getMarinVoice(voices)
          if (preferred) utterance.voice = preferred
          utterance.onend = onEnd
          utterance.onerror = onEnd
          setPlayingSample("Marin")
          synth.speak(utterance)
        }
        setPlayingSample("Marin")
        audio.play().catch(() => audio.onerror?.(new Event("error")))
        return
      }

      if (!("speechSynthesis" in window)) return
      const synth = window.speechSynthesis
      synth.cancel()
      const text = "Hello! My name is Victoria."
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1
      const enVoices = voices.filter((v) => v.lang.startsWith("en"))
      const femaleVoices = enVoices.filter(
        (v) =>
          v.name.toLowerCase().includes("female") ||
          v.name.includes("Zira") ||
          v.name.includes("Samantha") ||
          v.name.includes("Karen") ||
          v.name.includes("Victoria") ||
          v.name.includes("Google")
      )
      const candidates = femaleVoices.length > 0 ? femaleVoices : enVoices
      const preferred = candidates[1] ?? candidates[0]
      if (preferred) utterance.voice = preferred
      utterance.onend = () => setPlayingSample(null)
      utterance.onerror = () => setPlayingSample(null)
      setPlayingSample("Victoria")
      synth.speak(utterance)
    },
    [playingSample, voices]
  )

  return (
    <section className="relative bg-card py-12 sm:py-16 md:py-24 w-full overflow-x-hidden">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] md:h-[600px] md:w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-600/10 via-transparent to-transparent blur-3xl" />
      </div>
      
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 text-center w-full">
        <AnimateOnScroll animation="fade-up">
          <h2 className="mb-4 text-balance text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground px-2">
            Built for Real-Time Voice Intelligence
          </h2>
          <p className="mx-auto mb-8 sm:mb-12 max-w-xl text-sm sm:text-base text-muted-foreground px-4">
            Flawless speech precision, ultra-low latency, and human-level
            clarity — even in complex, high-velocity conversations.
          </p>
        </AnimateOnScroll>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 w-full">
          {/* AI Agent Card - Now on the left */}
          <AnimateOnScroll animation="fade-up" delay={80}>
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Clarte Agent</h3>
              <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5", theme === "bright" ? "bg-black/5" : "bg-secondary")}>
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className={cn("text-sm", theme === "bright" ? "text-black/60" : "text-muted-foreground")}>Marin</span>
              </div>
            </div>
            <Waveform variant="ai" darkStroke={darkStroke} />
            <div className="mt-4 flex items-center gap-4">
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => playSample("Marin")}
                aria-label={playingSample === "Marin" ? "Stop sample" : "Play Marin sample"}
              >
                {playingSample === "Marin" ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  Human-accurate pronunciation.
                </p>
                <p className="text-xs text-muted-foreground">
                  Names and terms rendered perfectly.
                </p>
              </div>
            </div>
          </div>
          </AnimateOnScroll>

          {/* Human Voice Card - Now on the right */}
          <AnimateOnScroll animation="fade-up" delay={160}>
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Human Voice</h3>
              <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5", theme === "bright" ? "bg-black/5" : "bg-secondary")}>
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className={cn("text-sm", theme === "bright" ? "text-black/60" : "text-muted-foreground")}>Victoria</span>
              </div>
            </div>
            <Waveform variant="human" darkStroke={darkStroke} />
            <div className="mt-4 flex items-center gap-4">
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => playSample("Victoria")}
                aria-label={playingSample === "Victoria" ? "Stop sample" : "Play Victoria sample"}
              >
                {playingSample === "Victoria" ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  Latency under 100ms.
                </p>
                <p className="text-xs text-muted-foreground">
                  Responds faster than the blink of an eye.
                </p>
              </div>
            </div>
          </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
