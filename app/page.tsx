"use client"

import React from "react"

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_LIVEKIT_URL) {
  console.warn("[Clarte] NEXT_PUBLIC_LIVEKIT_URL is undefined. Voice calls may not work.")
}
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageThemeBg } from "@/components/page-theme-bg"
import { HeroSection } from "@/components/hero-section"
import { CompanyLogos } from "@/components/company-logos"
import { AIStrategySection } from "@/components/ai-strategy-section"
import { FeaturesSection } from "@/components/features-section"
import { DemoPreviewSection } from "@/components/demo-preview-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden">
      <PageThemeBg />
      <Header />

      <main className="overflow-x-hidden snap-y snap-mandatory">
        <HeroSection />

        <DemoPreviewSection />

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
