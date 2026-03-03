"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useClarteTheme } from "@/lib/clarte-theme-context"

const ROW_HEIGHT = 40
const VISIBLE_ROWS = 3
const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS

export interface ScrollPickerOption {
  id: string
  label: string
}

interface ScrollPickerProps {
  options: ScrollPickerOption[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
}

export function ScrollPicker({
  options,
  value,
  onChange,
  placeholder = "Select",
  disabled = false,
  className,
  triggerClassName,
}: ScrollPickerProps) {
  const [open, setOpen] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const isScrollingRef = React.useRef(false)
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  if (options.length === 0) return null

  const displayLabel = options.find((o) => o.id === value)?.label ?? placeholder

  const duplicated = React.useMemo(() => {
    const list: ScrollPickerOption[] = []
    for (let i = 0; i < 9; i++) {
      list.push(...options)
    }
    return list
  }, [options])

  const centerOffset = CONTAINER_HEIGHT / 2 - ROW_HEIGHT / 2

  const scrollToValue = React.useCallback(
    (val: string) => {
      const el = scrollRef.current
      if (!el) return
      const firstIndex = duplicated.findIndex((o) => o.id === val)
      if (firstIndex === -1) return
      const offset = firstIndex * ROW_HEIGHT
      el.scrollTop = offset - centerOffset
    },
    [duplicated, centerOffset]
  )

  React.useEffect(() => {
    if (open && scrollRef.current) {
      requestAnimationFrame(() => scrollToValue(value))
    }
  }, [open, value, scrollToValue])

  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (!el || isScrollingRef.current) return

    const center = el.scrollTop + CONTAINER_HEIGHT / 2
    const index = Math.round((center - centerOffset) / ROW_HEIGHT)
    const clamped = Math.max(0, Math.min(index, duplicated.length - 1))
    const item = duplicated[clamped]
    if (item && item.id !== value) {
      onChange(item.id)
    }
  }, [duplicated, value, onChange, centerOffset])

  const scrollEndTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleScrollEnd = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    isScrollingRef.current = true
    const center = el.scrollTop + CONTAINER_HEIGHT / 2
    const index = Math.round((center - centerOffset) / ROW_HEIGHT)
    const clamped = Math.max(0, Math.min(index, duplicated.length - 1))
    const item = duplicated[clamped]
    if (item) {
      const offset = clamped * ROW_HEIGHT
      el.scrollTo({ top: offset - centerOffset, behavior: "smooth" })
      onChange(item.id)
    }
    setTimeout(() => {
      isScrollingRef.current = false
    }, 300)
  }, [duplicated, onChange, centerOffset])

  const onScroll = React.useCallback(() => {
    handleScroll()
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
    scrollEndTimerRef.current = setTimeout(handleScrollEnd, 150)
  }, [handleScroll, handleScrollEnd])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium ring-1 shadow-sm transition-colors disabled:opacity-60 disabled:pointer-events-none",
            isBright
              ? "bg-white/80 text-black ring-black/10 hover:bg-white/90"
              : "bg-muted/50 text-foreground ring-border/50 hover:bg-muted/70",
            triggerClassName
          )}
        >
          {displayLabel}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-auto p-0", className)}>
        <div
          ref={scrollRef}
          className="scroll-picker-scroll overflow-y-auto overscroll-contain scroll-smooth"
          style={{
            height: CONTAINER_HEIGHT,
            scrollSnapType: "y mandatory",
          }}
          onScroll={onScroll}
        >
          <div style={{ paddingTop: centerOffset, paddingBottom: centerOffset }}>
            {duplicated.map((opt, i) => (
              <div
                key={`${opt.id}-${i}`}
                className="flex items-center justify-center text-sm font-medium transition-colors"
                style={{
                  height: ROW_HEIGHT,
                  scrollSnapAlign: "center",
                }}
                data-value={opt.id}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
