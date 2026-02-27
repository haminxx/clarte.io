import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Code, Headphones, Zap, CheckCircle } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up for free and get 100 minutes of voice AI to test with no credit card required.",
    icon: CheckCircle,
  },
  {
    number: "02",
    title: "Get Your API Key",
    description: "Generate your API key from the dashboard and add it to your environment variables.",
    icon: Code,
  },
  {
    number: "03",
    title: "Choose Your Voice",
    description: "Select from our library of premium voices or create a custom voice for your brand.",
    icon: Headphones,
  },
  {
    number: "04",
    title: "Start Building",
    description: "Use our SDK to integrate voice AI into your application in just a few lines of code.",
    icon: Zap,
  },
]

const useCases = [
  {
    title: "Customer Support",
    description: "Build AI agents that handle customer inquiries 24/7 with natural conversations.",
  },
  {
    title: "Voice Assistants",
    description: "Create intelligent voice interfaces for your products and services.",
  },
  {
    title: "Content Narration",
    description: "Convert written content to natural speech for podcasts and audiobooks.",
  },
  {
    title: "Interactive Games",
    description: "Add voice characters to games and interactive experiences.",
  },
]

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-24">
        <AnimateOnScroll animation="fade-up" animateOnMount delay={100}>
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Get Started with{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Clarte
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Build voice-powered applications in minutes. Follow our simple onboarding process to start creating natural voice experiences.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button className="bg-white text-black hover:bg-white/90">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                Read the Docs
              </Button>
            </Link>
          </div>
        </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up" delay={100}>
        {/* Steps */}
        <div className="mb-24">
          <h2 className="mb-12 text-center text-2xl font-bold text-white">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <AnimateOnScroll key={step.number} animation="fade-up" delay={i * 80}>
              <div
                className="relative rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6"
              >
                <div className="mb-4 flex items-center gap-4">
                  <span className="text-4xl font-bold text-white/10">{step.number}</span>
                  <step.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-white/60">{step.description}</p>
              </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up" delay={200}>
        {/* Use Cases */}
        <div className="mb-24">
          <h2 className="mb-12 text-center text-2xl font-bold text-white">What You Can Build</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {useCases.map((useCase, i) => (
              <AnimateOnScroll key={useCase.title} animation="fade-up" delay={i * 80}>
              <div
                className="flex items-start gap-4 rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{useCase.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{useCase.description}</p>
                </div>
              </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-blur" delay={250}>
        {/* Code Preview */}
        <div className="mb-24">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Simple Integration</h2>
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0d0d1a] p-6 overflow-x-auto">
            <pre className="text-sm text-white/80">
              <code>{`// Install the SDK
npm install @clarte/sdk

// Initialize and start a conversation
import Clarte from '@clarte/sdk';

const clarte = new Clarte({ apiKey: process.env.CLARTE_API_KEY });

const conversation = await clarte.conversations.create({
  voice: 'jane',
  context: 'Friendly customer support assistant'
});

// Stream responses in real-time
conversation.on('response', (audio) => {
  playAudio(audio);
});

await conversation.send('Hello, how can I help you today?');`}</code>
            </pre>
          </div>
        </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up" delay={300}>
        {/* CTA */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-12 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Join thousands of developers building the future of voice AI. Start for free today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-black hover:bg-white/90">
                Create Free Account
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
        </AnimateOnScroll>
      </main>

      <Footer />
    </div>
  )
}
