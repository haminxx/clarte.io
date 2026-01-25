"use client"

import { ParticleOrb } from "./particle-orb"
import { VoiceCard } from "./voice-card"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  onStartCall?: () => void
  isCallActive?: boolean
}

export function HeroSection({ onStartCall, isCallActive }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#1a1a1a] pt-16">
      {/* Dotted border frame */}
      <div className="pointer-events-none absolute inset-4 border border-dashed border-white/20 md:inset-8" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-sm text-white/70">
            NEW ERA: WE'VE CHANGE OUR LOGO
          </span>
        </div>

        {/* Main heading */}
        <h1 className="mb-6 text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl lg:text-7xl">
          Voice AI that runs at
          <br />
          the speed of thought
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-8 max-w-xl text-lg text-white/60">
          Leverage ultra-low latency synthesis and scalable APIs for real-time
          interactions. Optimized for engineers who build the future.
        </p>

        {/* CTA Buttons */}
        <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
          <Button className="bg-white text-black hover:bg-white/90">
            Get started
          </Button>
          <Button
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Explore docs
          </Button>
        </div>
      </div>

      {/* Particle Orb Container */}
      <div className="relative mx-auto h-[500px] w-full max-w-4xl">
        <ParticleOrb />
        
        {/* Voice Card positioned over the orb */}
        <div className="absolute bottom-20 left-1/2 z-20 w-full max-w-lg -translate-x-1/2 transform px-4">
          <VoiceCard onStartCall={onStartCall} isActive={isCallActive} />
        </div>
      </div>
    </section>
  )
}
