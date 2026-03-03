"use client"

import * as React from "react"

type ClarteTheme = "dark" | "bright"

const STORAGE_KEY = "clarte-theme"
const TRANSITION_MS = 600

const ClarteThemeContext = React.createContext<{
  theme: ClarteTheme
  setTheme: (theme: ClarteTheme) => void
  toggleTheme: () => void
} | null>(null)

export function useClarteTheme() {
  const ctx = React.useContext(ClarteThemeContext)
  // During prerender/SSR, provider may not be in tree yet; return default
  if (!ctx) {
    return {
      theme: "dark" as ClarteTheme,
      setTheme: () => {},
      toggleTheme: () => {},
    }
  }
  return ctx
}

const overlayBgDark = "#0a0a14"
const overlayBgBright = "linear-gradient(to bottom, rgb(224 242 254), rgb(219 234 254), rgb(226 232 240))"

export function ClarteThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ClarteTheme>("dark")
  const [mounted, setMounted] = React.useState(false)
  const [transitioningTo, setTransitioningTo] = React.useState<ClarteTheme | null>(null)
  const [overlayExpanded, setOverlayExpanded] = React.useState(false)
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const transitionTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted || typeof window === "undefined") return
    const stored = localStorage.getItem(STORAGE_KEY) as ClarteTheme | null
    if (stored === "dark" || stored === "bright") {
      setThemeState(stored)
    }
  }, [mounted])

  const setTheme = React.useCallback((t: ClarteTheme) => {
    setThemeState(t)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, t)
      document.documentElement.setAttribute("data-clarte-theme", t)
    }
  }, [])

  const toggleTheme = React.useCallback(() => {
    if (transitioningTo !== null) return
    const next: ClarteTheme = theme === "dark" ? "bright" : "dark"
    setTransitioningTo(next)
    setOverlayExpanded(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOverlayExpanded(true))
    })
  }, [theme, transitioningTo])

  React.useEffect(() => {
    if (!transitioningTo) return
    const onEnd = () => {
      setTheme(transitioningTo)
      setTransitioningTo(null)
      setOverlayExpanded(false)
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
    }
    const el = overlayRef.current
    if (el) {
      el.addEventListener("transitionend", onEnd, { once: true })
    }
    transitionTimeoutRef.current = setTimeout(onEnd, TRANSITION_MS + 50)
    return () => {
      if (el) el.removeEventListener("transitionend", onEnd)
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
    }
  }, [transitioningTo, setTheme])

  React.useEffect(() => {
    document.documentElement.setAttribute("data-clarte-theme", theme)
  }, [theme])

  return (
    <ClarteThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
      {transitioningTo !== null && (
        <div
          ref={overlayRef}
          role="presentation"
          aria-hidden
          className="fixed inset-0 z-[9999] pointer-events-none"
          style={{
            background: transitioningTo === "dark" ? overlayBgDark : overlayBgBright,
            clipPath: overlayExpanded ? "circle(150% at 50% 50%)" : "circle(0% at 50% 50%)",
            transition: `clip-path ${TRANSITION_MS}ms ease-out`,
          }}
        />
      )}
    </ClarteThemeContext.Provider>
  )
}
