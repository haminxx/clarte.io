"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  z: number
  originalX: number
  originalY: number
  originalZ: number
}

type ParticleOrbVariant = "dark" | "bright"

type ParticleOrbProps = {
  variant?: ParticleOrbVariant
}

export function ParticleOrb({ variant = "dark" }: ParticleOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0, y: 0 })
  const movingDotRef = useRef({ theta: 0, phi: 0 })

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

    // Create particles on sphere surface
    const numParticles = 2000
    const radius = 180
    particlesRef.current = []

    for (let i = 0; i < numParticles; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      particlesRef.current.push({
        x, y, z,
        originalX: x,
        originalY: y,
        originalZ: z
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left - rect.width / 2) / rect.width,
        y: (e.clientY - rect.top - rect.height / 2) / rect.height
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Update rotation based on mouse
      rotationRef.current.y += (mouseRef.current.x * 0.5 - rotationRef.current.y) * 0.05
      rotationRef.current.x += (mouseRef.current.y * 0.3 - rotationRef.current.x) * 0.05

      // Auto rotation
      const autoRotationY = Date.now() * 0.0002
      const autoRotationX = Date.now() * 0.0001

      const cosY = Math.cos(rotationRef.current.y + autoRotationY)
      const sinY = Math.sin(rotationRef.current.y + autoRotationY)
      const cosX = Math.cos(rotationRef.current.x + autoRotationX)
      const sinX = Math.sin(rotationRef.current.x + autoRotationX)

      const isBright = variant === "bright"

      // Sort particles by z for proper depth rendering
      const sortedParticles = particlesRef.current.map((p) => {
        // Rotate around Y axis
        const x1 = p.x * cosY - p.z * sinY
        const z1 = p.x * sinY + p.z * cosY
        
        // Rotate around X axis
        const y2 = p.y * cosX - z1 * sinX
        const z2 = p.y * sinX + z1 * cosX

        return { ...p, screenX: x1, screenY: y2, screenZ: z2 }
      }).sort((a, b) => a.screenZ - b.screenZ)

      // Draw particles
      sortedParticles.forEach((p) => {
        const scale = (p.screenZ + 250) / 500
        const alpha = Math.max(0.1, Math.min(1, scale))
        const size = Math.max(0.5, 2 * scale)

        ctx.beginPath()
        ctx.arc(centerX + p.screenX, centerY + p.screenY, size, 0, Math.PI * 2)
        const [r, g, b] = isBright ? [147, 197, 253] : [255, 255, 255]
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.75})`
        ctx.fill()
      })

      // Animated moving dot
      movingDotRef.current.theta += 0.02
      movingDotRef.current.phi += 0.015

      const movingRadius = 180
      const mTheta = movingDotRef.current.theta
      const mPhi = movingDotRef.current.phi

      const mx = movingRadius * Math.sin(mPhi) * Math.cos(mTheta)
      const my = movingRadius * Math.sin(mPhi) * Math.sin(mTheta)
      const mz = movingRadius * Math.cos(mPhi)

      // Apply same rotation to moving dot
      const mx1 = mx * cosY - mz * sinY
      const mz1 = mx * sinY + mz * cosY
      const my2 = my * cosX - mz1 * sinX
      const mz2 = my * sinX + mz1 * cosX

      // Draw moving dot with glow
      const movingScale = (mz2 + 250) / 500
      const movingAlpha = Math.max(0.3, Math.min(1, movingScale))

      // Glow effect
      const gradient = ctx.createRadialGradient(
        centerX + mx1, centerY + my2, 0,
        centerX + mx1, centerY + my2, 20
      )
      if (isBright) {
        gradient.addColorStop(0, `rgba(191, 219, 254, ${movingAlpha})`)
        gradient.addColorStop(0.3, `rgba(125, 211, 252, ${movingAlpha * 0.55})`)
        gradient.addColorStop(1, "rgba(191, 219, 254, 0)")
      } else {
        gradient.addColorStop(0, `rgba(255, 255, 255, ${movingAlpha})`)
        gradient.addColorStop(0.3, `rgba(200, 255, 200, ${movingAlpha * 0.5})`)
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
      }

      ctx.beginPath()
      ctx.arc(centerX + mx1, centerY + my2, 20, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Core of moving dot
      ctx.beginPath()
      ctx.arc(centerX + mx1, centerY + my2, 4, 0, Math.PI * 2)
      if (isBright) {
        ctx.fillStyle = `rgba(191, 219, 254, ${movingAlpha})`
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${movingAlpha})`
      }
      ctx.fill()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "transparent" }}
    />
  )
}
