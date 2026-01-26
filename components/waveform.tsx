"use client"

import { useEffect, useRef } from "react"

interface WaveformProps {
  variant?: "human" | "ai"
}

export function Waveform({ variant = "human" }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const centerY = rect.height / 2
      const time = Date.now() * 0.002

      // Draw multiple wave layers
      const layers = variant === "human" ? 3 : 4
      
      for (let layer = 0; layer < layers; layer++) {
        ctx.beginPath()
        
        const layerOffset = layer * 0.3
        const amplitude = (rect.height / 4) * (1 - layer * 0.2)
        const frequency = variant === "human" ? 0.02 : 0.025
        const speed = variant === "human" ? time : time * 1.2

        for (let x = 0; x < rect.width; x++) {
          const noise1 = Math.sin(x * frequency + speed + layerOffset) * amplitude
          const noise2 = Math.sin(x * frequency * 2.5 + speed * 1.3 + layerOffset) * (amplitude * 0.4)
          const noise3 = Math.sin(x * frequency * 0.5 + speed * 0.7 + layerOffset) * (amplitude * 0.6)
          
          const y = centerY + noise1 + noise2 + noise3

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        const alpha = 0.3 - layer * 0.08
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Draw center line with gradient
      ctx.beginPath()
      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0)
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)")
      gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.6)")
      gradient.addColorStop(0.8, "rgba(255, 255, 255, 0.6)")
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      for (let x = 0; x < rect.width; x++) {
        const noise1 = Math.sin(x * 0.02 + time) * (rect.height / 5)
        const noise2 = Math.sin(x * 0.05 + time * 1.5) * (rect.height / 10)
        const y = centerY + noise1 + noise2

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.stroke()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [variant])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-24"
      style={{ background: "transparent" }}
    />
  )
}
