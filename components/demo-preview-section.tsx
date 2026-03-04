"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { DEMO_PREVIEW_SRC, DEMO_PREVIEW_TYPE, type DemoPreviewMediaType } from "@/lib/demo-preview-config"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

export function DemoPreviewSection() {
  const { theme } = useClarteTheme()
  const [mediaError, setMediaError] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const isBright = theme === "bright"
  const mediaType: DemoPreviewMediaType = DEMO_PREVIEW_TYPE === "video" ? "video" : "gif"
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1100)
    return () => clearTimeout(t)
  }, [])

  // Track whether the user has actually scrolled, so we don't auto-expand on initial load.
  useEffect(() => {
    const handleScrollOnce = () => {
      if (window.scrollY > 10) {
        setHasScrolled(true)
        window.removeEventListener("scroll", handleScrollOnce)
      }
    }
    window.addEventListener("scroll", handleScrollOnce, { passive: true })
    return () => window.removeEventListener("scroll", handleScrollOnce)
  }, [])

  // Scroll-driven expand / collapse with hysteresis to avoid \"shaking\" at the threshold.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let frameRequested = false

    const handleScroll = () => {
      if (!section) return
      if (frameRequested) return
      frameRequested = true
      requestAnimationFrame(() => {
        frameRequested = false
        const rect = section.getBoundingClientRect()
        const viewportHeight = window.innerHeight || 0
        if (viewportHeight <= 0 || rect.height <= 0) return

        const visibleTop = Math.max(0, rect.top)
        const visibleBottom = Math.min(viewportHeight, rect.bottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        const ratio = visibleHeight / rect.height
        const scrollY = window.scrollY || window.pageYOffset || 0

        // Only auto-expand after the user has scrolled a bit, and when ~50%+ is visible.
        const shouldExpand = hasScrolled && ratio >= 0.5
        // Only auto-collapse when the user is effectively back at the top and the card is mostly compact.
        const shouldCollapse = scrollY < 12 && ratio < 0.45

        setExpanded((prev) => {
          if (!prev && shouldExpand) {
            if (videoRef.current && mediaType === "video") {
              videoRef.current.play().catch(() => {})
            }
            return true
          }
          if (prev && shouldCollapse) {
            if (videoRef.current) {
              videoRef.current.pause()
            }
            return false
          }
          return prev
        })
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    // Run once on mount to ensure we don't start expanded.
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasScrolled, mediaType])

  return (
    <section
      id="demo-preview-section"
      ref={sectionRef}
      className={cn(
        "relative w-full -mt-[15vh]",
        isBright ? "bg-gradient-to-b from-sky-100/50 via-blue-50/50 to-white" : "bg-background"
      )}
    >
      <div
        className={cn(
          // Slightly slower, smoother expand/collapse for container
          "w-full pb-16 flex flex-col transition-[max-width,padding,height,border-radius] duration-800 ease-in-out",
          expanded ? "mx-auto max-w-none px-0" : "mx-auto max-w-7xl px-6 sm:px-12 lg:px-16"
        )}
      >
        <button
          type="button"
          onClick={() => {
            setExpanded(true)
            if (videoRef.current && mediaType === "video") {
              videoRef.current.play().catch(() => {})
            }
            sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          }}
          className={cn(
            // Slower card expansion/collapse and entrance for a more relaxed feel
            "relative w-full overflow-hidden bg-black text-left transition-[height,border-radius,max-width] duration-800 ease-in-out",
            expanded
              ? "h-screen min-h-screen rounded-none"
              : "h-[33vh] rounded-3xl shadow-2xl",
            !expanded && "duration-1000 ease-out transition-opacity transition-transform",
            !mounted && !expanded && "opacity-0 translate-y-6",
            mounted && !expanded && "opacity-100 translate-y-0"
          )}
          style={expanded ? undefined : {}}
          aria-label="Expand demo preview"
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

            <div className="mt-4">
              <Link
                href="/demo"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Try the Demo
              </Link>
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
        </button>
      </div>
    </section>
  )
}
