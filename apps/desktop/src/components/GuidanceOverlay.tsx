import { useEffect, useRef } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

export interface GuidanceContent {
  title?: string
  text?: string
  math?: string
  steps?: string[]
  highlights?: Array<{
    shape: "circle" | "box"
    x: number
    y: number
    radius?: number
    width?: number
    height?: number
    label?: string
  }>
}

interface GuidanceOverlayProps {
  content: GuidanceContent
  onDismiss: () => void
}

export function GuidanceOverlay({ content, onDismiss }: GuidanceOverlayProps) {
  const mathRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (content.math && mathRef.current) {
      try {
        katex.render(content.math, mathRef.current, {
          throwOnError: false,
          displayMode: true,
        })
      } catch {
        mathRef.current.textContent = content.math
      }
    }
  }, [content.math])

  const hasContent =
    content.title || content.text || content.math || (content.steps && content.steps.length > 0)

  if (!hasContent) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="mx-4 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl"
        style={{ pointerEvents: "auto" }}
      >
        {content.title && (
          <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">{content.title}</h3>
        )}
        {content.text && (
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">{content.text}</p>
        )}
        {content.math && (
          <div
            ref={mathRef}
            className="mb-4 overflow-x-auto py-2 text-[var(--foreground)]"
          />
        )}
        {content.steps && content.steps.length > 0 && (
          <ol className="mb-6 list-decimal space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {content.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        )}
        <button
          onClick={onDismiss}
          className="w-full rounded-full bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
