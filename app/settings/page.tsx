"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getFirebaseAuth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { Footer } from "@/components/footer"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, Settings as SettingsIcon, User as UserIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const auth = getFirebaseAuth()

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false)
      router.replace("/auth/login")
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) {
        router.replace("/auth/login")
        return
      }
      setAuthLoading(false)
    })
    return () => unsub()
  }, [auth, router])

  const handleSignOut = async () => {
    if (!auth) return
    await signOut(auth)
    router.replace("/")
    router.refresh()
  }

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
      <div className="flex min-h-screen flex-col bg-[#0a0a14]">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/10 via-indigo-500/5 to-transparent blur-3xl" />
        </div>
        <DashboardSidebar />
        <div className="relative z-10 ml-16 flex min-h-screen flex-col lg:ml-16">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a14]/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="h-7 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-9 w-20 animate-pulse rounded-full bg-white/10" />
            </div>
          </header>
          <main className="relative z-10 mx-auto flex-1 w-full max-w-6xl px-4 py-8">
            <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-[#1a1a2e]/50" />
          </main>
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a14]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/10 via-indigo-500/5 to-transparent blur-3xl" />
      </div>

      <DashboardSidebar />

      <div className="relative z-10 ml-16 flex min-h-screen flex-col lg:ml-16">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a14]/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="text-xl font-bold text-white">
                Clarte
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full ring-2 ring-white/20 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? undefined} />
                      <AvatarFallback className="bg-white/20 text-white">
                        {user.displayName?.[0] ?? user.email?.[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#1a1a2e]">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer text-white">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer text-white">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-white focus:bg-white/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex-1 w-full max-w-6xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="mt-1 text-sm text-white/60">Manage your preferences and account settings.</p>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Account</h2>
              <p className="text-sm text-white/60">
                Manage your account through your authentication provider. Sign out below to switch accounts.
              </p>
              <Button
                variant="outline"
                className="mt-4 border-white/20 bg-transparent text-white hover:bg-white/10"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Preferences</h2>
              <p className="text-sm text-white/60">Additional settings will be available in a future update.</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
