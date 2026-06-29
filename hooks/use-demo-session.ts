"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export const DEMO_LIMIT_MS = 5 * 60 * 1000
export const DEMO_LIMIT_SECONDS = DEMO_LIMIT_MS / 1000

export type DemoSessionPhase = "idle" | "active" | "ending" | "concluded"

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

const VOICE_AGENT_URL = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ""

export function useDemoSession() {
  const [phase, setPhase] = useState<DemoSessionPhase>("idle")
  const [remainingSeconds, setRemainingSeconds] = useState(DEMO_LIMIT_SECONDS)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [partialCaption, setPartialCaption] = useState("")
  const [conclusion, setConclusion] = useState<DemoConclusionData | null>(null)
  const [conclusionLoading, setConclusionLoading] = useState(false)
  const [endReason, setEndReason] = useState<"timer" | "natural" | "manual" | null>(null)

  const startedAtRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const disconnectRef = useRef<(() => void) | null>(null)
  const transcriptRef = useRef<TranscriptEntry[]>([])

  useEffect(() => {
    transcriptRef.current = transcript
  }, [transcript])

  const registerDisconnect = useCallback((fn: () => void) => {
    disconnectRef.current = fn
  }, [])

  const addTranscript = useCallback((role: string, content: string) => {
    setTranscript((prev) => [...prev, { role, content }])
    setPartialCaption("")
  }, [])

  const addPartial = useCallback((role: string, content: string) => {
    if (role === "user") setPartialCaption(content)
  }, [])

  const fetchConclusion = useCallback(async (entries: TranscriptEntry[]) => {
    setConclusionLoading(true)
    const baseUrl = VOICE_AGENT_URL.replace(/\/$/, "")
    const url = baseUrl ? `${baseUrl}/demo/conclude` : null

    if (!url) {
      setConclusion({
        summary: "Thanks for trying Clarte. Start a new demo anytime.",
        mindmap: { nodes: [], edges: [] },
        action_items: [],
        research: [],
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
      setConclusion(data)
    } catch (e) {
      console.warn("[Clarte Demo] Conclude failed:", e)
      setConclusion({
        summary: "Your demo session has ended. We couldn't generate a full summary — try again with a longer conversation.",
        mindmap: { nodes: [], edges: [] },
        action_items: [],
        research: [],
      })
    } finally {
      setConclusionLoading(false)
    }
  }, [])

  const endSession = useCallback(
    async (reason: "timer" | "natural" | "manual") => {
      if (phase === "ending" || phase === "concluded") return
      setEndReason(reason)
      setPhase("ending")

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      disconnectRef.current?.()
      disconnectRef.current = null

      const entries = [...transcriptRef.current]
      await fetchConclusion(entries)

      setTranscript([])
      setPartialCaption("")
      setRemainingSeconds(DEMO_LIMIT_SECONDS)
      startedAtRef.current = null
      setPhase("concluded")
    },
    [phase, fetchConclusion]
  )

  const startSession = useCallback(() => {
    if (phase !== "idle" && phase !== "concluded") return
    setConclusion(null)
    setEndReason(null)
    setTranscript([])
    setPartialCaption("")
    setRemainingSeconds(DEMO_LIMIT_SECONDS)
    startedAtRef.current = Date.now()
    setPhase("active")
  }, [phase])

  const resetDemo = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    disconnectRef.current = null
    startedAtRef.current = null
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
      if (left <= 0) {
        void endSession("timer")
      }
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
