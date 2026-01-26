"use client"

import { Waveform } from "./waveform"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function FeaturesSection() {
  return (
    <section className="bg-[#1a1a1a] py-24">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="mb-4 text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Built for Real-Time
          <br />
          Voice Intelligence
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-white/60">
          Flawless speech precision, ultra-low latency, and human-level
          clarity — even in complex, high-velocity conversations.
        </p>

        <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
          <Button className="bg-white text-black hover:bg-white/90">
            Get started
          </Button>
          <Button
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Explore docs
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* AI Agent Card - Now on the left */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Clarte Agent</h3>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-sm text-white/70">Jane</span>
              </div>
            </div>
            <Waveform variant="ai" />
            <div className="mt-4 flex items-center gap-4">
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-white text-black hover:bg-white/90"
              >
                <Play className="h-4 w-4" />
              </Button>
              <div className="text-left">
                <p className="text-sm font-medium text-white">
                  Human-accurate pronunciation.
                </p>
                <p className="text-xs text-white/50">
                  Names and terms rendered perfectly.
                </p>
              </div>
            </div>
          </div>

          {/* Human Voice Card - Now on the right */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Human Voice</h3>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-sm text-white/70">Victoria</span>
              </div>
            </div>
            <Waveform variant="human" />
            <div className="mt-4 flex items-center gap-4">
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-white text-black hover:bg-white/90"
              >
                <Play className="h-4 w-4" />
              </Button>
              <div className="text-left">
                <p className="text-sm font-medium text-white">
                  Latency under 100ms.
                </p>
                <p className="text-xs text-white/50">
                  Responds faster than the blink of an eye.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
