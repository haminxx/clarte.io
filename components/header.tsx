"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getFirebaseAuth } from "@/lib/firebase"
import { signOut, onAuthStateChanged, type User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navLinks = [
  { href: "/api-reference", label: "API" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
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

  const handleSignOut = async () => {
    if (!auth) return
    await signOut(auth)
    setMobileMenuOpen(false)
    router.replace("/")
    router.refresh()
  }

  const AuthButtons = () => {
    if (!authChecked || !user) {
      return (
        <>
          <Link href="/auth/login" className="hidden sm:block">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              Log in
            </Button>
          </Link>
          <Link href="/auth/sign-up" className="hidden sm:block">
            <Button size="sm" className="bg-white text-black hover:bg-white/90">
              Get Started
            </Button>
          </Link>
        </>
      )
    }
    return (
      <>
        <Link href="/dashboard" className="hidden sm:block">
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
            type="button"
            className="hidden sm:flex items-center gap-2 rounded-full ring-2 ring-white/20 p-0.5 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? undefined} />
              <AvatarFallback className="bg-white/20 text-white text-sm">
                {user.displayName?.[0] ?? user.email?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#1a1a2e]">
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer text-white">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer text-white">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer text-white">
              <Settings className="mr-2 h-4 w-4" />
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
      </>
    )
  }

  const MobileAuthButtons = () => {
    if (!authChecked || !user) {
      return (
        <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
          <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
            <Button
              variant="outline"
              className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              Log in
            </Button>
          </Link>
          <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full bg-white text-black hover:bg-white/90">
              Get Started
            </Button>
          </Link>
        </div>
      )
    }
    return (
      <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
          <Button
            variant="outline"
            className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={() => {
            setMobileMenuOpen(false)
            handleSignOut()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md w-full overflow-x-hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 w-full">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M8 8L16 4L24 8V16L16 28L8 16V8Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="16" cy="12" r="3" fill="currentColor" />
            </svg>
            <span className="text-lg font-semibold text-white">Clarte</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white md:block"
          >
            Talk to Us
          </Link>
          <AuthButtons />

          <Button
            variant="ghost"
            size="icon"
            className="text-white lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-background/95 backdrop-blur-md lg:hidden w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 w-full">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="rounded-md px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Talk to Us
              </Link>
              <MobileAuthButtons />
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
