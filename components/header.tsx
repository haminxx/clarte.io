"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#1a1a1a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 8L16 4L24 8V16L16 28L8 16V8Z"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="16" cy="12" r="3" fill="white" />
            </svg>
          </Link>
          
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Voices
            </Link>
            <Link
              href="#"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              API
            </Link>
            <Link
              href="#"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Docs
            </Link>
            <Link
              href="#"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Resources
            </Link>
            <Link
              href="#"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="hidden text-sm text-white/70 transition-colors hover:text-white sm:block"
          >
            Talk to Us
          </Link>
          <Button
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Log in
          </Button>
          <Button className="bg-white text-black hover:bg-white/90">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
