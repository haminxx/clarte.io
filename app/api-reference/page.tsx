import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Code, Copy, Terminal, Zap, Shield, Globe } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

const codeExample = `import Clarte from '@clarte/sdk';

const clarte = new Clarte({
  apiKey: process.env.CLARTE_API_KEY,
});

// Start a voice conversation
const conversation = await clarte.conversations.create({
  voice: 'jane',
  context: 'Customer support assistant',
});

// Send a message
const response = await conversation.send({
  text: 'Hello, how can I help you today?',
});

console.log(response.audio_url);`

const endpoints = [
  {
    method: "POST",
    path: "/v1/conversations",
    description: "Create a new voice conversation",
  },
  {
    method: "POST",
    path: "/v1/conversations/:id/messages",
    description: "Send a message in a conversation",
  },
  {
    method: "GET",
    path: "/v1/conversations/:id",
    description: "Retrieve conversation details",
  },
  {
    method: "GET",
    path: "/v1/voices",
    description: "List all available voices",
  },
  {
    method: "POST",
    path: "/v1/audio/transcribe",
    description: "Transcribe audio to text",
  },
  {
    method: "POST",
    path: "/v1/audio/synthesize",
    description: "Convert text to speech",
  },
]

export default function APIReferencePage() {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-24">
        <AnimateOnScroll animation="fade-up" animateOnMount delay={100}>
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">API Reference</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
              Integrate Clarte voice capabilities into your applications with our simple REST API
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up" delay={100}>
        {/* Features */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6">
            <Zap className="mb-4 h-8 w-8 text-yellow-400" />
            <h3 className="mb-2 font-semibold text-white">Low Latency</h3>
            <p className="text-sm text-white/60">Sub-100ms response times for real-time conversations</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6">
            <Shield className="mb-4 h-8 w-8 text-green-400" />
            <h3 className="mb-2 font-semibold text-white">Secure</h3>
            <p className="text-sm text-white/60">Enterprise-grade security with end-to-end encryption</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6">
            <Globe className="mb-4 h-8 w-8 text-blue-400" />
            <h3 className="mb-2 font-semibold text-white">Global CDN</h3>
            <p className="text-sm text-white/60">Deployed worldwide for minimal latency everywhere</p>
          </div>
        </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-blur" delay={150}>
        {/* Code Example */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-white/60" />
              <h2 className="text-xl font-semibold text-white">Quick Start</h2>
            </div>
            <Button variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d0d1a] p-6 overflow-x-auto">
            <pre className="text-sm text-white/80">
              <code>{codeExample}</code>
            </pre>
          </div>
        </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up" delay={200}>
        {/* Endpoints */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Terminal className="h-5 w-5 text-white/60" />
            <h2 className="text-xl font-semibold text-white">Endpoints</h2>
          </div>
          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.path}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-4"
              >
                <div className="flex items-center gap-4">
                  <span className={`rounded px-2 py-1 text-xs font-mono font-bold ${
                    endpoint.method === "GET" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm text-white/80">{endpoint.path}</code>
                </div>
                <p className="text-sm text-white/40 hidden md:block">{endpoint.description}</p>
              </div>
            ))}
          </div>
        </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up" delay={250}>
        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to Build?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Get your API key and start building voice-powered applications in minutes.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button className="bg-white text-black hover:bg-white/90">
              Get API Key
            </Button>
            <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              View Full Docs
            </Button>
          </div>
        </div>
        </AnimateOnScroll>
      </main>

      <Footer />
    </div>
  )
}
