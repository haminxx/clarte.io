"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ExternalLink, Info, Lightbulb, Link2, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StrategyPlanLink {
  url: string
  title?: string
}

export interface StrategyPlanItem {
  id?: string
  summary?: string
  links?: StrategyPlanLink[]
  action_items?: string[]
  created_at?: { toDate?: () => Date }
}

export interface MindmapNode {
  id: string
  label: string
  type: string
}
export interface MindmapEdge {
  from: string
  to: string
}

interface StrategyPlanCardProps {
  /** Strategy plan from the selected conversation (or latest) */
  plan?: StrategyPlanItem | null
  /** Conversation title for context */
  conversationTitle?: string
  /** AI-generated summary from save (overrides plan.summary when present) */
  summary?: string | null
  /** Mindmap of topics, answers, guidance from save */
  mindmap?: { nodes: MindmapNode[]; edges: MindmapEdge[] } | null
  /** Whether data is loading */
  loading?: boolean
}

export function StrategyPlanCard({
  plan,
  conversationTitle,
  summary: convSummary,
  mindmap,
  loading = false,
}: StrategyPlanCardProps) {
  const summary = convSummary ?? plan?.summary
  const hasPlan =
    !!(
      summary ||
      (plan?.links?.length ?? 0) > 0 ||
      (plan?.action_items?.length ?? 0) > 0 ||
      (mindmap?.nodes?.length ?? 0) > 0
    )

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-white/10" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Strategy Plan</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-full p-1 text-white/40 hover:text-white/70"
                  aria-label="Strategy plan info"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>Context, action items, and sources discovered during or after your conversation with Clarte.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 bg-transparent text-white hover:bg-white/10"
          asChild
        >
          <Link href="/dashboard">View Strategy Plan</Link>
        </Button>
      </div>

      {hasPlan ? (
        <div className="space-y-4">
          {summary && (
            <div>
              <p className="text-sm font-medium text-white/60">Summary</p>
              <p className="mt-1 text-sm text-white/90">{summary}</p>
            </div>
          )}
          {plan.links && plan.links.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-white/60">
                <Link2 className="h-4 w-4" />
                Sources & Links
              </p>
              <ul className="space-y-2">
                {plan.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {link.title || link.url}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {plan?.action_items && plan.action_items.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-white/60">
                <Lightbulb className="h-4 w-4" />
                Action Items
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-white/80">
                {plan.action_items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {mindmap && mindmap.nodes && mindmap.nodes.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-white/60">
                <GitBranch className="h-4 w-4" />
                Mindmap
              </p>
              <div className="flex flex-wrap gap-2">
                {mindmap.nodes.map((node) => (
                  <span
                    key={node.id}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      node.type === "topic" && "bg-blue-500/20 text-blue-300",
                      node.type === "question" && "bg-amber-500/20 text-amber-300",
                      node.type === "answer" && "bg-emerald-500/20 text-emerald-300",
                      node.type === "guidance" && "bg-purple-500/20 text-purple-300",
                      node.type === "change" && "bg-rose-500/20 text-rose-300",
                      !["topic", "question", "answer", "guidance", "change"].includes(node.type) &&
                        "bg-white/10 text-white/80"
                    )}
                  >
                    {node.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          {conversationTitle && (
            <p className="text-xs text-white/40">From: {conversationTitle}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Lightbulb className="mb-4 h-12 w-12 text-white/20" />
          <p className="text-white/40">No strategy plan yet</p>
          <p className="mt-1 text-sm text-white/30">
            Start a conversation with Clarte to get sources, links, and action items.
          </p>
        </div>
      )}
    </div>
  )
}
