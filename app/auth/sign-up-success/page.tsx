"use client"

import { useState } from "react"
import Link from "next/link"
import { getFirebaseAuth } from "@/lib/firebase"
import { sendEmailVerification } from "firebase/auth"
import { Mail, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)

  const handleResendVerification = async () => {
    const auth = getFirebaseAuth()
    const user = auth?.currentUser
    if (!user || !auth) {
      setResendError("You must be signed in to resend the verification email.")
      return
    }
    if (user.emailVerified) {
      setResendError("Your email is already verified.")
      return
    }
    setResending(true)
    setResendError(null)
    setResendSuccess(false)
    try {
      await sendEmailVerification(user, {
        url: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
        handleCodeInApp: true,
      })
      setResendSuccess(true)
    } catch (err: unknown) {
      setResendError(err instanceof Error ? err.message : "Failed to send verification email. Please try again.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/90 p-8 shadow-2xl backdrop-blur-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Mail className="h-8 w-8 text-emerald-400" />
          </div>

          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-4 text-white/60">
            We&apos;ve sent you a confirmation link. Please check your email to verify your account.
          </p>
          <p className="mt-2 text-sm text-white/40">
            Can&apos;t find it? Check your spam folder.
          </p>

          {resendSuccess && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Verification email sent again.
            </div>
          )}
          {resendError && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {resendError}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={handleResendVerification}
              disabled={resending}
            >
              {resending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Resend verification email
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
