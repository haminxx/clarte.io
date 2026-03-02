"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User as UserIcon, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/demo", label: "Demo" },
  { href: "/download", label: "Download" },
  { href: "/api-reference", label: "API" },
  { href: "/about", label: "About" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [auth, setAuth] = useState<import("firebase/auth").Auth | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    import("@/lib/firebase").then(({ getFirebaseAuth }) => {
      const a = getFirebaseAuth()
      setAuth(a)
    })
  }, [])

  const unsubRef = useRef<(() => void) | null>(null)
  useEffect(() => {
    if (!auth) {
      setAuthChecked(true)
      return
    }
    import("firebase/auth").then(({ onAuthStateChanged }) => {
      unsubRef.current = onAuthStateChanged(auth, (u) => {
        setUser(u)
        setAuthChecked(true)
      })
    })
    return () => {
      unsubRef.current?.()
      unsubRef.current = null
    }
  }, [auth])

  const handleSignOut = async () => {
    if (!auth) return
    const { signOut } = await import("firebase/auth")
    await signOut(auth)
    setMobileMenuOpen(false)
    router.replace("/")
    router.refresh()
  }

  const AuthButtons = () => {
    if (!authChecked || !user) return null
    return (
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
            <Link href="/profile" className="cursor-pointer text-white">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer text-white">
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
    )
  }

  const MobileAuthButtons = () => {
    if (!authChecked || !user) return null
    return (
      <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
        <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
          <Button
            variant="outline"
            className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </Button>
        </Link>
        <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
          <Button
            variant="outline"
            className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
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
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full overflow-x-hidden transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 w-full">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-lg font-semibold text-white">
            Clarte
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
            className="hidden md:inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-black bg-gradient-to-r from-white to-white/90 hover:from-white/95 hover:to-white/80 transition-all shadow-sm"
          >
            Request Access
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
                className="rounded-md px-4 py-2.5 text-sm font-medium text-black bg-gradient-to-r from-white to-white/90 hover:from-white/95 hover:to-white/80 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Request Access
              </Link>
              <MobileAuthButtons />
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
