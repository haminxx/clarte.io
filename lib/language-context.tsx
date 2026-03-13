"use client"

import * as React from "react"
import en from "@/messages/en.json"

export type Locale = "en" | "ko" | "es" | "zh" | "hi" | "ja"

const STORAGE_KEY = "clarte-locale"

const LOCALE_OPTIONS: Locale[] = ["en", "ko", "es", "zh", "hi", "ja"]

/** English is always loaded for instant fallback; other locales load on demand */
const initialMessages: Record<Locale, Record<string, unknown> | null> = {
  en: en as Record<string, unknown>,
  ko: null,
  es: null,
  zh: null,
  hi: null,
  ja: null,
}

function getNested(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".")
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

const loadLocale = (locale: Locale): Promise<Record<string, unknown>> =>
  import(`@/messages/${locale}.json`).then((m) => m.default as Record<string, unknown>)

const LanguageContext = React.createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
} | null>(null)

export function useLanguage() {
  const ctx = React.useContext(LanguageContext)
  if (!ctx) {
    return {
      locale: "en" as Locale,
      setLocale: () => {},
      t: (key: string) => key,
    }
  }
  return ctx
}

export function useTranslation() {
  const { t } = useLanguage()
  return { t }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(() => {
    if (typeof window === "undefined") return "en"
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && LOCALE_OPTIONS.includes(stored)) return stored
    return "en"
  })
  const [messagesMap, setMessagesMap] = React.useState<Record<Locale, Record<string, unknown> | null>>(() => ({ ...initialMessages }))
  const loadingRef = React.useRef<Set<Locale>>(new Set())

  // Load non-en locale messages on demand (en is preloaded)
  React.useEffect(() => {
    if (locale === "en" || messagesMap[locale]) return
    if (loadingRef.current.has(locale)) return
    loadingRef.current.add(locale)
    loadLocale(locale).then((m) => {
      setMessagesMap((prev) => ({ ...prev, [locale]: m }))
    })
  }, [locale, messagesMap])

  // Restore stored locale on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && LOCALE_OPTIONS.includes(stored) && stored !== locale) {
      setLocaleState(stored)
    }
  }, [])

  React.useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, l)
      document.documentElement.lang = l
    }
  }, [])

  const t = React.useCallback(
    (key: string): string => {
      const messages = messagesMap[locale]
      const fallback = messagesMap.en
      let v = messages ? getNested(messages, key) : undefined
      if (v !== undefined && v !== null) {
        if (typeof v === "string") return v
        if (Array.isArray(v)) return v.map((s) => String(s)).join(" ")
      }
      if (fallback) {
        const enVal = getNested(fallback, key)
        if (typeof enVal === "string") return enVal
        if (Array.isArray(enVal)) return enVal.map((s) => String(s)).join(" ")
      }
      return key
    },
    [locale, messagesMap]
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
