"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader } from "@/components/ui/loader"
import { cn } from "@/lib/utils"

export type ClarteThinkingVariant = "thinking" | "answering"

export interface ClarteThinkingBlockProps {
  variant: ClarteThinkingVariant
  /** Show seconds since the block became visible (resets when variant changes). */
  showElapsed?: boolean
  className?: string
}

export function ClarteThinkingBlock({
  variant,
  showElapsed = true,
  className,
}: ClarteThinkingBlockProps) {
  const [elapsed, setElapsed] = React.useState(0)
  const label = variant === "answering" ? "Clarte is answering" : "Clarte is thinking"

  React.useEffect(() => {
    setElapsed(0)
    const t0 = Date.now()
    if (!showElapsed) return
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - t0) / 1000))
    }, 500)
    return () => clearInterval(id)
  }, [variant, showElapsed])

  return (
    <Card
      className={cn(
        "gap-0 border-border/80 bg-card/95 py-0 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <CardContent className="flex flex-row items-center gap-3 px-4 py-3">
        <Loader size="md" className="text-blue-600 dark:text-blue-400" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm font-medium leading-tight">
            <span className="clarte-shimmer-text">{label}</span>
            {showElapsed ? (
              <span className="font-normal text-muted-foreground tabular-nums">· {elapsed}s</span>
            ) : null}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
