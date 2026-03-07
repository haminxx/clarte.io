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
  const [theme, setThemeState] = React.useState<ClarteTheme>(() => {
    if (typeof window === "undefined") return "dark"
    const stored = localStorage.getItem(STORAGE_KEY) as ClarteTheme | null
    if (stored === "dark" || stored === "bright") return stored
    const fromDoc = document.documentElement.getAttribute("data-clarte-theme") as ClarteTheme | null
    return (fromDoc === "dark" || fromDoc === "bright") ? fromDoc : "dark"
  })

  React.useEffect(() => {
    document.documentElement.setAttribute("data-clarte-theme", theme)
  }, [theme])

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ClarteTheme | null
    const fromDoc = document.documentElement.getAttribute("data-clarte-theme") as ClarteTheme | null
    const next = (stored === "dark" || stored === "bright") ? stored : (fromDoc === "dark" || fromDoc === "bright") ? fromDoc : null
    if (next) {
      setThemeState(next)
      document.documentElement.setAttribute("data-clarte-theme", next)
    }
  }, [])

  const setTheme = React.useCallback((t: ClarteTheme) => {
    setThemeState(t)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, t)
      document.documentElement.setAttribute("data-clarte-theme", t)
    }
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "bright" : "dark")
  }, [setTheme, theme])

  return (
    <ClarteThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ClarteThemeContext.Provider>
  )
}
