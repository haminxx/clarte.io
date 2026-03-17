"use client"

/**
 * SDH (Subtitles for the Deaf and Hard of Hearing) transcript component.
 * Netflix-style: [Speaker] [emotion] content. Supports markdown links for citations.
 */
import React from "react"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

export interface SDHTranscriptEntry {
  role: string
  content: string
  emotion?: string
}

interface SDHTranscriptProps {
  entries: SDHTranscriptEntry[]
  partial?: SDHTranscriptEntry | null
  emptyMessage?: string
  className?: string
}

/** Parse markdown links [text](url) and return React nodes. */
function parseTranscriptContent(content: string): React.ReactNode {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = linkRe.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 underline hover:underline"
      >
        {match[1]}
      </a>
    )
    lastIndex = linkRe.lastIndex
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }
  return parts.length > 0 ? parts : content
}

function SDHEntry({
  entry,
  isPartial,
  isBright,
}: {
  entry: SDHTranscriptEntry
  isPartial?: boolean
  isBright?: boolean
}) {
  const speaker = entry.role === "user" ? "[You]" : "[Clarte]"
  const emotion = entry.emotion ? ` [${entry.emotion.toLowerCase()}]` : ""
  const isUser = entry.role === "user"

  return (
    <div
      className={cn(
        "leading-tight",
        isUser ? "text-foreground/90" : "text-blue-600 dark:text-blue-400"
      )}
    >
      <span className="font-medium text-muted-foreground">
        {speaker}
        {emotion}
        {emotion ? " " : ""}
      </span>
      {parseTranscriptContent(entry.content)}
      {isPartial && <span className="animate-pulse">|</span>}
    </div>
  )
}

export function SDHTranscript({
  entries,
  partial,
  emptyMessage = "Your speech and Clarte's replies will appear here...",
  className,
}: SDHTranscriptProps) {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  const hasContent = entries.length > 0 || partial

  return (
    <div className={cn("flex flex-col gap-1.5 justify-end scroll-smooth", className)}>
      {!hasContent ? (
        <span className="text-muted-foreground">{emptyMessage}</span>
      ) : (
        <div className="space-y-1.5 scroll-smooth">
          {entries.map((entry, i) => (
            <SDHEntry key={i} entry={entry} isBright={isBright} />
          ))}
          {partial ? (
            <SDHEntry entry={partial} isPartial isBright={isBright} />
          ) : null}
        </div>
      )}
    </div>
  )
}
