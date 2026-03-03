"use client"

import { AnimateOnScroll } from "./animate-on-scroll"

export function CompanyLogos() {
  const companies = [
    "UC San Diego",
    "OpenAI",
    "LiveKit",
    "Render",
    "Cursor AI",
    "Deepgram",
    "Groq",
    "Vercel",
  ]

  return (
    <AnimateOnScroll animation="fade-blur">
      <div className="py-6 sm:py-8 w-full overflow-hidden">
        <p className="mb-4 sm:mb-6 text-center text-xs sm:text-sm text-muted-foreground px-4">
          Trusted by builders at
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
          <div className="logo-marquee-track flex items-center gap-8 sm:gap-12 px-8 opacity-70 whitespace-nowrap">
            {[...companies, ...companies].map((company, idx) => (
              <div
                key={`${company}-${idx}`}
                className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/80 px-4 py-2 text-xs sm:text-sm font-medium tracking-wide text-foreground/70 backdrop-blur-sm"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                <span>{company}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  )
}
