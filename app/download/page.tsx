"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Monitor, Smartphone, Apple, LayoutGrid, ExternalLink, Chrome } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { PageThemeBg } from "@/components/page-theme-bg"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

const DESKTOP_VERSION = "0.1.0"
const DESKTOP_EXE_URL = `https://github.com/haminxx/clarte.io/releases/download/v${DESKTOP_VERSION}/Clarte-${DESKTOP_VERSION}-x64-setup.exe`
const CHROME_WEB_STORE_URL = "https://chromewebstore.google.com/search?term=clarte"
const APP_STORE_URL = "https://apps.apple.com/us/search?term=clarte"

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
              Get Clarte on your desktop or mobile device. Voice AI that runs at the speed of thought.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid gap-8 md:grid-cols-3">
          <AnimateOnScroll animation="fade-up" delay={0}>
          {/* Desktop */}
          <a
            href={DESKTOP_EXE_URL}
            className={cn(
              "group block rounded-2xl border p-8 transition-all",
              isBright ? "border-black/10 bg-white/70 hover:border-blue-500/30 hover:bg-white/85" : "border-white/10 bg-[#1a1a2e]/50 hover:border-blue-500/30 hover:bg-[#1a1a2e]/80"
            )}
          >
            <div className={cn("mb-6 flex h-14 w-14 items-center justify-center rounded-xl", isBright ? "bg-blue-500/10" : "bg-blue-500/10")}>
              <Monitor className="h-7 w-7 text-blue-400" />
            </div>
            <h2 className={cn("mb-2 text-xl font-semibold", isBright ? "text-black" : "text-white")}>Desktop Application</h2>
            <p className={cn("mb-6 text-sm", isBright ? "text-black/60" : "text-white/60")}>
              Full-featured desktop experience for Windows and macOS. Screen share, camera, and voice—all in one.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm", isBright ? "border-black/10 bg-black/5 text-black/80" : "border-white/10 bg-white/5 text-white/80")}>
                <LayoutGrid className="h-4 w-4" />
                Windows
              </span>
              <span className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm", isBright ? "border-black/10 bg-black/5 text-black/80" : "border-white/10 bg-white/5 text-white/80")}>
                <Apple className="h-4 w-4" />
                macOS
              </span>
            </div>
            <div className="mt-6 flex items-center gap-2 text-blue-400">
              <span className="text-sm font-medium">Download .exe</span>
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </a>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={50}>
          {/* iOS App */}
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-8 transition-all hover:border-blue-500/30 hover:bg-[#1a1a2e]/80"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
              <Smartphone className="h-7 w-7 text-blue-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">iOS App</h2>
            <p className="mb-6 text-sm text-white/60">
              Take Clarte with you. Voice AI on iPhone with Siri integration and background support.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 w-fit">
              <Apple className="h-5 w-5 text-white/80" />
              <span className="text-sm font-medium text-white/80">App Store</span>
            </div>
            <div className="mt-6 flex items-center gap-2 text-blue-400">
              <span className="text-sm font-medium">Download on the App Store</span>
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </a>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={100}>
          {/* Chrome Extension */}
          <a
            href={CHROME_WEB_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-8 transition-all hover:border-blue-500/30 hover:bg-[#1a1a2e]/80"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
              <Chrome className="h-7 w-7 text-blue-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">Chrome Extension</h2>
            <p className="mb-6 text-sm text-white/60">
              Access Clarte from any tab. Quick voice AI without leaving your browser.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 w-fit">
              <Chrome className="h-5 w-5 text-white/80" />
              <span className="text-sm font-medium text-white/80">Chrome Web Store</span>
            </div>
            <div className="mt-6 flex items-center gap-2 text-blue-400">
              <span className="text-sm font-medium">Add to Chrome</span>
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </a>
          </AnimateOnScroll>
        </div>

        <AnimateOnScroll animation="fade-up" delay={200}>
        <div className="mt-12 rounded-2xl border border-white/10 bg-[#1a1a2e]/30 p-6 text-center">
          <p className="text-sm text-white/60">
            Prefer the web?{" "}
            <Link href="/" className="text-blue-400 hover:underline">
              Use Clarte in your browser
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
