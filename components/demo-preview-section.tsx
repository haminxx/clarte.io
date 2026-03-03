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
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const isBright = theme === "bright"
  const mediaType: DemoPreviewMediaType = DEMO_PREVIEW_TYPE === "video" ? "video" : "gif"

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setExpanded(true)
          if (videoRef.current && mediaType === "video") {
            videoRef.current.play().catch(() => {})
          }
        } else if (videoRef.current) {
          videoRef.current.pause()
        }
      },
      { threshold: 0.2, rootMargin: "0px" }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [mediaType])

  return (
    <>
      {/* Spacer so fixed preview bar does not cover content below */}
      <div aria-hidden className={cn("w-full", expanded ? "h-0" : "h-[20vh]")} />
      <section
        id="demo-preview-section"
        ref={sectionRef}
        className={cn(
          "relative w-full",
          isBright ? "bg-gradient-to-b from-sky-100/50 via-blue-50/50 to-white" : "bg-background"
        )}
      >
        <div
          className={cn(
            "w-full pb-16 flex flex-col transition-[max-width,padding,height] duration-500 ease-out",
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
              "relative w-full overflow-hidden bg-black text-left transition-[height,border-radius] duration-500 ease-out",
              expanded
                ? "h-screen rounded-none"
                : "h-[20vh] rounded-3xl shadow-2xl"
            )}
            style={
              expanded
                ? { position: "fixed", inset: 0, zIndex: 50, width: "100%", height: "100%", maxWidth: "none" }
                : { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "min(80rem, 100vw)", zIndex: 40 }
            }
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
    </>
  )
}
