"use client"

import * as React from "react"

type ClarteTheme = "dark" | "bright"

const STORAGE_KEY = "clarte-theme"

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

export function ClarteThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ClarteTheme>("dark")
  const [mounted, setMounted] = React.useState(false)

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
    setThemeState((prev) => {
      const next = prev === "dark" ? "bright" : "dark"
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, next)
        document.documentElement.setAttribute("data-clarte-theme", next)
      }
      return next
    })
  }, [])

  React.useEffect(() => {
    document.documentElement.setAttribute("data-clarte-theme", theme)
  }, [theme])

  return (
    <ClarteThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ClarteThemeContext.Provider>
  )
}
