"use client"

import { useState } from "react"
import Link from "next/link"
import { ParticleOrb } from "./particle-orb"
import { Room } from "@/components/voice/Room"
import { VoiceCard } from "@/components/voice-card"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const [inCall, setInCall] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState("marin")
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ko">("en")

  const handleStartCall = () => {
    setInCall(true)
  }

  const handleDisconnect = () => {
    setInCall(false)
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-background pt-16 w-full">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] md:h-[900px] md:w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/25 via-indigo-600/15 to-transparent blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-1/4 bottom-1/3 h-[250px] w-[250px] md:h-[400px] md:w-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-[250px] md:h-[400px] bg-gradient-to-t from-blue-900/30 via-indigo-900/10 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-2 sm:inset-4 md:inset-8 border border-dashed border-white/10" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-16 text-center w-full">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2">
          <span className="text-sm text-white/70">
            Find your core, Fund your future
          </span>
        </div>

        <h1 className="mb-6 text-balance text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white px-2">
          Voice AI that runs at
          <br />
          the speed of thought
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-base sm:text-lg text-white/60 px-4">
          Leverage ultra-low latency synthesis and scalable APIs for real-time
          interactions. Optimized for engineers who build the future.
        </p>

        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-4">
          <Link href="/download">
            <Button className="bg-white text-black hover:bg-white/90">
              Download
            </Button>
          </Link>
          <Link href="/docs">
            <Button
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              Explore docs
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative mx-auto flex h-[400px] sm:h-[500px] w-full max-w-4xl items-center justify-center px-4 -mt-8 sm:-mt-12">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <ParticleOrb />
        </div>
        <div className="relative z-20 w-full max-w-lg">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md mx-auto">
            {inCall ? (
              <Room
                mode="voice-only"
                voice={selectedVoice}
                language={selectedLanguage}
                autoStart
                onDisconnect={handleDisconnect}
                cardLayout
                selectedVoiceId={selectedVoice}
                onVoiceChange={setSelectedVoice}
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
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
        </div>
      </div>
    </section>
  )
}
