"use client"

import Image from "next/image"
import { AnimateOnScroll } from "./animate-on-scroll"

const logos = [
  {
    name: "UC San Diego",
    src: "/logos/uc-san-diego.png",
    alt: "UC San Diego logo",
  },
  {
    name: "OpenAI",
    src: "/logos/openai.png",
    alt: "OpenAI logo",
  },
  {
    name: "LiveKit",
    src: "/logos/livekit.png",
    alt: "LiveKit logo",
  },
  {
    name: "Render",
    src: "/logos/render.png",
    alt: "Render logo",
  },
  {
    name: "Cursor AI",
    src: "/logos/cursor-ai.png",
    alt: "Cursor AI logo",
  },
  {
    name: "Deepgram",
    src: "/logos/deepgram.png",
    alt: "Deepgram logo",
  },
  {
    name: "Anthropic",
    src: "/logos/anthropic.png",
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
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={180}
                  height={56}
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  )
}
