"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"

/**
 * Firebase Auth: OAuth redirect lands here (e.g. signInWithRedirect).
 * Client-side redirect to ?next= or /dashboard. Static-export safe.
 */
function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"

  useEffect(() => {
    window.location.replace(next)
  }, [next])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting…</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading…</p></div>}>
      <AuthCallbackContent />
    </Suspense>
  )
}
