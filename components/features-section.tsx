"use client"

import { useState, useCallback, useEffect } from "react"
import { Waveform } from "./waveform"
import { Button } from "@/components/ui/button"
import { Play, Square } from "lucide-react"

type VoiceSample = "Jane" | "Victoria" | null

function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined") return []
  return window.speechSynthesis.getVoices()
}

export function FeaturesSection() {
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
    (name: "Jane" | "Victoria") => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return

      const synth = window.speechSynthesis
      synth.cancel()

      if (playingSample === name) {
        setPlayingSample(null)
        return
      }

      const text = `Hello! My name is ${name}.`
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
      const preferred = name === "Jane" ? candidates[0] : candidates[1] ?? candidates[0]
      if (preferred) utterance.voice = preferred

      utterance.onend = () => setPlayingSample(null)
      utterance.onerror = () => setPlayingSample(null)

      setPlayingSample(name)
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
        <h2 className="mb-4 text-balance text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground px-2">
          Built for Real-Time
          <br />
          Voice Intelligence
        </h2>
        <p className="mx-auto mb-8 sm:mb-12 max-w-xl text-sm sm:text-base text-muted-foreground px-4">
          Flawless speech precision, ultra-low latency, and human-level
          clarity — even in complex, high-velocity conversations.
        </p>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 w-full">
          {/* AI Agent Card - Now on the left */}
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Clarte Agent</h3>
              <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-muted-foreground">Jane</span>
              </div>
            </div>
            <Waveform variant="ai" />
            <div className="mt-4 flex items-center gap-4">
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => playSample("Jane")}
                aria-label={playingSample === "Jane" ? "Stop sample" : "Play Jane sample"}
              >
                {playingSample === "Jane" ? (
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

          {/* Human Voice Card - Now on the right */}
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Human Voice</h3>
              <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-muted-foreground">Victoria</span>
              </div>
            </div>
            <Waveform variant="human" />
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
        </div>
      </div>
    </section>
  )
}
