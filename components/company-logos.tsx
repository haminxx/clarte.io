"use client"

import { AnimateOnScroll } from "./animate-on-scroll"

// Use official / reputable logo sources. UCSD uses its wordmark from Wikimedia;
// the rest use Simple Icons CDN, which serves SVGs in brand colors.
const logos = [
  {
    name: "UC San Diego",
    src: "https://upload.wikimedia.org/wikipedia/commons/f/f6/UCSD_logo.png",
    alt: "UC San Diego logo",
  },
  {
    name: "OpenAI",
    src: "https://cdn.simpleicons.org/openai",
    alt: "OpenAI logo",
  },
  {
    name: "LiveKit",
    src: "https://cdn.simpleicons.org/livekit",
    alt: "LiveKit logo",
  },
  {
    name: "Render",
    src: "https://cdn.simpleicons.org/render",
    alt: "Render logo",
  },
  {
    name: "Cursor",
    src: "https://cdn.simpleicons.org/cursor",
    alt: "Cursor logo",
  },
  {
    name: "Deepgram",
    src: "https://cdn.simpleicons.org/deepgram",
    alt: "Deepgram logo",
  },
  {
    name: "Anthropic",
    src: "https://cdn.simpleicons.org/anthropic",
    alt: "Anthropic logo",
  },
]

export function CompanyLogos() {
  return (
    <AnimateOnScroll animation="fade-blur">
      <div className="py-6 sm:py-8 w-full overflow-hidden">
        <p className="mb-4 sm:mb-6 text-center text-xs sm:text-sm text-muted-foreground px-4">
          Trusted by builders at
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
          <div className="logo-marquee-track flex items-center gap-10 sm:gap-14 px-10 opacity-80 whitespace-nowrap">
            {[...logos, ...logos].map((logo, idx) => (
              <div
                key={`${logo.name}-${idx}`}
                className="inline-flex items-center justify-center px-6 py-3"
                aria-label={logo.name}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-8 sm:h-10 w-auto object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  )
}
