"use client"

import Link from "next/link"
import { AnimateOnScroll } from "./animate-on-scroll"

const footerLinkClass =
  "group relative inline-block text-sm text-white/60 transition-all duration-300 ease-out hover:text-white"

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-gradient-to-b from-[#0a0a14] via-[#0d0d1a] to-[#0a0a14] backdrop-blur-sm">
      {/* Soft gradient accent at top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <AnimateOnScroll animation="fade-up">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="text-lg italic text-white/80">Your thoughts, refined</p>
          </div>

          {/* Main Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Main</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/docs" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">Docs</span>
                </Link>
              </li>
              <li>
                <Link href="/api-reference" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">API</span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">Pricing</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/download" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">Download</span>
                </Link>
              </li>
              <li>
                <Link href="/get-started" className={footerLinkClass}>
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-white after:to-white/80 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">Get Started</span>
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
            <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
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
        <div className="mt-8 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Clarte. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
