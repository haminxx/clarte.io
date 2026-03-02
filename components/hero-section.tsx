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

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-6 mt-[30px] text-center w-full">
        <AnimateOnScroll animateOnMount delay={0} animation="fade-up">
          <div className="mt-[20px] mb-12 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2">
            <span className="text-sm text-white/70">
              Find your core, Fund your future
            </span>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animateOnMount delay={80} animation="fade-up">
          <h1 className="mb-6 text-balance text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white px-2">
            Voice AI that runs at
            <br />
            the speed of thought
          </h1>
        </AnimateOnScroll>

        <AnimateOnScroll animateOnMount delay={160} animation="fade-up">
          <p className="mx-auto mb-8 max-w-xl text-base sm:text-lg text-white/60 px-4">
            Leverage ultra-low latency synthesis and scalable APIs for real-time
            interactions. Optimized for engineers who build the future.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll animateOnMount delay={240} animation="fade-up">
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
        </AnimateOnScroll>
      </div>
    </section>
  )
}
