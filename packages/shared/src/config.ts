/**
 * Shared constants for Clarte web, desktop, and mobile.
 * Env vars (LIVEKIT_URL, VOICE_AGENT_URL) are set at build time in each app.
 */

export const VOICE_OPTIONS = [
  { name: "Marin", voiceId: "marin" },
  { name: "Cedar", voiceId: "cedar" },
] as const

export type VoiceId = (typeof VOICE_OPTIONS)[number]["voiceId"]
