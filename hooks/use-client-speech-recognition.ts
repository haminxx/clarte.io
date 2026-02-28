"use client"

import { useEffect, useRef, useCallback } from "react"

declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition
    webkitSpeechRecognition?: typeof SpeechRecognition
  }
}

export function isClientSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function useClientSpeechRecognition({
  enabled,
  language,
  onTranscriptPartial,
  onTranscriptAdd,
}: {
  enabled: boolean
  language: "en" | "ko"
  onTranscriptPartial: (role: string, content: string) => void
  onTranscriptAdd: (role: string, content: string) => void
}) {
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const callbacksRef = useRef({ onTranscriptPartial, onTranscriptAdd })
  callbacksRef.current = { onTranscriptPartial, onTranscriptAdd }

  const start = useCallback(() => {
    if (typeof window === "undefined") return
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language === "ko" ? "ko-KR" : "en-US"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const { onTranscriptPartial, onTranscriptAdd } = callbacksRef.current
      let interim = ""
      let final = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0]?.transcript?.trim() ?? ""
        if (result.isFinal) {
          final = transcript
        } else {
          interim = transcript
        }
      }

      if (final) {
        onTranscriptAdd("user", final)
      }
      if (interim) {
        onTranscriptPartial("user", interim)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech" || event.error === "aborted") return
      console.warn("[ClientSpeechRecognition] Error:", event.error)
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
    } catch (e) {
      console.warn("[ClientSpeechRecognition] Start failed:", e)
    }
  }, [language])

  const stop = useCallback(() => {
    const rec = recognitionRef.current
    if (rec) {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      start()
    }
    return () => {
      stop()
    }
  }, [enabled, start, stop])

  return { start, stop }
}
