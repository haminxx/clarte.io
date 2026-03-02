"use client"

import { AnimateOnScroll } from "./animate-on-scroll"

const cards = [
  {
    subtitle: "Discover the Core",
    description:
      "Stop skimming the surface. Through guided Socratic questioning and proven mental models, our AI helps you cut through the noise to articulate the true root of your idea.",
  },
  {
    subtitle: "Stress-Test Ideas",
    description:
      "Pitch your plan to an active contrarian. Defend your logic, uncover critical blind spots, and build bulletproof strategies before you take your idea into the real world.",
  },
  {
    subtitle: "Validate with Facts",
    description:
      "Turn refined thoughts into actionable reality. Leverage deep-search capabilities to instantly gather real-world data, assess feasibility, and build a fact-checked execution blueprint.",
  },
]

export function AIStrategySection() {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 w-full overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] md:h-[500px] md:w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-600/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 w-full">
        <AnimateOnScroll animation="fade-blur">
          <div className="mb-12 text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              <span className="text-muted-foreground">As your</span>{" "}
              <span className="text-foreground">AI Strategy & Implementation Partner,</span>{" "}
              <span className="text-muted-foreground">we help you</span>
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="grid gap-6 md:grid-cols-3 w-full">
          {cards.map((card, i) => (
            <AnimateOnScroll key={card.subtitle} animation="fade-blur" delay={i * 80}>
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg transition-shadow hover:shadow-xl">
                <h3 className="mb-3 text-lg font-semibold text-foreground">{card.subtitle}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
