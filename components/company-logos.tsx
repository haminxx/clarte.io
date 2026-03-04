"use client"

import { AnimateOnScroll } from "./animate-on-scroll"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

// Local logo assets (same set as former left vertical bar)
const logos = [
  { name: "UC San Diego", src: "/images/logos/ucsd.png", alt: "UC San Diego" },
  { name: "OpenAI", src: "/images/logos/openai.png", alt: "OpenAI" },
  { name: "LiveKit", src: "/images/logos/livekit.png", alt: "LiveKit" },
  { name: "Render", src: "/images/logos/render.png", alt: "Render" },
  { name: "Cursor", src: "/images/logos/cursor.png", alt: "Cursor" },
  { name: "Deepgram", src: "/images/logos/deepgram.png", alt: "Deepgram" },
  { name: "Firebase", src: "/images/logos/firebase.png", alt: "Firebase" },
  { name: "Exa", src: "/images/logos/exa.png", alt: "Exa" },
]

export function CompanyLogos() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

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
                  className={cn("h-8 sm:h-10 w-auto object-contain", isBright && "invert")}
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
