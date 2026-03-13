"use client"

import { Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage, type Locale } from "@/lib/language-context"
import { useClarteTheme } from "@/lib/clarte-theme-context"

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
  { value: "zh", label: "中文" },
  { value: "hi", label: "हिन्दी" },
  { value: "ja", label: "日本語" },
]

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage()
  const { theme } = useClarteTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-full",
            theme === "dark" ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"
          )}
          aria-label="Select language"
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={cn(
          "min-w-[10rem] duration-300 ease-out backdrop-blur-xl",
          theme === "dark" ? "border-white/20 bg-white/5" : "border-black/10 bg-black/5"
        )}
      >
        <DropdownMenuRadioGroup value={locale} onValueChange={(v) => setLocale(v as Locale)}>
          {LOCALE_OPTIONS.map((opt) => (
            <DropdownMenuRadioItem
              key={opt.value}
              value={opt.value}
              className={cn(
                "cursor-pointer",
                theme === "dark" ? "text-white focus:bg-white/10 focus:text-white" : "text-black focus:bg-black/5 focus:text-black"
              )}
            >
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
