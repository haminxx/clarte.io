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
}

export function DemoConclusionSection({
  visible,
  loading,
  data,
  endReason,
  onStartNew,
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

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 w-full scroll-mt-24"
    >
      <div
        className={cn(
          "rounded-2xl border border-[#EBEBEB] bg-white p-6 sm:p-8",
          "shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.05)]"
        )}
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8F8F8F]">
              Session complete
              {endReason === "timer" && " · 5 minute limit"}
              {endReason === "natural" && " · Natural conclusion"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#171717] sm:text-3xl">
              Your Clarte conclusion
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onStartNew}
            className="gap-2 rounded-lg border-[#EBEBEB] text-[#171717]"
          >
            <RotateCcw className="h-4 w-4" />
            Start new demo
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[#F2F2F2]" />
            ))}
            <p className="text-center text-sm text-[#8F8F8F]">Generating your summary and research…</p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            <div>
              <p className="mb-2 text-sm font-medium text-[#4D4D4D]">Summary</p>
              <p className="text-base leading-relaxed text-[#171717]/85">{data.summary}</p>
            </div>

            {data.mindmap?.nodes?.length > 0 && (
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#4D4D4D]">
                  <GitBranch className="h-4 w-4" />
                  Conversation diagram
                </p>
                <div className="overflow-x-auto rounded-xl border border-[#EBEBEB] bg-[#FAFAFA] p-6">
                  <div className="flex min-w-max flex-col items-center gap-4">
                    {data.mindmap.nodes.slice(0, 8).map((node, i) => (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex flex-col items-center"
                      >
                        {i > 0 && <div className="mb-2 h-6 w-px bg-[#D4D4D4]" />}
                        <span
                          className={cn(
                            "rounded-lg px-4 py-2 text-sm font-medium shadow-[0_0_0_1px_rgba(0,0,0,0.06)]",
                            node.type === "topic" && "bg-[#E8F2FF] text-[#0062D1]",
                            node.type === "question" && "bg-[#FFF4E5] text-[#B45309]",
                            node.type === "answer" && "bg-[#ECFDF3] text-[#398E4A]",
                            node.type === "guidance" && "bg-[#F3E8FF] text-[#7820BC]",
                            node.type === "change" && "bg-[#FEE2E2] text-[#E5484D]",
                            !["topic", "question", "answer", "guidance", "change"].includes(node.type) &&
                              "bg-white text-[#4D4D4D]"
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
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#4D4D4D]">
                  <Lightbulb className="h-4 w-4" />
                  What to do next
                </p>
                <ul className="space-y-2">
                  {data.action_items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-[#EBEBEB] bg-[#FAFAFA] px-4 py-3 text-sm"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0072F5]/10 text-xs font-semibold text-[#0072F5]">
                        {i + 1}
                      </span>
                      <span className="text-[#171717]/85">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.research?.length > 0 && (
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#4D4D4D]">
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
                      className="group rounded-xl border border-[#EBEBEB] bg-white p-4 transition-colors hover:border-[#0072F5]/30"
                    >
                      <p className="flex items-center gap-1.5 font-medium text-[#171717]">
                        {item.title}
                        {item.url && <ExternalLink className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />}
                      </p>
                      {item.snippet && (
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#8F8F8F]">{item.snippet}</p>
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
