"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export const WORD_APPEAR_DURATION_MS = 800

export function estimateWordSequenceEndMs(
  wordCount: number,
  initialDelayMs: number,
  perWordStepMs: number
): number {
  if (wordCount <= 0) return 0
  return initialDelayMs + (wordCount - 1) * perWordStepMs + WORD_APPEAR_DURATION_MS
}

export interface WordAppearTextProps {
  text: string
  initialDelayMs?: number
  perWordStepMs?: number
  startWordIndex?: number
  className?: string
  wordClassName?: string
  onComplete?: () => void
}

function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

export function WordAppearText({
  text,
  initialDelayMs = 500,
  perWordStepMs = 85,
  startWordIndex = 0,
  className,
  wordClassName,
  onComplete,
}: WordAppearTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const words = tokenize(text)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const root = containerRef.current
    if (!root || words.length === 0) {
      queueMicrotask(() => onCompleteRef.current?.())
      return
    }

    const tokens = root.querySelectorAll("[data-word-token]")
    const timeouts: ReturnType<typeof setTimeout>[] = []
    let maxDelay = 0

    tokens.forEach((el) => {
      const delay = parseInt(el.getAttribute("data-delay") || "0", 10)
      maxDelay = Math.max(maxDelay, delay)
      const id = setTimeout(() => {
        ;(el as HTMLElement).style.animation = "word-appear-hero 0.8s ease-out forwards"
      }, delay)
      timeouts.push(id)
    })

    const doneId = setTimeout(() => {
      onCompleteRef.current?.()
    }, maxDelay + WORD_APPEAR_DURATION_MS)
    timeouts.push(doneId)

    return () => timeouts.forEach(clearTimeout)
  }, [text, initialDelayMs, perWordStepMs, startWordIndex, words.length])

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
              "mx-[0.06em] first:ml-0",
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
