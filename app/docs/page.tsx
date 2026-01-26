import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Code, Zap, Settings, MessageSquare, Shield, ArrowRight } from "lucide-react"

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
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-24">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white md:text-5xl">Documentation</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Everything you need to integrate Clarte voice AI into your applications
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-16 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full rounded-xl border border-white/10 bg-[#1a1a2e]/50 px-6 py-4 text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none focus:ring-0"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 rounded bg-white/10 px-2 py-1 text-xs text-white/40">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="group rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6 transition-all hover:border-white/20"
            >
              <section.icon className="mb-4 h-8 w-8 text-blue-400" />
              <h2 className="mb-2 text-xl font-semibold text-white">{section.title}</h2>
              <p className="mb-4 text-sm text-white/60">{section.description}</p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className="flex items-center text-sm text-white/70 transition-colors hover:text-white"
                    >
                      <ArrowRight className="mr-2 h-3 w-3" />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Need Help?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Can&apos;t find what you&apos;re looking for? Our team is here to help.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/contact">
              <Button className="bg-white text-black hover:bg-white/90">
                Contact Support
              </Button>
            </Link>
            <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              Join Discord
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
