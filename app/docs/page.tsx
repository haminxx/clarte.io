"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Code, Zap, Settings, MessageSquare, Shield, ArrowRight } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

const sections = [
  {
    title: "Getting Started",
    icon: Zap,
    description: "Quick start guides to get you up and running in minutes",
    links: [
      { title: "Installation", href: "#" },
      { title: "Authentication", href: "#" },
      { title: "First API Call", href: "#" },
    ],
  },
  {
    title: "Voice Conversations",
    icon: MessageSquare,
    description: "Learn how to create and manage voice conversations",
    links: [
      { title: "Creating Conversations", href: "#" },
      { title: "Streaming Audio", href: "#" },
      { title: "Context Management", href: "#" },
    ],
  },
  {
    title: "SDK Reference",
    icon: Code,
    description: "Complete reference for our JavaScript/TypeScript SDK",
    links: [
      { title: "Client Configuration", href: "#" },
      { title: "Methods & Types", href: "#" },
      { title: "Error Handling", href: "#" },
    ],
  },
  {
    title: "Configuration",
    icon: Settings,
    description: "Customize voice settings and behavior",
    links: [
      { title: "Voice Selection", href: "#" },
      { title: "Audio Settings", href: "#" },
      { title: "Webhooks", href: "#" },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    description: "Best practices for securing your integration",
    links: [
      { title: "API Key Management", href: "#" },
      { title: "Rate Limiting", href: "#" },
      { title: "Data Privacy", href: "#" },
    ],
  },
]

export default function DocsPage() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  return (
    <div className="min-h-screen bg-transparent">
      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-[clamp(7rem,22vh,14rem)] pb-24">
        <AnimateOnScroll animation="fade-up" animateOnMount delay={100}>
          <div className="mb-12 text-center">
            <div className={cn("mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl", isBright ? "bg-blue-500/10" : "bg-blue-500/10")}>
              <BookOpen className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className={cn("text-4xl font-bold md:text-5xl", isBright ? "text-black" : "text-white")}>Documentation</h1>
            <p className={cn("mx-auto mt-4 max-w-2xl text-lg", isBright ? "text-black/60" : "text-white/60")}>
              Everything you need to integrate Clarte voice AI into your applications
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-blur" delay={100}>
        {/* Search */}
        <div className="mx-auto mb-16 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documentation..."
              className={cn(
                "w-full rounded-xl border px-6 py-4 focus:outline-none focus:ring-0",
                isBright
                  ? "border-black/10 bg-white/70 text-black placeholder:text-black/40 focus:border-black/15"
                  : "border-white/10 bg-[#1a1a2e]/50 text-white placeholder:text-white/40 focus:border-white/20"
              )}
            />
            <kbd className={cn("absolute right-4 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs", isBright ? "bg-black/10 text-black/50" : "bg-white/10 text-white/40")}>
              ⌘K
            </kbd>
          </div>
        </div>
        </AnimateOnScroll>

        {/* Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, i) => (
            <AnimateOnScroll key={section.title} animation="fade-up" delay={i * 80}>
            <div
              className={cn(
                "group rounded-2xl border p-6 transition-all backdrop-blur-md",
                isBright ? "border-black/10 bg-white/70 hover:border-black/15" : "border-white/10 bg-[#1a1a2e]/50 hover:border-white/20"
              )}
            >
              <section.icon className="mb-4 h-8 w-8 text-blue-400" />
              <h2 className={cn("mb-2 text-xl font-semibold", isBright ? "text-black" : "text-white")}>{section.title}</h2>
              <p className={cn("mb-4 text-sm", isBright ? "text-black/60" : "text-white/60")}>{section.description}</p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center text-sm transition-colors",
                        isBright ? "text-black/70 hover:text-black" : "text-white/70 hover:text-white"
                      )}
                    >
                      <ArrowRight className="mr-2 h-3 w-3" />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll animation="fade-up" delay={200}>
        {/* CTA */}
        <div className={cn("mt-16 rounded-2xl border p-8 text-center backdrop-blur-md", isBright ? "border-black/10 bg-white/70" : "border-white/10 bg-[#1a1a2e]/50")}>
          <h2 className={cn("text-2xl font-bold", isBright ? "text-black" : "text-white")}>Need Help?</h2>
          <p className={cn("mx-auto mt-4 max-w-xl", isBright ? "text-black/60" : "text-white/60")}>
            Can&apos;t find what you&apos;re looking for? Our team is here to help.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/contact">
              <Button className={cn(isBright ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90")}>
                Contact Support
              </Button>
            </Link>
            <Button
              variant="outline"
              className={cn(
                "bg-transparent",
                isBright ? "border-black/20 text-black hover:bg-black/5" : "border-white/20 text-white hover:bg-white/10"
              )}
            >
              Join Discord
            </Button>
          </div>
        </div>
        </AnimateOnScroll>
      </main>

      <Footer />
    </div>
  )
}
