"use client"

import * as React from "react"
import { motion, useInView, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

type TimelineAs = "h1" | "span" | "div" | "button"

export type TimelineContentProps = {
  as?: TimelineAs
  animationNum: number
  timelineRef: React.RefObject<HTMLElement | null>
  customVariants: Variants
  className?: string
  children?: React.ReactNode
}

const motionProps = (opts: {
  isInView: boolean
  customVariants: Variants
  animationNum: number
  className?: string
  children?: React.ReactNode
}) => ({
  initial: "hidden" as const,
  animate: opts.isInView ? ("visible" as const) : ("hidden" as const),
  variants: opts.customVariants,
  custom: opts.animationNum,
  className: cn(opts.className),
  children: opts.children,
})

/**
 * Scroll-triggered reveal when `timelineRef` enters the viewport.
 * Variant functions may use `custom` index for stagger: `visible: (i) => ({...})`.
 */
export function TimelineContent({
  as = "div",
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
}: TimelineContentProps) {
  const isInView = useInView(timelineRef, { once: true, amount: 0.22 })
  const p = motionProps({ isInView, customVariants, animationNum, className, children })

  switch (as) {
    case "h1":
      return <motion.h1 {...p} />
    case "span":
      return <motion.span {...p} />
    case "button":
      return <motion.button type="button" {...p} />
    default:
      return <motion.div {...p} />
  }
}
