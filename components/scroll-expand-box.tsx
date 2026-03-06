"use client"

import { useRef, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

const SCROLL_HEIGHT_VH = 200

type ScrollExpandBoxProps = {
  children: ReactNode
  className?: string
  /** Section min-height in vh for scroll range. Default 200. */
  scrollHeightVh?: number
}

export function ScrollExpandBox({
  children,
  className,
  scrollHeightVh = SCROLL_HEIGHT_VH,
}: ScrollExpandBoxProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  const width = useTransform(scrollYProgress, [0, 0.2, 0.6], ["88vw", "94vw", "100vw"])
  const height = useTransform(scrollYProgress, [0, 0.2, 0.6], ["40vh", "65vh", "100vh"])
  const borderRadius = useTransform(scrollYProgress, [0, 0.2, 0.5], [24, 12, 0])

  return (
    <section
      ref={sectionRef}
      style={{ minHeight: `${scrollHeightVh}vh` }}
      className={cn(
        "relative w-full",
        isBright ? "bg-gradient-to-b from-white via-sky-50/90 to-blue-50/80" : "bg-background",
        className
      )}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <motion.div
          className={cn(
            "relative w-full overflow-hidden shadow-2xl",
            isBright ? "border border-black/10 bg-white/90 backdrop-blur-md" : "border border-white/10 bg-card/95 backdrop-blur-md"
          )}
          style={{
            width,
            height,
            borderRadius,
            maxWidth: "100vw",
            maxHeight: "100vh",
          }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}
