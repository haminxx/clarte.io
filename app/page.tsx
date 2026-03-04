"use client"

import React from "react"

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_LIVEKIT_URL) {
  console.warn("[Clarte] NEXT_PUBLIC_LIVEKIT_URL is undefined. Voice calls may not work.")
}
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { CompanyLogos } from "@/components/company-logos"
import { AIStrategySection } from "@/components/ai-strategy-section"
import { FeaturesSection } from "@/components/features-section"
import { DemoPreviewSection } from "@/components/demo-preview-section"
import { LandingLeftLogos } from "@/components/landing-left-logos"

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingLeftLogos />
      <div className="pl-16">
        <Header />

        <main className="overflow-x-hidden">
          <HeroSection />

          <DemoPreviewSection />

          <CompanyLogos />

          <AIStrategySection />

          <FeaturesSection />
        </main>

        <Footer />
      </div>
    </div>
  )
}
