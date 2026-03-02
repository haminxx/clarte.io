import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-32 pb-24">
        <AnimateOnScroll animation="fade-up" animateOnMount delay={100}>
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-white md:text-5xl">About Clarte</h1>
            <p className="mt-4 text-lg text-white/60">
              Your thoughts, refined.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-blur" delay={100}>
          <div className="space-y-8 text-white/80 leading-relaxed">
            <p>
              Clarte is a voice AI platform that helps you think clearly and act decisively.
              Through guided Socratic questioning, stress-testing, and deep-search validation,
              we help you discover the core of your ideas and turn them into actionable reality.
            </p>
            <p>
              Our mission is to put AI at the frontier of strategic thinking—helping individuals
              and teams cut through noise, uncover blind spots, and build bulletproof strategies
              before taking ideas into the real world.
            </p>
          </div>
        </AnimateOnScroll>
      </main>

      <Footer />
    </div>
  )
}
