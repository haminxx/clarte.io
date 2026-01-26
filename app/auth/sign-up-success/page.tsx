import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a14] px-4">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/20 via-indigo-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/90 p-8 shadow-2xl backdrop-blur-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Mail className="h-8 w-8 text-emerald-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-4 text-white/60">
            We&apos;ve sent you a confirmation link. Please check your email to verify your account.
          </p>
          
          <div className="mt-8">
            <Link href="/auth/login">
              <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
