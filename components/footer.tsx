"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimateOnScroll } from "./animate-on-scroll"
import { cn } from "@/lib/utils"
import { useClarteTheme } from "@/lib/clarte-theme-context"

export function Footer() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  const footerLinkClass = cn(
    "group relative inline-block text-sm transition-all duration-300 ease-out",
    isBright ? "text-black/60 hover:text-black" : "text-white/60 hover:text-white"
  )
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [scrolled, setScrolled] = useState(isHome)

  useEffect(() => {
    if (isHome) {
      setScrolled(true)
      return
    }
    setScrolled(false)
    const onScroll = () => setScrolled((s) => s || window.scrollY > 80)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [isHome, pathname])

  const showFooter = isHome || scrolled

  return (
    <footer
      className={cn(
        "relative z-10 border-t backdrop-blur-sm transition-opacity duration-300",
        isBright ? "border-black/10 bg-gradient-to-b from-white via-blue-50/50 to-indigo-100/50" : "border-white/10 bg-gradient-to-b from-[#0a0a14] via-[#0d0d1a] to-[#0a0a14]",
        showFooter ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Soft gradient accent at top edge */}
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent", isBright ? "via-blue-500/40" : "via-blue-500/30")} />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <AnimateOnScroll animation="fade-up">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className={cn("text-lg italic", isBright ? "text-black/80" : "text-white/80")}>Your thoughts, refined</p>
          </div>

          {/* Main Links */}
          <div>
            <h3 className={cn("mb-4 text-sm font-semibold", isBright ? "text-black" : "text-white")}>Main</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">About</span>
                </Link>
              </li>
              <li>
                <Link href="/api-reference" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">API</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">About</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className={cn("mb-4 text-sm font-semibold", isBright ? "text-black" : "text-white")}>Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/download" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">Download</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">Contact</span>
                </Link>
              </li>
              <li>
                <a href="https://github.com/haminxx/clarte.io" target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">GitHub</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className={cn("mb-4 text-sm font-semibold", isBright ? "text-black" : "text-white")}>Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">Terms of Service</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        </AnimateOnScroll>

        {/* Copyright */}
        <div className={cn("mt-8 border-t pt-8 text-center", isBright ? "border-black/10" : "border-white/10")}>
          <p className={cn("text-sm", isBright ? "text-black/60" : "text-white/60")}>
            © {new Date().getFullYear()} Clarte. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
