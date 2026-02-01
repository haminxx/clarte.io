"use client"

import React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { CompanyLogos } from "@/components/company-logos"
import { FeaturesSection } from "@/components/features-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main className="overflow-x-hidden">
        <HeroSection />

        <div className="border-y border-border bg-background">
          <CompanyLogos />
        </div>

        <FeaturesSection />
      </main>

      <Footer />
    </div>
  )
}
