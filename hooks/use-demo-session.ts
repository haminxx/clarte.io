"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getVoiceAgentBaseUrl } from "@/lib/voice-config"

export const DEMO_LIMIT_MS = 5 * 60 * 1000
export const DEMO_LIMIT_SECONDS = DEMO_LIMIT_MS / 1000

export type DemoSessionPhase = "idle" | "active" | "ending" | "concluded"
export type DemoEndReason = "timer" | "natural" | "manual"

export interface TranscriptEntry {
  role: string
  content: string
}

export interface DemoConclusionData {
  summary: string
  mindmap: { nodes: { id: string; label: string; type: string }[]; edges: { from: string; to: string }[] }
  action_items: string[]
  research: { title: string; url: string; snippet: string }[]
}

const EMPTY_CONCLUSION: DemoConclusionData = {
  summary: "",
  mindmap: { nodes: [], edges: [] },
  action_items: [],
  research: [],
}

function getConcludeUrl(): string | null {
  const base = getVoiceAgentBaseUrl()
  return base ? `${base}/demo/conclude` : null
}

export function useDemoSession() {
  const [phase, setPhase] = useState<DemoSessionPhase>("idle")
  const [remainingSeconds, setRemainingSeconds] = useState(DEMO_LIMIT_SECONDS)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [partialCaption, setPartialCaption] = useState("")
  const [conclusion, setConclusion] = useState<DemoConclusionData | null>(null)
  const [conclusionLoading, setConclusionLoading] = useState(false)
  const [endReason, setEndReason] = useState<DemoEndReason | null>(null)

  const phaseRef = useRef<DemoSessionPhase>("idle")
  const startedAtRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const disconnectRef = useRef<(() => void) | null>(null)
  const transcriptRef = useRef<TranscriptEntry[]>([])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    transcriptRef.current = transcript
  }, [transcript])

  const registerDisconnect = useCallback((fn: () => void) => {
    disconnectRef.current = fn
  }, [])

  const addTranscript = useCallback((role: string, content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return
    setTranscript((prev) => [...prev, { role, content: trimmed }])
    setPartialCaption("")
  }, [])

  const addPartial = useCallback((role: string, content: string) => {
    if (role === "user") setPartialCaption(content)
  }, [])

  const fetchConclusion = useCallback(async (entries: TranscriptEntry[]) => {
    setConclusionLoading(true)
    const url = getConcludeUrl()

    if (!url) {
      setConclusion({
        ...EMPTY_CONCLUSION,
        summary: "Thanks for trying Clarte. Configure NEXT_PUBLIC_VOICE_AGENT_URL to enable full session summaries.",
      })
      setConclusionLoading(false)
      return
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: entries, session_type: "demo" }),
      })
      if (!res.ok) throw new Error(`Conclude failed: ${res.status}`)
      const data = (await res.json()) as DemoConclusionData
      setConclusion({
        summary: data.summary ?? "",
        mindmap: data.mindmap ?? { nodes: [], edges: [] },
        action_items: data.action_items ?? [],
        research: data.research ?? [],
      })
    } catch (e) {
      console.warn("[Clarte Demo] Conclude failed:", e)
      setConclusion({
        ...EMPTY_CONCLUSION,
        summary:
          entries.length > 0
            ? "Your demo session has ended. We couldn't generate a full summary right now — try again in a moment."
            : "Your demo ended before any conversation was captured. Start a new session and say hello to Clarte.",
      })
    } finally {
      setConclusionLoading(false)
    }
  }, [])

  const endSession = useCallback(
    async (reason: DemoEndReason) => {
      if (phaseRef.current === "ending" || phaseRef.current === "concluded") return

      phaseRef.current = "ending"
      setEndReason(reason)
      setPhase("ending")

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      disconnectRef.current?.()
      disconnectRef.current = null

      await fetchConclusion([...transcriptRef.current])

      setTranscript([])
      setPartialCaption("")
      setRemainingSeconds(DEMO_LIMIT_SECONDS)
      startedAtRef.current = null
      phaseRef.current = "concluded"
      setPhase("concluded")
    },
    [fetchConclusion]
  )

  const startSession = useCallback(() => {
    if (phaseRef.current !== "idle" && phaseRef.current !== "concluded") return

    setConclusion(null)
    setEndReason(null)
    setTranscript([])
    setPartialCaption("")
    setRemainingSeconds(DEMO_LIMIT_SECONDS)
    startedAtRef.current = Date.now()
    phaseRef.current = "active"
    setPhase("active")
  }, [])

  const resetDemo = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    disconnectRef.current = null
    startedAtRef.current = null
    phaseRef.current = "idle"
    setPhase("idle")
    setTranscript([])
    setPartialCaption("")
    setConclusion(null)
    setConclusionLoading(false)
    setEndReason(null)
    setRemainingSeconds(DEMO_LIMIT_SECONDS)
  }, [])

  useEffect(() => {
    if (phase !== "active") return

    timerRef.current = setInterval(() => {
      if (!startedAtRef.current) return
      const elapsed = Date.now() - startedAtRef.current
      const left = Math.max(0, Math.ceil((DEMO_LIMIT_MS - elapsed) / 1000))
      setRemainingSeconds(left)
      if (left <= 0) void endSession("timer")
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, endSession])

  return {
    phase,
    remainingSeconds,
    transcript,
    partialCaption,
    conclusion,
    conclusionLoading,
    endReason,
    startSession,
    endSession,
    resetDemo,
    addTranscript,
    addPartial,
    registerDisconnect,
  }
}
