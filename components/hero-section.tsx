"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LineRevealBlock } from "@/components/ui/line-reveal-text"
import { WordAppearText, estimateWordSequenceEndMs } from "@/components/ui/word-appear-text"
import { AnimateOnScroll } from "./animate-on-scroll"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { useLanguage, useTranslation } from "@/lib/language-context"
import { localeToFocusLongitude } from "@/lib/globe-locale"
import { cn } from "@/lib/utils"

const GlobeInteractive = dynamic(
  () => import("@/components/ui/cobe-globe-interactive").then((m) => m.GlobeInteractive),
  { ssr: false, loading: () => null }
)

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length
}

const HEADLINE_INITIAL_MS = 400
const HEADLINE_STEP_MS = 80

export function HeroSection() {
  const { theme } = useClarteTheme()
  const { t } = useTranslation()
  const { locale } = useLanguage()
  const isBright = theme === "bright"
  const tagBefore = t("hero.taglineBefore")
  const tagClarity = t("hero.taglineClarity")
  const tagAfter = t("hero.taglineAfter")
  const nBefore = countWords(tagBefore)
  const nClarity = countWords(tagClarity)
  const sub1 = t("hero.subtitle1")
  const sub2 = t("hero.subtitle2")
  const sub3 = t("hero.subtitle3")

  const headlineWordCount = nBefore + nClarity + countWords(tagAfter)
  const headlineEndMs = estimateWordSequenceEndMs(headlineWordCount, HEADLINE_INITIAL_MS, HEADLINE_STEP_MS)

  const [showSecondaryColumn, setShowSecondaryColumn] = useState(false)

  useEffect(() => {
    setShowSecondaryColumn(false)
    if (headlineWordCount === 0) {
      setShowSecondaryColumn(true)
      return
    }
    const id = window.setTimeout(() => setShowSecondaryColumn(true), headlineEndMs)
    return () => clearTimeout(id)
  }, [headlineEndMs, headlineWordCount])

  return (
    <section
      className={cn(
        "relative min-h-screen overflow-hidden w-full",
        isBright ? "bg-white" : "bg-black"
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          {isBright ? (
            <>
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-white via-sky-50/70 to-blue-50/80" />
              <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] md:h-[900px] md:w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-sky-200/40 via-blue-200/30 to-sky-100/20 blur-3xl animate-hero-gradient-drift z-0" />
              <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-sky-200/30 blur-3xl animate-hero-gradient-drift z-0" />
              <div className="absolute left-1/4 bottom-1/3 h-[250px] w-[250px] md:h-[400px] md:w-[400px] rounded-full bg-blue-200/20 blur-3xl animate-hero-gradient-drift z-0" />
              <div className="absolute bottom-0 left-0 right-0 h-[250px] md:h-[400px] bg-gradient-to-t from-sky-200/40 via-blue-100/30 to-transparent z-0" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a0a14] via-[#0c0f1a] to-[#0a0a14]" />
              <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] md:h-[900px] md:w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/25 via-blue-500/15 to-indigo-600/8 blur-3xl animate-hero-gradient-drift z-0" />
              <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-blue-500/15 blur-3xl animate-hero-gradient-drift z-0" />
              <div className="absolute left-1/4 bottom-1/3 h-[250px] w-[250px] md:h-[400px] md:w-[400px] rounded-full bg-indigo-600/12 blur-3xl animate-hero-gradient-drift z-0" />
              <div className="absolute bottom-0 left-0 right-0 h-[250px] md:h-[400px] bg-gradient-to-t from-blue-900/30 via-blue-800/15 to-indigo-900/10 z-0" />
            </>
          )}
        </div>
        <div className="pointer-events-auto absolute left-1/2 top-1/2 z-[1] w-[min(73.6vmin,576px)] max-w-[72vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.72]">
          <GlobeInteractive
            variant={isBright ? "bright" : "dark"}
            className="mx-auto w-full"
            speed={0.0022}
            focusLongitude={localeToFocusLongitude(locale)}
          />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col justify-center pt-[120px] pb-24">
        <div className="mx-auto w-full max-w-[min(1400px,96vw)] 2xl:max-w-[min(1600px,94vw)] pl-[clamp(1.5rem,4vw,7.5rem)] pr-[clamp(1.5rem,4vw,7.5rem)] sm:pl-[clamp(2rem,5vw,8rem)] sm:pr-[clamp(2rem,5vw,8rem)] lg:pl-[clamp(4rem,8vw,120px)] lg:pr-[clamp(4rem,8vw,120px)] 2xl:pl-[min(8vw,160px)] 2xl:pr-[min(8vw,160px)] select-none" onCopy={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[auto_auto] lg:items-end lg:gap-x-[clamp(2rem,5vw,80px)] lg:gap-y-3">
            <AnimateOnScroll animateOnMount delay={0} animation="fade-blur-slow" className="order-1">
              <h1
                className={cn(
                  "font-sans font-extrabold leading-[1.05] tracking-[-0.03em] text-[clamp(1.7rem,3.4vw,3.1rem)] sm:text-[clamp(1.95rem,3.6vw,3.35rem)] md:text-[clamp(2.1rem,3.8vw,3.6rem)] xl:text-[clamp(2.6rem,3.2vw,50px)] [font-family:system-ui,ui-sans-serif,Inter,Segoe_UI,sans-serif]",
                  isBright ? "text-black" : "text-white"
                )}
              >
                <WordAppearText
                  text={tagBefore}
                  startWordIndex={0}
                  initialDelayMs={HEADLINE_INITIAL_MS}
                  perWordStepMs={HEADLINE_STEP_MS}
                />
                <span className="group relative inline-block cursor-default rounded px-1 py-0 bg-transparent backdrop-blur-xl blur-[3px] transition-all duration-300 hover:blur-none">
                  <WordAppearText
                    text={tagClarity}
                    startWordIndex={nBefore}
                    initialDelayMs={HEADLINE_INITIAL_MS}
                    perWordStepMs={HEADLINE_STEP_MS}
                  />
                </span>
                <WordAppearText
                  text={tagAfter}
                  startWordIndex={nBefore + nClarity}
                  initialDelayMs={HEADLINE_INITIAL_MS}
                  perWordStepMs={HEADLINE_STEP_MS}
                />
              </h1>
            </AnimateOnScroll>
            <div className="order-2 flex flex-col items-start lg:items-end lg:justify-end gap-4">
              {showSecondaryColumn ? (
                <>
                  <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-wrap gap-3 duration-500 sm:gap-4">
                    <Link href="/download">
                      <Button
                        className={cn(
                          "text-[clamp(0.875rem,1.2vw,1rem)] h-[clamp(2.25rem,4vh,2.75rem)] px-[clamp(1rem,2vw,1.5rem)]",
                          isBright ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90"
                        )}
                      >
                        {t("hero.download")}
                      </Button>
                    </Link>
                    <Link href="/demo">
                      <Button
                        variant="outline"
                        className={cn(
                          "text-[clamp(0.875rem,1.2vw,1rem)] h-[clamp(2.25rem,4vh,2.75rem)] px-[clamp(1rem,2vw,1.5rem)]",
                          isBright
                            ? "border-black/30 bg-transparent text-black hover:bg-black/10"
                            : "border-white/20 bg-transparent text-white hover:bg-white/10"
                        )}
                      >
                        {t("hero.demo")}
                      </Button>
                    </Link>
                  </div>
                  <div className="w-full max-w-[min(450px,55vw)] lg:max-w-none lg:text-right min-h-[4.5rem]">
                    <LineRevealBlock
                      lines={[sub1, sub2, sub3]}
                      durationMs={1200}
                      className="text-left lg:text-right leading-snug text-[clamp(0.75rem,1.1vw,1.125rem)] sm:text-[clamp(0.8125rem,1.15vw,1rem)] md:text-[clamp(0.875rem,1.2vw,1.125rem)]"
                      lineClassName={isBright ? "text-black/70" : "text-white/60"}
                    />
                  </div>
                </>
              ) : (
                <div className="min-h-[clamp(6rem,12vh,8rem)] w-full max-w-[min(450px,55vw)] lg:max-w-none" aria-hidden />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
