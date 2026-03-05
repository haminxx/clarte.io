"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
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
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { EyelashEyeClosed, EyelashEyeOpen } from "@/components/icons/theme-eye"

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/download", label: "Download" },
  { href: "/api-reference", label: "API" },
  { href: "/demo", label: "Demo" },
]

export function Header() {
  const { theme, toggleTheme } = useClarteTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [auth, setAuth] = useState<import("firebase/auth").Auth | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

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
            className={cn(
              "hidden sm:flex items-center gap-2 rounded-full ring-2 p-0.5 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2",
              theme === "dark" ? "ring-white/20 focus:ring-white/40" : "ring-black/20 focus:ring-black/40"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? undefined} />
              <AvatarFallback className={cn("text-sm", theme === "dark" ? "bg-white/20 text-white" : "bg-black/20 text-black")}>
                {user.displayName?.[0] ?? user.email?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn("w-56", theme === "dark" ? "border-white/10 bg-[#1a1a2e]" : "border-black/10 bg-white")}>
          <DropdownMenuItem asChild>
            <Link href="/profile" className={cn("cursor-pointer", theme === "dark" ? "text-white" : "text-black")}>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className={cn("cursor-pointer", theme === "dark" ? "text-white" : "text-black")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSignOut}
            className={cn("cursor-pointer", theme === "dark" ? "text-white focus:bg-white/10" : "text-black focus:bg-black/5")}
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
            className={cn("w-full bg-transparent", theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-black/20 text-black hover:bg-black/10")}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </Button>
        </Link>
        <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
          <Button
            variant="outline"
            className={cn("w-full bg-transparent", theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-black/20 text-black hover:bg-black/10")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button
          variant="outline"
          className={cn("w-full bg-transparent", theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-black/20 text-black hover:bg-black/10")}
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

  const navCls = theme === "dark" ? "text-white/70" : "text-black/70"
  const navHover = theme === "dark" ? "hover:bg-white/5 hover:text-white" : "hover:bg-black/5 hover:text-black"
  const navActive = theme === "dark" ? "bg-white/15 text-white" : "bg-black/10 text-black"
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full overflow-x-hidden transition-all duration-300",
        scrolled
          ? theme === "dark"
            ? "border-b border-white/10 bg-background/80 backdrop-blur-md"
            : "border-b border-black/10 bg-white/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-[min(1400px,96vw)] 2xl:max-w-[min(1600px,94vw)] items-center justify-between pl-[clamp(1.5rem,4vw,7.5rem)] pr-[clamp(1.5rem,4vw,7.5rem)] sm:pl-[clamp(2rem,5vw,8rem)] sm:pr-[clamp(2rem,5vw,8rem)] lg:pl-[clamp(4rem,8vw,120px)] lg:pr-[clamp(4rem,8vw,120px)] 2xl:pl-[min(8vw,160px)] 2xl:pr-[min(8vw,160px)]">
        <div className="flex items-center gap-2">
          <Link href="/" className={cn("text-2xl font-bold", theme === "dark" ? "text-white" : "text-black")}>
            Clarte
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className={cn("rounded p-1 transition-colors hover:opacity-80", theme === "dark" ? "text-white" : "text-black")}
            aria-label={theme === "dark" ? "Switch to bright theme" : "Switch to dark theme"}
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <EyelashEyeClosed
                className={cn(
                  "absolute transition-all duration-300 ease-out origin-center",
                  theme === "dark" ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
                )}
              />
              <EyelashEyeOpen
                className={cn(
                  "absolute transition-all duration-300 ease-out origin-center",
                  theme === "bright" ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
                )}
              />
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-3 lg:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href !== "/download" &&
                (pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href)))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition-colors",
                    navHover,
                    isActive ? navActive : navCls
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <Link
            href="/contact"
            className={cn(
              "hidden md:inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all",
              theme === "bright" ? "bg-black text-white hover:bg-black/90" : "text-black bg-gradient-to-r from-white to-white/90 hover:from-white/95 hover:to-white/80 shadow-sm"
            )}
          >
            Request Access
          </Link>
          <AuthButtons />

          <Button
            variant="ghost"
            size="icon"
            className={cn("lg:hidden", theme === "dark" ? "text-white" : "text-black")}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <Menu
                className={cn(
                  "absolute h-5 w-5 transition-all duration-200 ease-out",
                  mobileMenuOpen ? "opacity-0 rotate-90 scale-90" : "opacity-100 rotate-0 scale-100"
                )}
              />
              <X
                className={cn(
                  "absolute h-5 w-5 transition-all duration-200 ease-out",
                  mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-90"
                )}
              />
            </span>
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className={cn(
            "border-t lg:hidden w-full backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200",
            theme === "dark" ? "border-white/10 bg-background/95" : "border-black/10 bg-white/95"
          )}
        >
          <div className="mx-auto max-w-[min(1400px,96vw)] 2xl:max-w-[min(1600px,94vw)] pl-[clamp(1.5rem,4vw,7.5rem)] pr-[clamp(1.5rem,4vw,7.5rem)] sm:pl-[clamp(2rem,5vw,8rem)] sm:pr-[clamp(2rem,5vw,8rem)] lg:pl-[clamp(4rem,8vw,120px)] lg:pr-[clamp(4rem,8vw,120px)] 2xl:pl-[min(8vw,160px)] 2xl:pr-[min(8vw,160px)] py-4 w-full">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const isActive =
                  link.href !== "/download" &&
                  (pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href)))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm transition-colors",
                      theme === "dark" ? "hover:bg-white/5 hover:text-white" : "hover:bg-black/5 hover:text-black",
                      isActive ? (theme === "dark" ? "bg-white/15 text-white" : "bg-black/10 text-black") : (theme === "dark" ? "text-white/70" : "text-black/70")
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <Link
                href="/contact"
                className={cn(
                  "rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                  theme === "dark" ? "text-black bg-gradient-to-r from-white to-white/90 hover:from-white/95 hover:to-white/80" : "bg-black text-white hover:bg-black/90"
                )}
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
