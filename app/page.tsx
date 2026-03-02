"use client"

import React from "react"

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_LIVEKIT_URL) {
  console.warn("[Clarte] NEXT_PUBLIC_LIVEKIT_URL is undefined. Voice calls may not work.")
}
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { AIStrategySection } from "@/components/ai-strategy-section"
import { CompanyLogos } from "@/components/company-logos"
import { FeaturesSection } from "@/components/features-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main className="overflow-x-hidden">
        <HeroSection />

        <AIStrategySection />

        <div className="border-y border-border bg-background">
          <CompanyLogos />
        </div>

        <FeaturesSection />
      </main>

      <Footer />
    </div>
  )
}
