"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getFirebaseAuth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_LIVEKIT_URL) {
  console.warn("[Clarte] NEXT_PUBLIC_LIVEKIT_URL is undefined. Voice calls may not work.")
}
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { CompanyLogos } from "@/components/company-logos"
import { FeaturesSection } from "@/components/features-section"

export default function Home() {
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const auth = getFirebaseAuth()

  useEffect(() => {
    if (!auth) {
      setAuthChecked(true)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthChecked(true)
    })
    return () => unsub()
  }, [auth])

  useEffect(() => {
    if (authChecked && user) {
      router.replace("/dashboard")
    }
  }, [authChecked, user, router])

  if (authChecked && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

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
