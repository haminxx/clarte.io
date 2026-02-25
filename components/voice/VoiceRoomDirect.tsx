"use client"

/**
 * Tier 1: Voice-only connection via WebSocket relay to OpenAI Realtime API.
 * No LiveKit. Connects to VOICE_AGENT_URL/realtime.
 */
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Loader2 } from "lucide-react"

const VOICE_AGENT_URL = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ""
const RELAY_WS_URL = VOICE_AGENT_URL
  ? (VOICE_AGENT_URL.startsWith("https") ? "wss:" : "ws:") + VOICE_AGENT_URL.replace(/^https?:/, "") + "/realtime"
  : ""

const SAMPLE_RATE = 24000

/** Convert Float32 to Int16 PCM */
function floatTo16BitPCM(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16
}

/** Resample from context sample rate to 24kHz (simple decimation) */
function resampleTo24k(input: Float32Array, fromRate: number): Int16Array {
  const ratio = fromRate / SAMPLE_RATE
  const outLen = Math.floor(input.length / ratio)
  const output = new Float32Array(outLen)
  for (let i = 0; i < outLen; i++) {
    const srcIdx = i * ratio
    const idx0 = Math.floor(srcIdx)
    const idx1 = Math.min(idx0 + 1, input.length - 1)
    const frac = srcIdx - idx0
    output[i] = input[idx0] * (1 - frac) + input[idx1] * frac
  }
  return floatTo16BitPCM(output)
}

/** Base64 encode Int16Array */
function toBase64(int16: Int16Array): string {
  const bytes = new Uint8Array(int16.buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

interface VoiceRoomDirectProps {
  onDisconnect?: () => void
  autoStart?: boolean
}

export function VoiceRoomDirect({ onDisconnect, autoStart = false }: VoiceRoomDirectProps) {
  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const outputQueueRef = useRef<Int16Array[]>([])
  const outputContextRef = useRef<AudioContext | null>(null)

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (processorRef.current) {
      try {
        processorRef.current.disconnect()
      } catch {
        /* ignore */
      }
      processorRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    setStatus("idle")
    setError(null)
    onDisconnect?.()
  }, [onDisconnect])

  const startCall = useCallback(async () => {
    if (!RELAY_WS_URL) {
      setError("Set NEXT_PUBLIC_VOICE_AGENT_URL (e.g. http://localhost:8080 or your Render URL)")
      setStatus("error")
      return
    }
    setStatus("connecting")
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
    } catch (e) {
      setError("Microphone access is required. Please allow and try again.")
      setStatus("error")
      return
    }

    const ws = new WebSocket(RELAY_WS_URL)
    wsRef.current = ws

    ws.onopen = async () => {
      setStatus("active")
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      audioContextRef.current = ctx
      const source = ctx.createMediaStreamSource(streamRef.current!)
      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor
      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return
        const input = e.inputBuffer.getChannelData(0)
        const pcm = resampleTo24k(input, ctx.sampleRate)
        const b64 = toBase64(pcm)
        ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: b64 }))
      }
      source.connect(processor)
      const gain = ctx.createGain()
      gain.gain.value = 0
      processor.connect(gain)
      gain.connect(ctx.destination)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "error") {
          setError(data.error?.message ?? "Unknown error")
          setStatus("error")
          return
        }
        if (data.type === "response.audio.delta" && data.delta) {
          const bytes = Uint8Array.from(atob(data.delta), (c) => c.charCodeAt(0))
          const int16 = new Int16Array(bytes.buffer)
          outputQueueRef.current.push(int16)
          playNextInQueue()
        } else if (data.type === "conversation.item.added" && data.item?.content) {
          const content = Array.isArray(data.item.content) ? data.item.content : [data.item.content]
          for (const part of content) {
            if (part.type === "output_audio" && part.audio) {
              const bytes = Uint8Array.from(atob(part.audio), (c) => c.charCodeAt(0))
              const int16 = new Int16Array(bytes.buffer)
              outputQueueRef.current.push(int16)
              playNextInQueue()
            }
          }
        }
      } catch {
        /* ignore parse errors */
      }
    }

    ws.onerror = () => {
      setError("WebSocket error")
      setStatus("error")
    }

    ws.onclose = () => {
      if (status !== "error") setStatus("idle")
    }
  }, [])

  const playNextInQueue = useCallback(() => {
    const queue = outputQueueRef.current
    if (queue.length === 0) return
    const ctx = outputContextRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (!outputContextRef.current) outputContextRef.current = ctx
    const int16 = queue.shift()!
    const float32 = new Float32Array(int16.length)
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff)
    }
    const buffer = ctx.createBuffer(1, float32.length, SAMPLE_RATE)
    buffer.getChannelData(0).set(float32)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.onended = () => playNextInQueue()
    source.start()
  }, [])

  useEffect(() => {
    if (autoStart && status === "idle" && RELAY_WS_URL) {
      startCall()
    }
  }, [autoStart, status, startCall])

  if (status === "active") {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <p className="text-sm text-muted-foreground">In call with Assistant (Tier 1 — voice only)</p>
        <Button variant="outline" size="sm" onClick={disconnect} className="gap-2">
          <PhoneOff className="h-4 w-4" />
          End call
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-foreground/80 text-sm sm:text-base">Voice-only mode — no LiveKit required.</p>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <span className="text-sm text-muted-foreground">
            {status === "connecting" ? "Connecting…" : "Ready"}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 py-6">
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <div className="flex items-center gap-2">
          {autoStart && onDisconnect && (
            <Button variant="outline" size="sm" onClick={onDisconnect} className="gap-2">
              <PhoneOff className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            onClick={startCall}
            disabled={!RELAY_WS_URL || status === "connecting"}
            className="gap-2 h-12 px-6 rounded-full"
          >
            {status === "connecting" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Phone className="h-5 w-5" />
            )}
            {status === "connecting" ? "Connecting…" : "Start voice call"}
          </Button>
        </div>
        {!RELAY_WS_URL && (
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Set NEXT_PUBLIC_VOICE_AGENT_URL (e.g. http://localhost:8080 for local dev).
          </p>
        )}
      </div>
    </div>
  )
}
