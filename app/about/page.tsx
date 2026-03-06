"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

export default function AboutPage() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  return (
    <div className="min-h-screen bg-transparent">
      <Header />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-[clamp(7rem,22vh,14rem)] pb-24">
        <AnimateOnScroll animation="fade-up" animateOnMount delay={100}>
          <div className="mb-16">
            <h1 className={cn("text-4xl font-bold md:text-5xl", isBright ? "text-black" : "text-white")}>
              About Clarte
            </h1>
            <p className={cn("mt-4 text-lg", isBright ? "text-black/60" : "text-white/60")}>
              Your thoughts, refined.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Three-step thinking cards */}
        <AnimateOnScroll animation="fade-blur" delay={80}>
          <section className="mb-16 space-y-8">
            <div className={cn("space-y-4 leading-relaxed", isBright ? "text-black/80" : "text-white/80")}>
              <p>
                Clarte is a voice AI built for deep thinking. Instead of rushing to answers, it slows
                things down just enough for you to see how your ideas, assumptions, and evidence all fit
                together.
              </p>
              <p>
                Whether you are designing a product, rethinking a strategy, or making a high-stakes decision,
                Clarte helps you uncover the core of the problem, stress-test your logic, and turn insight
                into execution.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div
                className={cn(
                  "rounded-2xl border p-6 backdrop-blur-md",
                  isBright ? "border-black/10 bg-white/70" : "border-white/10 bg-[#1a1a2e]/60"
                )}
              >
                <h2 className={cn("mb-2 text-lg font-semibold", isBright ? "text-black" : "text-white")}>
                  Discover the Core
                </h2>
                <p className={cn("text-sm leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
                  Stop skimming the surface. Through guided Socratic questioning and proven mental models,
                  Clarte helps you cut through the noise to articulate the true root of your idea.
                </p>
              </div>

              <div
                className={cn(
                  "rounded-2xl border p-6 backdrop-blur-md",
                  isBright ? "border-black/10 bg-white/70" : "border-white/10 bg-[#1a1a2e]/60"
                )}
              >
                <h2 className={cn("mb-2 text-lg font-semibold", isBright ? "text-black" : "text-white")}>
                  Stress-Test Ideas
                </h2>
                <p className={cn("text-sm leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
                  Pitch your plan to an active contrarian. Defend your logic, uncover critical blind spots,
                  and build bulletproof strategies before you take your idea into the real world.
                </p>
              </div>

              <div
                className={cn(
                  "rounded-2xl border p-6 backdrop-blur-md",
                  isBright ? "border-black/10 bg-white/70" : "border-white/10 bg-[#1a1a2e]/60"
                )}
              >
                <h2 className={cn("mb-2 text-lg font-semibold", isBright ? "text-black" : "text-white")}>
                  Validate with Facts
                </h2>
                <p className={cn("text-sm leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
                  Turn refined thoughts into actionable reality. Leverage deep-search capabilities to instantly
                  gather real-world data, assess feasibility, and build a fact-checked execution blueprint.
                </p>
              </div>
            </div>
          </section>
        </AnimateOnScroll>

        {/* Capabilities: voice + screen + camera */}
        <AnimateOnScroll animation="fade-up" delay={140}>
          <section
            className={cn(
              "mt-4 rounded-2xl border p-8 md:p-10 backdrop-blur-md",
              isBright ? "border-black/10 bg-white/70" : "border-white/10 bg-[#1a1a2e]/60"
            )}
          >
            <h2 className={cn("text-2xl font-semibold mb-4", isBright ? "text-black" : "text-white")}>
              A voice agent that sees your context
            </h2>
            <p className={cn("mb-6 text-sm md:text-base leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
              Clarte is more than a voice in your ear. When you choose to share more context, it can:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className={cn("mb-1 text-sm font-semibold uppercase tracking-wide", isBright ? "text-black/80" : "text-white/80")}>
                  Screen share awareness
                </h3>
                <p className={cn("text-sm leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
                  Share your screen so Clarte can reference what you&apos;re actually looking at—slides, code,
                  dashboards, or documents—while you talk through decisions in real time.
                </p>
              </div>
              <div>
                <h3 className={cn("mb-1 text-sm font-semibold uppercase tracking-wide", isBright ? "text-black/80" : "text-white/80")}>
                  Camera and emotional cues
                </h3>
                <p className={cn("text-sm leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
                  Turn on your camera when you want Clarte to notice non-verbal signals—like hesitation,
                  frustration, or excitement—and adapt its questions and pacing to how you actually feel.
                </p>
              </div>
            </div>
            <p className={cn("mt-6 text-xs md:text-sm", isBright ? "text-black/50" : "text-white/50")}>
              These capabilities are always opt-in and under your control. You decide when to share your screen
              or camera, and you can turn them off at any time.
            </p>
          </section>
        </AnimateOnScroll>
      </main>

      <Footer />
    </div>
  )
}
