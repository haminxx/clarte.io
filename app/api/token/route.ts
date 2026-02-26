import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol"

/**
 * Phase 2: Fail fast if LiveKit URL is not configured (server env not used here,
 * but we validate token-generation env so the frontend gets a clear 500 message).
 * Includes RoomAgentDispatch so LiveKit dispatches the "clarte" agent when the user joins.
 */
const apiKey = process.env.LIVEKIT_API_KEY
const apiSecret = process.env.LIVEKIT_API_SECRET

const VALID_VOICES = new Set(["alloy", "ash", "ballad", "coral", "echo", "marin", "sage", "shimmer", "verse", "cedar"])
const VALID_MODES = new Set(["casual", "expert", "research"])
const VALID_LANGUAGES = new Set(["en", "ko"])

export async function POST(request: Request) {
  let voice = "marin"
  let mode = "expert"
  let language = "en"
  try {
    const body = await request.json().catch(() => ({}))
    if (body && typeof body.voice === "string" && VALID_VOICES.has(body.voice)) voice = body.voice
    if (body && typeof body.mode === "string" && VALID_MODES.has(body.mode)) mode = body.mode
    if (body && typeof body.language === "string" && VALID_LANGUAGES.has(body.language)) language = body.language
  } catch {
    // ignore
  }

  try {
    if (apiKey === undefined || apiKey === "") {
      return NextResponse.json(
        { error: "Missing LIVEKIT_API_KEY" },
        { status: 500 }
      )
    }
    if (apiSecret === undefined || apiSecret === "") {
      return NextResponse.json(
        { error: "Missing LIVEKIT_API_SECRET" },
        { status: 500 }
      )
    }

    const identity = `user-${Math.random().toString(36).slice(2, 10)}`
    const roomName = `clarte-${Math.random().toString(36).slice(2, 14)}`

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: identity,
    })
    at.addGrant({ roomJoin: true, room: roomName })
    at.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: "clarte",
          metadata: JSON.stringify({ voice, mode, language }),
        }),
      ],
    })

    const token = await at.toJwt()
    return NextResponse.json({ token, room: roomName })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json(
      { error: message || "Token generation failed" },
      { status: 500 }
    )
  }
}
