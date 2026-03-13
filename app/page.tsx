"use client"

import React, { lazy, Suspense } from "react"

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_LIVEKIT_URL) {
  console.warn("[Clarte] NEXT_PUBLIC_LIVEKIT_URL is undefined. Voice calls may not work.")
}
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { CompanyLogos } from "@/components/company-logos"
import { AIStrategySection } from "@/components/ai-strategy-section"
import { FeaturesSection } from "@/components/features-section"

const DemoPreviewSection = lazy(() =>
  import("@/components/demo-preview-section").then((m) => ({ default: m.DemoPreviewSection }))
)

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden">
      <Header />

      <main className="overflow-x-hidden snap-y snap-mandatory">
        <HeroSection />

        <Suspense fallback={<div className="h-[33vh] min-h-[200px] w-full" />}>
          <DemoPreviewSection />
        </Suspense>

        <div className="snap-start">
          <CompanyLogos />
        </div>

        <AIStrategySection />

        <FeaturesSection />
      </main>

      <Footer />
    </div>
  )
}
