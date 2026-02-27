import { useEffect, useState } from "react"
import { listen } from "@tauri-apps/api/event"
import "./index.css"

interface Highlight {
  shape: "circle" | "box"
  x: number
  y: number
  radius?: number
  width?: number
  height?: number
  label?: string
}

export default function OverlayWindow() {
  const [highlights, setHighlights] = useState<Highlight[]>([])

  useEffect(() => {
    const unlisten = listen<Highlight[]>("guidance-highlights", (ev) => {
      setHighlights(ev.payload ?? [])
    })
    const unlistenDismiss = listen("dismiss-overlay", () => {
      setHighlights([])
    })
    return () => {
      unlisten.then((fn) => fn())
      unlistenDismiss.then((fn) => fn())
    }
  }, [])

  if (highlights.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-transparent"
        style={{ pointerEvents: "none" }}
      />
    )
  }

  return (
    <div
      className="fixed inset-0 bg-transparent"
      style={{ pointerEvents: "none" }}
    >
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {highlights.map((h, i) => {
          if (h.shape === "circle") {
            const cx = `${h.x}%`
            const cy = `${h.y}%`
            const r = `${h.radius ?? 5}%`
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.8)"
                  strokeWidth="3"
                />
                {h.label && (
                  <text
                    x={cx}
                    y={`${h.y + (h.radius ?? 5) + 3}%`}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                  >
                    {h.label}
                  </text>
                )}
              </g>
            )
          }
          if (h.shape === "box") {
            return (
              <g key={i}>
                <rect
                  x={`${h.x}%`}
                  y={`${h.y}%`}
                  width={`${h.width ?? 20}%`}
                  height={`${h.height ?? 10}%`}
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.8)"
                  strokeWidth="3"
                />
                {h.label && (
                  <text
                    x={`${h.x}%`}
                    y={`${h.y}%`}
                    dx="2"
                    dy="-5"
                    fill="white"
                    fontSize="12"
                  >
                    {h.label}
                  </text>
                )}
              </g>
            )
          }
          return null
        })}
      </svg>
    </div>
  )
}
