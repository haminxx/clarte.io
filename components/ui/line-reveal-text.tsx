"use client"

import { cn } from "@/lib/utils"

export interface LineRevealBlockProps {
  lines: string[]
  /** Total duration for each line’s LTR reveal (ms). Default 1200. */
  durationMs?: number
  className?: string
  lineClassName?: string
}

/**
 * Renders multiple lines that reveal left-to-right in parallel (same start, same duration).
 */
export function LineRevealBlock({
  lines,
  durationMs = 1200,
  className,
  lineClassName,
}: LineRevealBlockProps) {
  const durationS = `${durationMs / 1000}s`

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {lines.map((text, i) => (
        <p key={i} className={cn("overflow-hidden", lineClassName)}>
          <span
            className="inline-block animate-line-reveal-ltr opacity-0"
            style={{ animationDuration: durationS }}
          >
            {text}
          </span>
        </p>
      ))}
    </div>
  )
}
