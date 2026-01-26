import { NextResponse } from "next/server"

export async function GET() {
  try {
    const publicKey = process.env.VAPI_PUBLIC_KEY
    const assistantId = process.env.VAPI_ASSISTANT_ID

    // If no key configured, return demoMode flag for client to handle gracefully
    if (!publicKey || publicKey.trim() === "") {
      return NextResponse.json({
        demoMode: true,
        publicKey: null,
        assistantId: null,
        message: "VAPI not configured - running in demo mode",
      })
    }

    return NextResponse.json({
      demoMode: false,
      publicKey,
      assistantId: assistantId || null,
    })
  } catch (error) {
    console.error("[v0] Error in VAPI token route:", error)
    return NextResponse.json({
      demoMode: true,
      publicKey: null,
      assistantId: null,
      message: "Error retrieving VAPI configuration - running in demo mode",
    })
  }
}
