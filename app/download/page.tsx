"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ExternalLink, Laptop, Smartphone, Puzzle } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { PageThemeBg } from "@/components/page-theme-bg"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

const CHROME_WEB_STORE_URL = "https://chromewebstore.google.com/detail/clarte/fnhlcolenkljepfpjilmgfilbbhnamdi?authuser=0&hl=en"

const cardBase = (isBright: boolean) =>
  cn(
    "flex h-full min-h-[220px] flex-col rounded-2xl border p-6 transition-all",
    isBright ? "border-black/10 bg-white/70" : "border-white/10 bg-[#1a1a2e]/50"
  )

export default function DownloadPage() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  return (
    <div className="min-h-screen bg-transparent">
      <PageThemeBg />

      <Header />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-[clamp(7rem,22vh,14rem)] pb-24">
        <AnimateOnScroll animation="fade-up" animateOnMount delay={100}>
          <div className="mb-16 text-center">
            <h1 className={cn("text-4xl font-bold md:text-5xl lg:text-6xl", isBright ? "text-black" : "text-white")}>
              Download{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Clarte
              </span>
            </h1>
            <p className={cn("mx-auto mt-6 max-w-2xl text-lg", isBright ? "text-black/60" : "text-white/60")}>
              Get Clarte on your desktop or mobile device.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid gap-6 md:grid-cols-3">
          <AnimateOnScroll animation="fade-up" delay={0}>
            {/* Desktop — Coming soon */}
            <div className={cn(cardBase(isBright), "opacity-95")}>
              <div className="mb-4 flex items-center justify-between">
                <span className={cn("flex items-center gap-2 text-sm font-medium uppercase tracking-wide", isBright ? "text-black/70" : "text-white/70")}>
                  <Laptop className="h-5 w-5 text-blue-400/80" />
                  Desktop
                </span>
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium", isBright ? "bg-amber-100 text-amber-800" : "bg-amber-500/20 text-amber-300")}>
                  Coming soon
                </span>
              </div>
              <h2 className={cn("mb-2 text-lg font-semibold", isBright ? "text-black" : "text-white")}>Desktop Application</h2>
              <p className={cn("mb-4 flex-1 text-sm leading-relaxed", isBright ? "text-black/60" : "text-white/60")}>
                Full-featured desktop experience for Windows and macOS. Screen share, camera, and voice—all in one.
              </p>
              <div className={cn("flex flex-wrap gap-2 text-xs", isBright ? "text-black/50" : "text-white/50")}>
                <span>Windows</span>
                <span aria-hidden>·</span>
                <span>macOS</span>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={50}>
            {/* iOS App — Coming soon */}
            <div className={cn(cardBase(isBright), "opacity-95")}>
              <div className="mb-4 flex items-center justify-between">
                <span className={cn("flex items-center gap-2 text-sm font-medium uppercase tracking-wide", isBright ? "text-black/70" : "text-white/70")}>
                  <Smartphone className="h-5 w-5 text-blue-400/80" />
                  Mobile
                </span>
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium", isBright ? "bg-amber-100 text-amber-800" : "bg-amber-500/20 text-amber-300")}>
                  Coming soon
                </span>
              </div>
              <h2 className={cn("mb-2 text-lg font-semibold", isBright ? "text-black" : "text-white")}>iOS App</h2>
              <p className={cn("mb-4 flex-1 text-sm leading-relaxed", isBright ? "text-black/60" : "text-white/60")}>
                Take Clarte with you. Voice AI on iPhone with Siri integration and background support.
              </p>
              <div className={cn("text-xs", isBright ? "text-black/50" : "text-white/50")}>
                App Store
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={100}>
            {/* Chrome Extension — Live */}
            <a
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                cardBase(isBright),
                "group hover:border-blue-500/30",
                isBright ? "hover:bg-white/85" : "hover:bg-[#1a1a2e]/80"
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className={cn("flex items-center gap-2 text-sm font-medium uppercase tracking-wide", isBright ? "text-black/70" : "text-white/70")}>
                  <Puzzle className="h-5 w-5 text-blue-400/80" />
                  Extension
                </span>
              </div>
              <h2 className={cn("mb-2 text-lg font-semibold", isBright ? "text-black" : "text-white")}>Chrome Extension</h2>
              <p className={cn("mb-4 flex-1 text-sm leading-relaxed", isBright ? "text-black/60" : "text-white/60")}>
                Access Clarte from any tab. Quick voice AI without leaving your browser.
              </p>
              <div className="flex items-center gap-2 text-blue-400">
                <span className="text-sm font-medium">Add to Chrome</span>
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          </AnimateOnScroll>
        </div>

        <AnimateOnScroll animation="fade-up" delay={200}>
          <div className={cn("mt-12 rounded-2xl border p-6 text-center backdrop-blur-md", isBright ? "border-black/10 bg-white/60" : "border-white/10 bg-[#1a1a2e]/30")}>
            <p className={cn("text-sm", isBright ? "text-black/60" : "text-white/60")}>
              Prefer the web?{" "}
              <Link href="/demo" className="text-blue-400 hover:underline">
                Try the demo
              </Link>
              {" "}—no download required.
            </p>
          </div>
        </AnimateOnScroll>
      </main>

      <Footer />
    </div>
  )
}
