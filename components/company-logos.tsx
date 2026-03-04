"use client"

import { AnimateOnScroll } from "./animate-on-scroll"

// Use official / reputable logo sources with transparent backgrounds where possible.
// These URLs are chosen from brand/asset or well-known logo repositories.
const logos = [
  {
    name: "UC San Diego",
    src: "https://upload.wikimedia.org/wikipedia/commons/0/0b/UC_San_Diego_logo.svg",
    alt: "UC San Diego logo",
  },
  {
    name: "OpenAI",
    src: "https://upload.wikimedia.org/wikipedia/commons/4/42/OpenAI_Logo_2025.svg",
    alt: "OpenAI logo",
  },
  {
    name: "LiveKit",
    src: "https://logo.clearbit.com/livekit.io",
    alt: "LiveKit logo",
  },
  {
    name: "Render",
    src: "https://seeklogo.com/images/R/render-logo-AF0E91E35F-seeklogo.com.png",
    alt: "Render logo",
  },
  {
    name: "Cursor",
    src: "https://vectorseek.com/wp-content/uploads/2023/10/Cursor-AI-Logo-PNG-Vector.svg",
    alt: "Cursor logo",
  },
  {
    name: "Deepgram",
    src: "https://logo.svgcdn.com/simple-icons/deepgram-dark.png",
    alt: "Deepgram logo",
  },
  {
    name: "Anthropic",
    src: "https://logo.svgcdn.com/l/anthropic.png",
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
