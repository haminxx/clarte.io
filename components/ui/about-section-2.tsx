"use client"

import { useRef } from "react"
import Link from "next/link"
import type { Variants } from "framer-motion"
import { Zap } from "lucide-react"
import { TimelineContent } from "@/components/ui/timeline-animation"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { useTranslation } from "@/lib/language-context"
import { cn } from "@/lib/utils"

const revealVariants: Variants = {
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { delay: i * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
  hidden: { filter: "blur(10px)", y: 28, opacity: 0 },
}

const textVariants: Variants = {
  visible: (i: number) => ({
    filter: "blur(0px)",
    opacity: 1,
    transition: { delay: 0.35 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
  hidden: { filter: "blur(10px)", opacity: 0 },
}

function highlightClass(
  tone: "sky" | "amber" | "emerald",
  isBright: boolean
): string {
  const map = {
    sky: isBright
      ? "text-sky-700 border-sky-600"
      : "text-sky-300 border-sky-400/90",
    amber: isBright
      ? "text-amber-700 border-amber-600"
      : "text-amber-300 border-amber-400/90",
    emerald: isBright
      ? "text-emerald-700 border-emerald-600"
      : "text-emerald-300 border-emerald-400/90",
  }
  return cn(
    "inline-block border-2 border-dotted px-2 py-0.5 align-baseline rounded-md xl:min-h-[3.25rem] xl:leading-[3.25rem] xl:py-0",
    map[tone]
  )
}

export default function AboutSection2() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { theme } = useClarteTheme()
  const { t } = useTranslation()
  const isBright = theme === "bright"

  const headingCls = cn(
    "mb-8 text-2xl font-semibold !leading-[120%] sm:text-4xl md:text-5xl",
    isBright ? "text-foreground" : "text-white"
  )
  const mutedCls = isBright ? "text-muted-foreground" : "text-white/65"
  const strongCls = isBright ? "text-foreground" : "text-white"

  return (
    <section
      className={cn(
        "mb-16 px-1",
        isBright ? "bg-gradient-to-b from-black/[0.03] to-transparent" : "bg-gradient-to-b from-white/[0.04] to-transparent"
      )}
    >
      <div className="mx-auto max-w-6xl" ref={heroRef}>
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <div className="flex-1">
            <TimelineContent
              as="h1"
              animationNum={0}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className={headingCls}
            >
              {t("about.heroPartBefore")}
              <TimelineContent
                as="span"
                animationNum={1}
                timelineRef={heroRef}
                customVariants={textVariants}
                className={highlightClass("sky", isBright)}
              >
                {t("about.heroHighlight1")}
              </TimelineContent>
              {t("about.heroPartMid1")}
              <TimelineContent
                as="span"
                animationNum={2}
                timelineRef={heroRef}
                customVariants={textVariants}
                className={highlightClass("amber", isBright)}
              >
                {t("about.heroHighlight2")}
              </TimelineContent>
              {t("about.heroPartMid2")}
              <TimelineContent
                as="span"
                animationNum={3}
                timelineRef={heroRef}
                customVariants={textVariants}
                className={highlightClass("emerald", isBright)}
              >
                {t("about.heroHighlight3")}
              </TimelineContent>
              {t("about.heroPartAfter")}
            </TimelineContent>

            <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end sm:gap-6">
              <TimelineContent
                as="div"
                animationNum={4}
                timelineRef={heroRef}
                customVariants={textVariants}
                className="mb-0 text-xs sm:text-lg"
              >
                <div className={cn("mb-1 font-medium capitalize", strongCls)}>{t("about.heroTagline1")}</div>
                <div className={cn("font-semibold uppercase tracking-wide", mutedCls)}>{t("about.heroTagline2")}</div>
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={5}
                timelineRef={heroRef}
                customVariants={textVariants}
                className="shrink-0"
              >
                <Link
                  href="/demo"
                  className={cn(
                    "inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium shadow-lg transition-opacity hover:opacity-95",
                    "bg-primary text-primary-foreground shadow-primary/25"
                  )}
                >
                  <Zap className="size-4 fill-current" aria-hidden />
                  {t("about.heroCta")}
                </Link>
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
