"use client"

import { AnimateOnScroll } from "./animate-on-scroll"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

// Local logo assets; large = Firebase, UCSD, LiveKit, Render, Cursor (4-5x bigger)
const logos = [
  { name: "UC San Diego", src: "/images/logos/ucsd.png", alt: "UC San Diego", large: true },
  { name: "OpenAI", src: "/images/logos/openai.png", alt: "OpenAI", large: false },
  { name: "LiveKit", src: "/images/logos/livekit.png", alt: "LiveKit", large: true },
  { name: "Render", src: "/images/logos/render.png", alt: "Render", large: true },
  { name: "Cursor", src: "/images/logos/cursor.png", alt: "Cursor", large: true },
  { name: "Deepgram", src: "/images/logos/deepgram.png", alt: "Deepgram", large: false },
  { name: "Firebase", src: "/images/logos/firebase.png", alt: "Firebase", large: true },
  { name: "Exa", src: "/images/logos/exa.png", alt: "Exa", large: false },
]

export function CompanyLogos() {
  const { theme } = useClarteTheme()

  return (
    <AnimateOnScroll animation="fade-blur">
      <div className="pt-4 sm:pt-5 pb-6 sm:pb-7 w-full overflow-hidden">
        <p className="mb-4 sm:mb-6 text-center text-xs sm:text-sm text-muted-foreground px-4">
          Powered by platforms
        </p>
        <div
          className={cn(
            "relative rounded-2xl py-3 sm:py-4 min-h-[4.5rem] sm:min-h-[5.5rem]",
            theme === "bright" ? "bg-black/10" : "bg-white/10"
          )}
        >
          <div className={cn("pointer-events-none absolute inset-y-0 left-0 w-16 rounded-l-2xl z-10", theme === "bright" ? "bg-gradient-to-r from-black/10 to-transparent" : "bg-gradient-to-r from-white/10 to-transparent")} />
          <div className={cn("pointer-events-none absolute inset-y-0 right-0 w-16 rounded-r-2xl z-10", theme === "bright" ? "bg-gradient-to-l from-black/10 to-transparent" : "bg-gradient-to-l from-white/10 to-transparent")} />
          <div className="logo-marquee-track flex items-center gap-6 sm:gap-8 px-6 whitespace-nowrap">
            {[...logos, ...logos].map((logo, idx) => (
              <div
                key={`${logo.name}-${idx}`}
                className="inline-flex items-center justify-center px-6 py-3 flex-shrink-0"
                aria-label={logo.name}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className={
                    logo.large
                      ? "h-10 sm:h-12 md:h-14 w-auto object-contain max-h-[3.5rem]"
                      : "h-8 sm:h-10 w-auto object-contain max-h-[2.75rem]"
                  }
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
