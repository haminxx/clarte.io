"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { DEMO_PREVIEW_SRC, DEMO_PREVIEW_TYPE, type DemoPreviewMediaType } from "@/lib/demo-preview-config"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

const PREVIEW_SCROLL_HEIGHT_VH = 380
const VIDEO_PLAY_THRESHOLD = 0.38
const ARROW_HIDE_THRESHOLD = 0.22

export function DemoPreviewSection() {
  const { theme } = useClarteTheme()
  const [mediaError, setMediaError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const isBright = theme === "bright"
  const mediaType: DemoPreviewMediaType = DEMO_PREVIEW_TYPE === "video" ? "video" : "gif"

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  // Video play when scrolled into "play zone"
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const video = videoRef.current
    if (mediaType !== "video" || !video) return
    if (v >= VIDEO_PLAY_THRESHOLD) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  })

  // Interpolate width/height from initial centered box to full viewport; border-radius to 0.
  const width = useTransform(scrollYProgress, [0, 0.2, 0.6], ["92vw", "96vw", "100vw"])
  const height = useTransform(scrollYProgress, [0, 0.2, 0.6], ["33vh", "60vh", "100vh"])
  const borderRadius = useTransform(scrollYProgress, [0, 0.2, 0.5], [24, 12, 0])

  const [showDownArrow, setShowDownArrow] = useState(true)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setShowDownArrow(v < ARROW_HIDE_THRESHOLD)
  })

  const scrollToPlayZone = () => {
    if (!sectionRef.current) return
    const section = sectionRef.current
    const sectionTop = section.offsetTop
    const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800
    // Scroll to ~38% of section height so video starts
    const targetScroll = sectionTop + section.offsetHeight * VIDEO_PLAY_THRESHOLD - windowHeight * 0.4
    window.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" })
  }

  return (
    <section
      id="demo-preview-section"
      ref={sectionRef}
      style={{ minHeight: `${PREVIEW_SCROLL_HEIGHT_VH}vh` }}
      className={cn(
        "relative w-full -mt-[80vh] snap-start snap-always",
        isBright ? "bg-gradient-to-b from-sky-50 via-blue-50/90 to-sky-100/80" : "bg-background"
      )}
    >
      <div className="sticky top-0 flex h-screen w-full items-end justify-center overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <motion.div
            className="relative w-full overflow-hidden bg-black text-left shadow-2xl"
            style={{
              width,
              height,
              borderRadius,
              maxWidth: "100vw",
              maxHeight: "100vh",
            }}
            aria-label="Demo preview"
          >
            <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8 lg:p-12">
              <div>
                <span className="mb-2 inline-block text-xs font-medium uppercase tracking-widest text-white/60">
                  Featured
                </span>
                <h2 className="max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
                  Clarte in Action
                </h2>
              </div>

              <div className="mt-4 flex flex-col items-start gap-3">
                <Link
                  href="/demo"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Try the Demo
                </Link>
                {showDownArrow && (
                  <button
                    type="button"
                    onClick={scrollToPlayZone}
                    className="rounded-full p-2 text-white/80 transition hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                    aria-label="Scroll to expand preview"
                  >
                    <ChevronDown className="h-8 w-8 drop-shadow-md" />
                  </button>
                )}
              </div>
            </div>

            <div className="absolute inset-0">
              {mediaError || !DEMO_PREVIEW_SRC ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-black">
                  <div className="text-center text-white/50">
                    <p className="text-sm">Add a demo preview</p>
                    <p className="mt-1 text-xs">Place demo-preview.mp4 or demo-preview.gif in public/</p>
                  </div>
                </div>
              ) : mediaType === "video" ? (
                <video
                  ref={videoRef}
                  src={DEMO_PREVIEW_SRC}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  onError={() => setMediaError(true)}
                />
              ) : (
                <img
                  src={DEMO_PREVIEW_SRC}
                  alt="Clarte demo preview"
                  className="h-full w-full object-cover"
                  onError={() => setMediaError(true)}
                />
              )}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
                  isBright && "from-black/70"
                )}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
