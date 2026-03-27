import type { Locale } from "@/lib/language-context"

/** Representative longitude (deg) for initial globe orientation by app locale. */
export function localeToFocusLongitude(locale: Locale): number {
  const map: Record<Locale, number> = {
    en: -98,
    ko: 127,
    ja: 139.7,
    zh: 116.4,
    es: -3.7,
    hi: 77.2,
  }
  return map[locale] ?? -98
}
