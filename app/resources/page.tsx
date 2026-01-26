import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Video, Newspaper, Download, ExternalLink, Calendar } from "lucide-react"

const resources = [
  {
    type: "Guide",
    title: "Building Your First Voice Agent",
    description: "A comprehensive guide to creating AI-powered voice agents with Clarte",
    icon: FileText,
    readTime: "15 min read",
    href: "#",
  },
  {
    type: "Tutorial",
    title: "Real-time Voice Streaming",
    description: "Learn how to implement low-latency voice streaming in your applications",
    icon: Video,
    readTime: "Video • 12 min",
    href: "#",
  },
  {
    type: "Case Study",
    title: "How Acme Reduced Support Costs by 60%",
    description: "See how Acme implemented Clarte to transform their customer support",
    icon: Newspaper,
    readTime: "8 min read",
    href: "#",
  },
  {
    type: "Whitepaper",
    title: "The Future of Voice AI",
    description: "Our research on emerging trends in conversational AI technology",
    icon: Download,
    readTime: "PDF • 20 pages",
    href: "#",
  },
  {
    type: "Guide",
    title: "Voice Agent Best Practices",
    description: "Tips and tricks for creating natural-sounding voice interactions",
    icon: FileText,
    readTime: "10 min read",
    href: "#",
  },
  {
    type: "Tutorial",
    title: "Integrating with Your CRM",
    description: "Connect Clarte with Salesforce, HubSpot, and other CRM platforms",
    icon: Video,
    readTime: "Video • 18 min",
    href: "#",
  },
]

const upcomingEvents = [
  {
    title: "Voice AI Workshop",
    date: "Feb 15, 2026",
    description: "Hands-on workshop building voice applications",
  },
  {
    title: "Developer Office Hours",
    date: "Weekly, Thursdays",
    description: "Q&A with our engineering team",
  },
  {
    title: "Voice AI Summit 2026",
    date: "Mar 20-21, 2026",
    description: "Our annual conference on voice technology",
  },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-24">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Resources</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Guides, tutorials, and insights to help you build better voice experiences
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Link
              key={resource.title}
              href={resource.href}
              className="group rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6 transition-all hover:border-white/20 hover:bg-[#1a1a2e]/70"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                  {resource.type}
                </span>
                <ExternalLink className="h-4 w-4 text-white/40 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <resource.icon className="mb-4 h-8 w-8 text-white/60" />
              <h3 className="mb-2 font-semibold text-white">{resource.title}</h3>
              <p className="mb-4 text-sm text-white/60">{resource.description}</p>
              <p className="text-xs text-white/40">{resource.readTime}</p>
            </Link>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-white/60" />
            <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.title}
                className="rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6"
              >
                <p className="mb-2 text-sm text-blue-400">{event.date}</p>
                <h3 className="mb-2 font-semibold text-white">{event.title}</h3>
                <p className="text-sm text-white/60">{event.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Stay Updated</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Subscribe to our newsletter for the latest resources, tutorials, and updates.
          </p>
          <div className="mx-auto mt-6 flex max-w-md gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
            />
            <Button className="bg-white text-black hover:bg-white/90">
              Subscribe
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
