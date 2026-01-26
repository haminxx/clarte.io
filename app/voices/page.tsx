import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Play, Volume2 } from "lucide-react"

const voices = [
  {
    name: "Jane",
    type: "Female",
    accent: "American",
    description: "Warm and professional voice perfect for business communications",
    traits: ["Clear", "Confident", "Friendly"],
  },
  {
    name: "Victoria",
    type: "Female",
    accent: "British",
    description: "Elegant and articulate voice ideal for formal presentations",
    traits: ["Sophisticated", "Calm", "Authoritative"],
  },
  {
    name: "Marcus",
    type: "Male",
    accent: "American",
    description: "Deep and engaging voice great for storytelling and narration",
    traits: ["Deep", "Engaging", "Trustworthy"],
  },
  {
    name: "Oliver",
    type: "Male",
    accent: "British",
    description: "Refined and clear voice suited for educational content",
    traits: ["Refined", "Clear", "Educational"],
  },
  {
    name: "Sofia",
    type: "Female",
    accent: "Spanish",
    description: "Vibrant and expressive voice for dynamic content",
    traits: ["Vibrant", "Expressive", "Warm"],
  },
  {
    name: "Kai",
    type: "Neutral",
    accent: "International",
    description: "Balanced and versatile voice for any application",
    traits: ["Versatile", "Modern", "Adaptive"],
  },
]

export default function VoicesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-24">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Voice Library</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Explore our collection of premium AI voices designed for natural, human-like conversations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {voices.map((voice) => (
            <div
              key={voice.name}
              className="group rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6 transition-all hover:border-white/20 hover:bg-[#1a1a2e]/70"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                    <Volume2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{voice.name}</h3>
                    <p className="text-sm text-white/40">{voice.type} • {voice.accent}</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white text-black opacity-0 transition-opacity hover:bg-white/90 group-hover:opacity-100"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="mb-4 text-sm text-white/60">{voice.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {voice.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Need a Custom Voice?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            We can create custom voice profiles tailored to your brand identity and specific requirements.
          </p>
          <Button className="mt-6 bg-white text-black hover:bg-white/90">
            Contact Sales
          </Button>
        </div>
      </main>
    </div>
  )
}
