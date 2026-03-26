"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface WordAppearTextProps {
  text: string
  /** Global delay before first word (ms), e.g. 500 to match hero mount */
  initialDelayMs?: number
  /** Delay step between consecutive words (ms) */
  perWordStepMs?: number
  /** Word index of first token (for stagger across multiple segments) */
  startWordIndex?: number
  className?: string
  /** Extra class on each word span */
  wordClassName?: string
}

function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

/**
 * Digital Serenity–style staggered word reveal (scoped to container).
 */
export function WordAppearText({
  text,
  initialDelayMs = 500,
  perWordStepMs = 85,
  startWordIndex = 0,
  className,
  wordClassName,
}: WordAppearTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const words = tokenize(text)

  useEffect(() => {
    const root = containerRef.current
    if (!root || words.length === 0) return

    const tokens = root.querySelectorAll("[data-word-token]")
    const timeouts: ReturnType<typeof setTimeout>[] = []

    tokens.forEach((el) => {
      const delay = parseInt(el.getAttribute("data-delay") || "0", 10)
      const id = setTimeout(() => {
        ;(el as HTMLElement).style.animation = "word-appear-hero 0.8s ease-out forwards"
      }, delay)
      timeouts.push(id)
    })

    return () => timeouts.forEach(clearTimeout)
  }, [text, initialDelayMs, perWordStepMs, startWordIndex])

  if (words.length === 0) return null

  return (
    <span ref={containerRef} className={cn("inline", className)}>
      {words.map((w, i) => {
        const delay = initialDelayMs + (startWordIndex + i) * perWordStepMs
        return (
          <span
            key={`${i}-${w}`}
            data-word-token
            data-delay={delay}
            className={cn(
              "word-animate-hero inline-block opacity-0 align-baseline",
              "mx-[0.08em] first:ml-0",
              wordClassName
            )}
          >
            {w}
          </span>
        )
      })}
    </span>
  )
}
