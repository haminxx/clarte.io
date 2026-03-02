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
    <section className="relative min-h-screen overflow-hidden bg-background w-full">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] md:h-[900px] md:w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/25 via-indigo-600/15 to-transparent blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-1/4 bottom-1/3 h-[250px] w-[250px] md:h-[400px] md:w-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-[250px] md:h-[400px] bg-gradient-to-t from-blue-900/30 via-indigo-900/10 to-transparent" />
      </div>

      {/* Content bottom baseline at vertical middle (50vh) - Anthropic-style: 120px left/right margins, fixed header spacing */}
      <div className="relative z-10 flex min-h-screen flex-col justify-end pb-[50vh] pt-[120px]">
        <div className="mx-auto w-full max-w-[1400px] pl-6 pr-6 sm:pl-12 sm:pr-12 lg:pl-[120px] lg:pr-[120px]">
          <AnimateOnScroll animateOnMount delay={80} animation="fade-blur">
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[auto_1fr] lg:items-baseline lg:gap-x-[130px] lg:gap-y-2">
              {/* Mobile order: headline, buttons, description. Desktop: row1=buttons right, row2=headline+description */}
              <div className="hidden lg:block" />
              <div className="order-2 flex flex-wrap gap-3 sm:gap-4 lg:justify-end">
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
              <div className="order-1 lg:order-3">
                <h1 className="text-[56px] font-semibold leading-[1.1] tracking-tight text-white">
                  Voice AI that runs at the speed of thought
                </h1>
              </div>
              <div className="order-3 lg:order-4">
                <p className="text-[24px] leading-relaxed text-white/60 max-w-[400px] text-left">
                  Leverage ultra-low latency synthesis and scalable APIs for real-time interactions. Optimized for engineers who build the future.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
