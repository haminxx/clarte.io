"use client"

import * as React from "react"
import en from "@/messages/en.json"
import ko from "@/messages/ko.json"
import es from "@/messages/es.json"
import zh from "@/messages/zh.json"
import hi from "@/messages/hi.json"
import ja from "@/messages/ja.json"

export type Locale = "en" | "ko" | "es" | "zh" | "hi" | "ja"

const STORAGE_KEY = "clarte-locale"

const messagesMap: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  ko: ko as Record<string, unknown>,
  es: es as Record<string, unknown>,
  zh: zh as Record<string, unknown>,
  hi: hi as Record<string, unknown>,
  ja: ja as Record<string, unknown>,
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
      t: (key: string) => {
        const v = getNested(messagesMap.en, key)
        if (typeof v === "string") return v
        if (Array.isArray(v)) return v.join(" ")
        return key
      },
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
    if (stored && Object.keys(messagesMap).includes(stored)) return stored
    return "en"
  })

  React.useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && Object.keys(messagesMap).includes(stored)) {
      setLocaleState(stored)
      document.documentElement.lang = stored
    }
  }, [])

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, l)
      document.documentElement.lang = l
    }
  }, [])

  const t = React.useCallback(
    (key: string): string => {
      const messages = messagesMap[locale] ?? messagesMap.en
      let v = getNested(messages, key)
      if (v !== undefined && v !== null) {
        if (typeof v === "string") return v
        if (Array.isArray(v)) return v.map((s) => String(s)).join(" ")
      }
      const enVal = getNested(messagesMap.en, key)
      if (typeof enVal === "string") return enVal
      if (Array.isArray(enVal)) return enVal.map((s) => String(s)).join(" ")
      return key
    },
    [locale]
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
