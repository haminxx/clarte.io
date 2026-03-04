"use client"

import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

const LOGOS = [
  { src: "/images/logos/ucsd.png", alt: "UC San Diego" },
  { src: "/images/logos/openai.png", alt: "OpenAI" },
  { src: "/images/logos/livekit.png", alt: "LiveKit" },
  { src: "/images/logos/render.png", alt: "Render" },
  { src: "/images/logos/cursor.png", alt: "Cursor" },
  { src: "/images/logos/deepgram.png", alt: "Deepgram" },
  { src: "/images/logos/firebase.png", alt: "Firebase" },
  { src: "/images/logos/exa.png", alt: "Exa" },
]

export function LandingLeftLogos() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-0 flex w-16 flex-col items-center gap-6 py-8",
        "bg-background border-r border-border/50"
      )}
      aria-hidden
    >
      {LOGOS.map(({ src, alt }) => (
        <div
          key={alt}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center"
          title={alt}
        >
          <img
            src={src}
            alt=""
            className={cn(
              "h-8 w-auto max-w-[48px] object-contain",
              isBright && "invert"
            )}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
