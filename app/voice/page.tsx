"use client"

/**
 * Embeddable voice page for Chrome extension side panel.
 * Minimal layout, auth guard, VoiceAgentCard.
 * Use ?embed=1 to hide extra chrome when embedded in extension.
 */
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import { getFirebaseAuth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useRouter } from "next/navigation"

const VoiceAgentCard = dynamic(
  () => import("@/components/dashboard/voice-agent-card").then((m) => ({ default: m.VoiceAgentCard })),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-2xl border border-white/10 bg-[#1a1a2e]/50" /> }
)

function VoicePageContent() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const auth = getFirebaseAuth()
  const embed = searchParams.get("embed") === "1"

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false)
      router.replace("/auth/login?next=/voice")
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) {
        router.replace("/auth/login?next=/voice")
        return
      }
      setAuthLoading(false)
    })
    return () => unsub()
  }, [auth, router])

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a14]">
        <div className="text-center text-white/60">
          <p>Firebase is not configured.</p>
          <Link href="/" className="mt-4 inline-block text-white underline">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a14]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <p className="mt-4 text-sm text-white/60">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/10 via-indigo-500/5 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-4 py-6">
        {!embed && (
          <div className="mb-4 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold text-white hover:text-white/80">
              Clarte
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-white/60 hover:text-white"
            >
              Dashboard
            </Link>
          </div>
        )}
        <VoiceAgentCard
          userId={user.uid}
          userDisplayName={user.displayName ?? null}
          getAuthToken={async () => (user ? (await user.getIdToken?.()) ?? null : null)}
        />
      </div>
    </div>
  )
}

export default function VoicePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a14]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <p className="mt-4 text-sm text-white/60">Loading…</p>
      </div>
    }>
      <VoicePageContent />
    </Suspense>
  )
}
