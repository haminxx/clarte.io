"use client"

/**
 * SDH (Subtitles for the Deaf and Hard of Hearing) transcript component.
 * Netflix-style: [Speaker] [emotion] content. Supports markdown links for citations.
 * Live interim lines use muted foreground (Web Speech–style).
 */
import React from "react"
import { cn } from "@/lib/utils"

export interface SDHTranscriptEntry {
  role: string
  content: string
  emotion?: string
}

interface SDHTranscriptProps {
  entries: SDHTranscriptEntry[]
  /** Legacy single partial row */
  partial?: SDHTranscriptEntry | null
  /** Live user speech (interim) — shown as gray after [You] */
  userInterim?: string | null
  /** Live assistant speech (interim) — shown as gray after [Clarte] */
  assistantInterim?: { content: string; emotion?: string } | null
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
}: {
  entry: SDHTranscriptEntry
  isPartial?: boolean
}) {
  const speaker = entry.role === "user" ? "[You]" : "[Clarte]"
  const emotion = entry.emotion ? ` [${entry.emotion.toLowerCase()}]` : ""
  const isUser = entry.role === "user"

  return (
    <div
      className={cn(
        "leading-snug",
        isUser ? "text-foreground" : "text-blue-600 dark:text-blue-400"
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

function InterimLine({
  role,
  content,
  emotion,
}: {
  role: "user" | "assistant"
  content: string
  emotion?: string
}) {
  const speaker = role === "user" ? "[You]" : "[Clarte]"
  const emotionPart =
    role === "assistant" && emotion ? (
      <span className="font-medium text-muted-foreground">{` [${emotion.toLowerCase()}] `}</span>
    ) : (
      " "
    )

  return (
    <div className="leading-snug">
      <span className="font-medium text-muted-foreground">{speaker}</span>
      {emotionPart}
      <span className="text-muted-foreground/85">{parseTranscriptContent(content)}</span>
    </div>
  )
}

export function SDHTranscript({
  entries,
  partial,
  userInterim,
  assistantInterim,
  emptyMessage = "Your speech and Clarte's replies will appear here...",
  className,
}: SDHTranscriptProps) {
  const hasInterim = Boolean(
    (userInterim && userInterim.trim()) || (assistantInterim && assistantInterim.content.trim())
  )
  const hasContent = entries.length > 0 || partial || hasInterim

  return (
    <div className={cn("flex flex-col gap-1.5 justify-end scroll-smooth", className)}>
      {!hasContent ? (
        <span className="text-muted-foreground">{emptyMessage}</span>
      ) : (
        <div className="space-y-1.5 scroll-smooth">
          {entries.map((entry, i) => (
            <SDHEntry key={i} entry={entry} />
          ))}
          {partial ? <SDHEntry entry={partial} isPartial /> : null}
          {userInterim?.trim() ? (
            <InterimLine role="user" content={userInterim.trim()} />
          ) : null}
          {assistantInterim?.content?.trim() ? (
            <InterimLine
              role="assistant"
              content={assistantInterim.content.trim()}
              emotion={assistantInterim.emotion}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}
