"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { PageThemeBg } from "@/components/page-theme-bg"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

export default function AboutPage() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  return (
    <div className="min-h-screen bg-transparent">
      <PageThemeBg />

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

        <AnimateOnScroll animation="fade-blur" delay={100}>
          <div className={cn("space-y-8 leading-relaxed", isBright ? "text-black/80" : "text-white/80")}>
            <p>
              Clarte is a voice AI platform that helps you think clearly and act decisively.
              Through guided Socratic questioning, stress-testing, and deep-search validation,
              we help you discover the core of your ideas and turn them into actionable reality.
            </p>
            <p>
              Our mission is to put AI at the frontier of strategic thinking—helping individuals
              and teams cut through noise, uncover blind spots, and build bulletproof strategies
              before taking ideas into the real world.
            </p>
          </div>
        </AnimateOnScroll>
      </main>

      <Footer />
    </div>
  )
}
