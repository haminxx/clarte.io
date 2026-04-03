"use client"

import dynamic from "next/dynamic"
import { forwardRef, useImperativeHandle, useRef } from "react"
import { PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"
import type { AslHandViewportHandle } from "./AslHandScene"

const AslHandScene = dynamic(
  () => import("./AslHandScene").then((m) => m.AslHandScene),
  { ssr: false, loading: () => <div className="flex h-full min-h-[280px] w-full items-center justify-center text-sm text-muted-foreground">Loading 3D…</div> }
)

export type AslCallCardHandle = AslHandViewportHandle

export type AslCallCardProps = {
  onEndCall: () => void
  /** Reflects VapiRoom status for a subtle status line. */
  vapiStatus?: "idle" | "connecting" | "active" | "error"
  modelUrl?: string
  /** Show tiny dev controls to fire intents (phase 1). */
  showDevIntentTriggers?: boolean
}

export const AslCallCard = forwardRef<AslCallCardHandle, AslCallCardProps>(function AslCallCard(
  { onEndCall, vapiStatus, modelUrl, showDevIntentTriggers = process.env.NODE_ENV === "development" },
  ref
) {
  const sceneRef = useRef<AslHandViewportHandle>(null)
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  useImperativeHandle(
    ref,
    () => ({
      triggerAslAnimation: (intent: string) => {
        sceneRef.current?.triggerAslAnimation(intent)
      },
    }),
    []
  )

  return (
    <div className="relative flex min-h-[320px] w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-background/40">
      <div className="relative min-h-[280px] flex-1">
        <AslHandScene ref={sceneRef} modelUrl={modelUrl} />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onEndCall}
          className={cn(
            "absolute bottom-3 right-3 z-10 gap-2 rounded-full shadow-md",
            isBright && "border border-black/10 bg-white/95 hover:bg-white"
          )}
        >
          <PhoneOff className="h-4 w-4" />
          End call
        </Button>
        {showDevIntentTriggers && (
          <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] text-muted-foreground"
              onClick={() => sceneRef.current?.triggerAslAnimation("GREETING")}
            >
              Dev: Hello
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] text-muted-foreground"
              onClick={() => sceneRef.current?.triggerAslAnimation("OFFER_HELP")}
            >
              Dev: Help
            </Button>
          </div>
        )}
      </div>
      {vapiStatus === "connecting" && (
        <p className="border-t border-border/50 px-3 py-1.5 text-center text-xs text-muted-foreground">Connecting voice…</p>
      )}
    </div>
  )
})
