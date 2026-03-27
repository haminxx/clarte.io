"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type AnimationType =
  | "fade-up"
  | "fade-up-slow"
  | "fade-blur"
  | "fade-blur-slow"
  | "fade-blur-slower"
  | "pop"

const animationClassMap: Record<AnimationType, string> = {
  "fade-up": "animate-fade-up-in",
  "fade-up-slow": "animate-fade-up-in-slow",
  "fade-blur": "animate-blur-to-clear",
  "fade-blur-slow": "animate-blur-to-clear-slow",
  "fade-blur-slower": "animate-blur-to-clear-slower",
  pop: "animate-pop-in",
}

interface AnimateOnScrollProps {
  children: ReactNode
  className?: string
  delay?: number
  animation?: AnimationType
  triggerOnce?: boolean
  /** For above-fold content, animate on mount after delay instead of scroll */
  animateOnMount?: boolean
}

export function AnimateOnScroll({
  children,
  className,
  delay = 0,
  animation = "fade-up",
  triggerOnce = true,
  animateOnMount = false,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (animateOnMount) {
      const timer = setTimeout(() => {
        setVisible(true)
        hasAnimatedRef.current = true
      }, delay)
      return () => clearTimeout(timer)
    }

    const el = ref.current
    if (!el) return

    let timer: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true
            timer = setTimeout(() => setVisible(true), delay)
            break
          }
        }
      },
      { rootMargin: "0px 0px -50px 0px", threshold: 0.1 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [delay, animateOnMount])

  const baseClass = "opacity-0"
  const visibleClass = visible ? animationClassMap[animation] : baseClass

  return (
    <div ref={ref} className={cn(visibleClass, className)}>
      {children}
    </div>
  )
}
