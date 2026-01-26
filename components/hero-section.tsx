"use client"

import { ParticleOrb } from "./particle-orb"
import { VoiceCard } from "./voice-card"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  onStartCall?: (withScreenShare?: boolean) => void
  isCallActive?: boolean
}

export function HeroSection({ onStartCall, isCallActive }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background pt-16">
      {/* Background gradient glow - blue space theme */}
      <div className="pointer-events-none absolute inset-0">
        {/* Central blue glow */}
        <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/25 via-indigo-600/15 to-transparent blur-3xl" />
        {/* Secondary blue accent */}
        <div className="absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
        {/* Left accent */}
        <div className="absolute left-1/4 bottom-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
        {/* Bottom horizon glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-blue-900/30 via-indigo-900/10 to-transparent" />
      </div>
      
      {/* Dotted border frame */}
      <div className="pointer-events-none absolute inset-4 border border-dashed border-white/10 md:inset-8" />

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

      {/* Particle Orb Container with Voice Card centered */}
      <div className="relative mx-auto flex h-[500px] w-full max-w-4xl items-center justify-center">
        {/* Orb centered behind the card */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ParticleOrb />
        </div>
        
        {/* Voice Card centered over the orb */}
        <div className="relative z-20 w-full max-w-lg px-4">
          <VoiceCard onStartCall={onStartCall} isActive={isCallActive} />
        </div>
      </div>
    </section>
  )
}
