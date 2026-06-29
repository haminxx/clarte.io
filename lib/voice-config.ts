/** Production voice-agent URL (Render blueprint: clarte-voice-agent). */
export const PRODUCTION_VOICE_AGENT_URL = "https://clarte-voice-agent.onrender.com"

export const PRODUCTION_LIVEKIT_URL = "wss://clarte-nrk5tnrq.livekit.cloud"

function isPlaceholderUrl(url: string): boolean {
  return !url || url.includes("placeholder") || url.includes("your-app") || url.includes("your-service")
}

function isProductionHost(hostname: string): boolean {
  return (
    hostname === "clarte.io" ||
    hostname.endsWith(".clarte.io") ||
    hostname.endsWith(".web.app") ||
    hostname.endsWith(".firebaseapp.com")
  )
}

/** Resolve voice-agent base URL (no trailing slash). */
export function getVoiceAgentBaseUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? "").replace(/\/$/, "")
  if (!isPlaceholderUrl(fromEnv)) return fromEnv

  if (typeof window !== "undefined" && isProductionHost(window.location.hostname)) {
    return PRODUCTION_VOICE_AGENT_URL
  }

  return fromEnv
}

/** Resolve LiveKit WebSocket URL. */
export function getLiveKitUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "").trim()
  if (fromEnv && !fromEnv.includes("placeholder")) return fromEnv

  if (typeof window !== "undefined" && isProductionHost(window.location.hostname)) {
    return PRODUCTION_LIVEKIT_URL
  }

  return fromEnv
}

export function formatDemoVoiceError(message: string): string {
  const lower = message.toLowerCase()
  if (
    lower.includes("next_public_voice_agent") ||
    lower.includes("cannot reach voice") ||
    lower.includes("failed to fetch") ||
    lower.includes("network")
  ) {
    return "Couldn't connect to Clarte voice. The service may be waking up — wait a few seconds and try again."
  }
  if (lower.includes("livekit") && lower.includes("not configured")) {
    return "Voice isn't fully configured yet. Please try again in a moment."
  }
  return message
}
