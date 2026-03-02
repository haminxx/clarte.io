"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimateOnScroll } from "./animate-on-scroll"

export function HeroSection() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      history.scrollRestoration = "manual"
      window.scrollTo(0, 0)
    }
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-background pt-6 w-full">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] md:h-[900px] md:w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/25 via-indigo-600/15 to-transparent blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-1/4 bottom-1/3 h-[250px] w-[250px] md:h-[400px] md:w-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-[250px] md:h-[400px] bg-gradient-to-t from-blue-900/30 via-indigo-900/10 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-2 sm:inset-4 md:inset-8 border border-dashed border-white/10" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-4 mt-[20px] w-full">
        <AnimateOnScroll animateOnMount delay={80} animation="fade-blur">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12">
            {/* Left column: motto + headline */}
            <div className="lg:flex-1 lg:max-w-[60%]">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2">
                <span className="text-sm text-white/70">
                  Find your core, Fund your future
                </span>
              </div>
              <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Voice AI that runs at the speed of thought
              </h1>
            </div>

            {/* Right column: buttons + description */}
            <div className="lg:flex-1 lg:max-w-[40%] lg:pt-12">
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
                <Link href="/download">
                  <Button className="bg-white text-black hover:bg-white/90">
                    Download
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button
                    variant="outline"
                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                  >
                    Demo
                  </Button>
                </Link>
              </div>
              <p className="text-base sm:text-lg text-white/60 leading-relaxed">
                Leverage ultra-low latency synthesis and scalable APIs for real-time
                interactions. Optimized for engineers who build the future.
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
