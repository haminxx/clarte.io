"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ExternalLink, Info, Lightbulb, Link2 } from "lucide-react"

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

interface StrategyPlanCardProps {
  /** Strategy plan from the selected conversation (or latest) */
  plan?: StrategyPlanItem | null
  /** Conversation title for context */
  conversationTitle?: string
  /** Whether data is loading */
  loading?: boolean
}

export function StrategyPlanCard({
  plan,
  conversationTitle,
  loading = false,
}: StrategyPlanCardProps) {
  const hasPlan = plan && (plan.summary || (plan.links?.length ?? 0) > 0 || (plan.action_items?.length ?? 0) > 0)

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
          {plan.summary && (
            <div>
              <p className="text-sm font-medium text-white/60">Summary</p>
              <p className="mt-1 text-sm text-white/90">{plan.summary}</p>
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
          {plan.action_items && plan.action_items.length > 0 && (
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
