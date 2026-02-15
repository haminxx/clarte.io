import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

/**
 * Phase 2: Fail fast if LiveKit URL is not configured (server env not used here,
 * but we validate token-generation env so the frontend gets a clear 500 message).
 */
const apiKey = process.env.LIVEKIT_API_KEY
const apiSecret = process.env.LIVEKIT_API_SECRET

export async function POST() {
  console.log("[Token API] Token request received...")

  try {
    if (apiKey === undefined || apiKey === "") {
      console.error("[Token API] Missing LIVEKIT_API_KEY")
      return NextResponse.json(
        { error: "Missing LIVEKIT_API_KEY" },
        { status: 500 }
      )
    }
    if (apiSecret === undefined || apiSecret === "") {
      console.error("[Token API] Missing LIVEKIT_API_SECRET")
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

    const token = await at.toJwt()

    console.log("[Token API] Token generated successfully")
    return NextResponse.json({ token, room: roomName })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error("[Token API] Token generation failed:", message)
    return NextResponse.json(
      { error: message || "Token generation failed" },
      { status: 500 }
    )
  }
}
