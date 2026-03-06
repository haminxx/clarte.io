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
      <div className="pt-2 sm:pt-3 pb-3 sm:pb-4 w-full overflow-hidden">
        <p className="mb-3 sm:mb-4 text-center text-[0.7rem] sm:text-xs text-muted-foreground px-4">
          Powered by platforms
        </p>
        <div
          className={cn(
            "relative rounded-2xl py-2 sm:py-3 min-h-[3.5rem] sm:min-h-[4.25rem] backdrop-blur-md border",
            theme === "bright" 
              ? "bg-black/5 border-black/5" 
              : "bg-white/10 border-white/10"
          )}
        >
          <div className={cn("pointer-events-none absolute inset-y-0 left-0 w-16 rounded-l-2xl z-10", theme === "bright" ? "bg-gradient-to-r from-black/10 to-transparent" : "bg-gradient-to-r from-white/20 to-transparent")} />
          <div className={cn("pointer-events-none absolute inset-y-0 right-0 w-16 rounded-r-2xl z-10", theme === "bright" ? "bg-gradient-to-l from-black/10 to-transparent" : "bg-gradient-to-l from-white/20 to-transparent")} />
          <div className="logo-marquee-track flex items-center gap-4 sm:gap-6 px-4 whitespace-nowrap">
            {[...logos, ...logos].map((logo, idx) => (
              <div
                key={`${logo.name}-${idx}`}
                className="inline-flex items-center justify-center px-4 py-2 flex-shrink-0"
                aria-label={logo.name}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className={cn(
                    theme === "bright" ? "mix-blend-multiply" : "mix-blend-lighten",
                    logo.large
                      ? "h-8 sm:h-9 md:h-10 w-auto object-contain max-h-[2.75rem]"
                      : "h-6 sm:h-7 w-auto object-contain max-h-[2.25rem]"
                  )}
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
