"use client"

/**
 * SDH transcript: merged consecutive same-role lines (one [You]/[Clarte] label),
 * blue assistant streaming text, token pop-in for interim streams.
 */
import React, { useMemo, useRef } from "react"
import { cn } from "@/lib/utils"

export interface SDHTranscriptEntry {
  role: string
  content: string
  emotion?: string
}

interface SDHTranscriptProps {
  entries: SDHTranscriptEntry[]
  partial?: SDHTranscriptEntry | null
  userInterim?: string | null
  assistantInterim?: { content: string; emotion?: string } | null
  emptyMessage?: string
  className?: string
}

function mergeConsecutiveEntries(entries: SDHTranscriptEntry[]): SDHTranscriptEntry[] {
  const out: SDHTranscriptEntry[] = []
  for (const e of entries) {
    const last = out[out.length - 1]
    const sameAssistantEmotion =
      last?.role === "assistant" && e.role === "assistant" && last.emotion === e.emotion
    const sameUser = last?.role === "user" && e.role === "user"
    if (last && (sameAssistantEmotion || sameUser)) {
      out[out.length - 1] = {
        ...last,
        content: `${last.content} ${e.content}`.replace(/\s+/g, " ").trim(),
      }
    } else {
      out.push({ ...e })
    }
  }
  return out
}

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

/** Interim stream: animate only newly appended words vs previous render. */
function StreamingInterimWords({
  content,
  bodyClassName,
}: {
  content: string
  bodyClassName: string
}) {
  const prevRef = useRef("")
  const trimmed = content.trim()
  const words = trimmed ? trimmed.split(/\s+/) : []
  const prevTrimmed = prevRef.current.trim()
  const prevWords = prevTrimmed ? prevTrimmed.split(/\s+/) : []

  let firstNew = 0
  while (firstNew < words.length && firstNew < prevWords.length && words[firstNew] === prevWords[firstNew]) {
    firstNew++
  }
  prevRef.current = content

  if (words.length === 0) return null

  return (
    <span className={bodyClassName}>
      {words.map((w, i) => (
        <React.Fragment key={`${i}-${w}`}>
          {i > 0 ? " " : null}
          <span
            className={cn(
              "inline-block align-baseline",
              i >= firstNew && "animate-transcript-token-pop"
            )}
          >
            {parseTranscriptContent(w)}
          </span>
        </React.Fragment>
      ))}
    </span>
  )
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

  const bodyClass =
    role === "assistant"
      ? "text-blue-600 dark:text-blue-400"
      : "text-muted-foreground/90"

  return (
    <div className="leading-snug">
      <span className="font-medium text-muted-foreground">{speaker}</span>
      {emotionPart}
      <StreamingInterimWords content={content} bodyClassName={bodyClass} />
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
  const mergedEntries = useMemo(() => mergeConsecutiveEntries(entries), [entries])

  const hasInterim = Boolean(
    (userInterim && userInterim.trim()) || (assistantInterim && assistantInterim.content.trim())
  )
  const hasContent = mergedEntries.length > 0 || partial || hasInterim

  return (
    <div className={cn("flex flex-col gap-1.5 justify-end scroll-smooth", className)}>
      {!hasContent ? (
        <span className="text-muted-foreground">{emptyMessage}</span>
      ) : (
        <div className="space-y-1.5 scroll-smooth">
          {mergedEntries.map((entry, i) => (
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
