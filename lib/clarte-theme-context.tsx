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
    return (stored === "dark" || stored === "bright") ? stored : "dark"
  })

  React.useEffect(() => {
    document.documentElement.setAttribute("data-clarte-theme", theme)
  }, [theme])

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
