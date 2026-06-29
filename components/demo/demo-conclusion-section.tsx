"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ExternalLink, GitBranch, Lightbulb, BookOpen, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DemoConclusionData, DemoEndReason } from "@/hooks/use-demo-session"

interface DemoConclusionSectionProps {
  visible: boolean
  loading: boolean
  data: DemoConclusionData | null
  endReason?: DemoEndReason | null
  onStartNew: () => void
  isBright?: boolean
}

export function DemoConclusionSection({
  visible,
  loading,
  data,
  endReason,
  onStartNew,
  isBright = false,
}: DemoConclusionSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (visible && !loading && data) {
      const t = setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 400)
      return () => clearTimeout(t)
    }
  }, [visible, loading, data])

  if (!visible) return null

  const textMuted = isBright ? "text-black/60" : "text-white/60"
  const textMain = isBright ? "text-black" : "text-white"
  const cardBg = isBright ? "border-black/10 bg-white/80" : "border-white/10 bg-[#1a1a2e]/70"

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 w-full scroll-mt-24"
    >
      <div className={cn("rounded-3xl border p-6 sm:p-8 backdrop-blur-md shadow-2xl", cardBg)}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={cn("text-xs font-medium uppercase tracking-widest", textMuted)}>
              Session complete
              {endReason === "timer" && " · 5 minute limit"}
              {endReason === "natural" && " · Natural conclusion"}
            </p>
            <h2 className={cn("mt-2 text-2xl font-semibold sm:text-3xl", textMain)}>
              Your Clarte conclusion
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={onStartNew} className="gap-2 rounded-full">
            <RotateCcw className="h-4 w-4" />
            Start new demo
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn("h-16 animate-pulse rounded-xl", isBright ? "bg-black/5" : "bg-white/5")} />
            ))}
            <p className={cn("text-center text-sm", textMuted)}>Generating your summary and research…</p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            <div>
              <p className={cn("mb-2 text-sm font-medium", textMuted)}>Summary</p>
              <p className={cn("text-base leading-relaxed", isBright ? "text-black/80" : "text-white/85")}>
                {data.summary}
              </p>
            </div>

            {data.mindmap?.nodes?.length > 0 && (
              <div>
                <p className={cn("mb-3 flex items-center gap-2 text-sm font-medium", textMuted)}>
                  <GitBranch className="h-4 w-4" />
                  Conversation diagram
                </p>
                <div className="relative overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-6">
                  <div className="flex min-w-max flex-col items-center gap-4">
                    {data.mindmap.nodes.slice(0, 8).map((node, i) => (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex flex-col items-center"
                      >
                        {i > 0 && (
                          <div className="mb-2 h-6 w-px bg-gradient-to-b from-violet-500/50 to-transparent" />
                        )}
                        <span
                          className={cn(
                            "rounded-xl px-4 py-2 text-sm font-medium shadow-lg",
                            node.type === "topic" && "bg-blue-500/25 text-blue-200",
                            node.type === "question" && "bg-amber-500/25 text-amber-200",
                            node.type === "answer" && "bg-emerald-500/25 text-emerald-200",
                            node.type === "guidance" && "bg-purple-500/25 text-purple-200",
                            node.type === "change" && "bg-rose-500/25 text-rose-200",
                            !["topic", "question", "answer", "guidance", "change"].includes(node.type) &&
                              "bg-white/10 text-white/80"
                          )}
                        >
                          {node.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {data.action_items?.length > 0 && (
              <div>
                <p className={cn("mb-3 flex items-center gap-2 text-sm font-medium", textMuted)}>
                  <Lightbulb className="h-4 w-4" />
                  What to do next
                </p>
                <ul className="space-y-2">
                  {data.action_items.map((item, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
                        isBright ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-white/[0.03]"
                      )}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/30 text-xs font-bold text-violet-200">
                        {i + 1}
                      </span>
                      <span className={isBright ? "text-black/80" : "text-white/85"}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.research?.length > 0 && (
              <div>
                <p className={cn("mb-3 flex items-center gap-2 text-sm font-medium", textMuted)}>
                  <BookOpen className="h-4 w-4" />
                  Supporting research
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.research.map((item, i) => (
                    <a
                      key={i}
                      href={item.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group rounded-xl border p-4 transition-colors hover:border-violet-500/40",
                        isBright ? "border-black/10 bg-white/50" : "border-white/10 bg-white/[0.03]"
                      )}
                    >
                      <p className={cn("flex items-center gap-1.5 font-medium", textMain)}>
                        {item.title}
                        {item.url && <ExternalLink className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />}
                      </p>
                      {item.snippet && (
                        <p className={cn("mt-2 line-clamp-3 text-xs leading-relaxed", textMuted)}>{item.snippet}</p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </motion.section>
  )
}
