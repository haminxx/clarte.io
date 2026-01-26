import { NextResponse } from "next/server"

export async function GET() {
  const publicKey = process.env.VAPI_PUBLIC_KEY
  const assistantId = process.env.VAPI_ASSISTANT_ID

  // If no key configured, return demoMode flag for client to handle gracefully
  if (!publicKey) {
    return NextResponse.json({
      demoMode: true,
      publicKey: null,
      assistantId: null,
    })
  }

  return NextResponse.json({
    demoMode: false,
    publicKey,
    assistantId: assistantId || null,
  })
}
