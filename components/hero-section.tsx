"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimateOnScroll } from "./animate-on-scroll"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  return (
    <section className={cn("relative min-h-screen overflow-hidden w-full", isBright ? "bg-gradient-to-b from-white via-blue-50/30 to-indigo-100/50" : "bg-background")}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {isBright ? (
          <>
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] md:h-[900px] md:w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-white/40 via-white/20 to-transparent blur-3xl" />
            <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-white/30 blur-3xl" />
            <div className="absolute left-1/4 bottom-1/3 h-[250px] w-[250px] md:h-[400px] md:w-[400px] rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 right-0 h-[250px] md:h-[400px] bg-gradient-to-t from-blue-200/40 via-indigo-200/20 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] md:h-[900px] md:w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/25 via-indigo-600/15 to-transparent blur-3xl" />
            <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute left-1/4 bottom-1/3 h-[250px] w-[250px] md:h-[400px] md:w-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 right-0 h-[250px] md:h-[400px] bg-gradient-to-t from-blue-900/30 via-indigo-900/10 to-transparent" />
          </>
        )}
      </div>

      {/* Content: headline left, buttons + description right, aligned per reference image */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center pt-[120px] pb-24">
        <div className="mx-auto w-full max-w-[1400px] pl-6 pr-6 sm:pl-12 sm:pr-12 lg:pl-[120px] lg:pr-[120px]">
          <AnimateOnScroll animateOnMount delay={80} animation="fade-blur">
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-[80px] lg:gap-y-4">
              {/* Left: headline. Right: buttons above description, right-aligned */}
              <div className="order-1">
                <h1 className={cn("text-[56px] font-semibold leading-[1.1] tracking-tight", isBright ? "text-black" : "text-white")}>
                  Find absolute{" "}
                  <span className="group relative inline-block cursor-default rounded px-1.5 py-0.5 bg-transparent backdrop-blur-xl blur-[3px] transition-all duration-300 hover:blur-none">
                    clarity
                  </span>
                  {" "}with a voice AI that questions, debates, and validates
                </h1>
              </div>
              <div className="order-2 flex flex-col items-start lg:items-end gap-4">
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Link href="/download">
                    <Button className={isBright ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90"}>
                      Download
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button
                      variant="outline"
                      className={isBright ? "border-black/30 bg-transparent text-black hover:bg-black/10" : "border-white/20 bg-transparent text-white hover:bg-white/10"}
                    >
                      Demo
                    </Button>
                  </Link>
                </div>
                <p className={cn("text-lg leading-relaxed max-w-[400px] text-left lg:text-right", isBright ? "text-black/70" : "text-white/60")}>
                  Learning is about how you think. Clarte helps you deep ideate, practice critical thinking, and actively challenging your assumptions.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
