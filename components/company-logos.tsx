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

  return (
    <AnimateOnScroll animation="fade-blur">
      <div className="py-6 sm:py-8 w-full overflow-hidden">
        <p className="mb-4 sm:mb-6 text-center text-xs sm:text-sm text-muted-foreground px-4">
          Trusted by builders at
        </p>
        <div
          className={cn(
            "relative rounded-2xl py-4 sm:py-5",
            theme === "bright" ? "bg-black/10" : "bg-white/10"
          )}
        >
          <div className={cn("pointer-events-none absolute inset-y-0 left-0 w-16 rounded-l-2xl z-10", theme === "bright" ? "bg-gradient-to-r from-black/10 to-transparent" : "bg-gradient-to-r from-white/10 to-transparent")} />
          <div className={cn("pointer-events-none absolute inset-y-0 right-0 w-16 rounded-r-2xl z-10", theme === "bright" ? "bg-gradient-to-l from-black/10 to-transparent" : "bg-gradient-to-l from-white/10 to-transparent")} />
          <div className="logo-marquee-track flex items-center gap-10 sm:gap-14 px-10 whitespace-nowrap">
            {[...logos, ...logos].map((logo, idx) => (
              <div
                key={`${logo.name}-${idx}`}
                className="inline-flex items-center justify-center px-6 py-3"
                aria-label={logo.name}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-16 sm:h-20 w-auto object-contain max-h-[5rem]"
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
