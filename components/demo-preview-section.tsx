"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { DEMO_PREVIEW_SRC, DEMO_PREVIEW_TYPE, type DemoPreviewMediaType } from "@/lib/demo-preview-config"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

export function DemoPreviewSection() {
  const { theme } = useClarteTheme()
  const [mediaError, setMediaError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const isBright = theme === "bright"
  const mediaType: DemoPreviewMediaType = DEMO_PREVIEW_TYPE === "video" ? "video" : "gif"

  useEffect(() => {
    const section = document.getElementById("demo-preview-section")
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && videoRef.current && mediaType === "video") {
          videoRef.current.play().catch(() => {})
        } else if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause()
        }
      },
      { threshold: 0.25, rootMargin: "0px" }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [mediaType])

  return (
    <section
      id="demo-preview-section"
      className={cn(
        "relative min-h-[150vh] w-full",
        isBright ? "bg-gradient-to-b from-indigo-100/50 to-white" : "bg-background"
      )}
    >
      {/* Spacer so card appears "half cut" when first scrolled into view */}
      <div className="h-[50vh]" aria-hidden />

      {/* Sticky full-screen card */}
      <div
        className={cn(
          "sticky top-0 flex h-[100vh] w-full flex-col overflow-hidden",
          isBright ? "bg-black" : "bg-black"
        )}
      >
        <div className="relative z-10 flex flex-1 flex-col justify-between p-8 sm:p-12 lg:p-16">
          {/* Top: FEATURED label + headline */}
          <div>
            <span className="mb-4 inline-block text-xs font-medium uppercase tracking-widest text-white/60">
              Featured
            </span>
            <h2 className="max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Clarte in Action
            </h2>
          </div>

          {/* Bottom: CTA */}
          <div className="mt-8">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Try the Demo
            </Link>
          </div>
        </div>

        {/* Media layer - full bleed, behind content */}
        <div className="absolute inset-0">
          {mediaError || !DEMO_PREVIEW_SRC ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-black">
              <div className="text-center text-white/50">
                <p className="text-sm">Add a demo preview</p>
                <p className="mt-1 text-xs">
                  Place demo-preview.mp4 or demo-preview.gif in public/
                </p>
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
          {/* Overlay for text readability */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
              isBright && "from-black/70"
            )}
          />
        </div>
      </div>
    </section>
  )
