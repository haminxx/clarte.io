"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"
import { cn } from "@/lib/utils"

export interface GlobeInteractiveProps {
  className?: string
  speed?: number
  variant?: "bright" | "dark"
  /** Degrees east; initial globe rotation centers this meridian. */
  focusLongitude?: number
}

export function GlobeInteractive({
  className,
  speed = 0.0025,
  variant = "dark",
  focusLongitude = -98,
}: GlobeInteractiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const capturedPointerIdRef = useRef<number | null>(null)

  const endDrag = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    const canvas = canvasRef.current
    const pid = capturedPointerIdRef.current
    if (canvas && pid !== null) {
      try {
        if (canvas.hasPointerCapture(pid)) canvas.releasePointerCapture(pid)
      } catch {
        /* ignore */
      }
      capturedPointerIdRef.current = null
    }
    if (canvas) canvas.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      pointerInteracting.current = { x: e.clientX, y: e.clientY }
      const canvas = canvasRef.current
      if (canvas) {
        canvas.style.cursor = "grabbing"
        canvas.setPointerCapture(e.pointerId)
        capturedPointerIdRef.current = e.pointerId
      }
      isPausedRef.current = true
    },
    []
  )

  const handlePointerUp = useCallback(() => {
    endDrag()
  }, [endDrag])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    window.addEventListener("pointercancel", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    phiOffsetRef.current = 0
    thetaOffsetRef.current = 0
    dragOffset.current = { phi: 0, theta: 0 }

    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId = 0
    let phi = (-focusLongitude * Math.PI) / 180
    const isBright = variant === "bright"

    function init() {
      const width = canvas.offsetWidth
      if (width === 0) return
      if (globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: isBright ? 0 : 1,
        diffuse: isBright ? 1.25 : 1.5,
        mapSamples: 8000,
        mapBrightness: isBright ? 5.5 : 6,
        baseColor: isBright ? [0.78, 0.82, 0.9] : [0.06, 0.09, 0.16],
        markerColor: [0.15, 0.35, 0.65],
        glowColor: isBright ? [0.55, 0.62, 0.82] : [0.2, 0.25, 0.4],
        markerElevation: 0,
        markers: [],
        arcs: [],
        arcColor: [0.15, 0.3, 0.55],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: isBright ? 0.58 : 0.72,
      })

      function animate() {
        if (!isPausedRef.current) phi += speed
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => {
        if (canvas) canvas.style.opacity = "1"
      }, 50)
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [variant, speed, focusLongitude])

  return (
    <div className={cn("relative aspect-square max-h-full max-w-full select-none", className)}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="h-full w-full touch-none rounded-full"
        style={{
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1s ease",
          touchAction: "none",
        }}
      />
    </div>
  )
}
