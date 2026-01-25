import { NextResponse } from "next/server"

export async function GET() {
  const publicKey = process.env.VAPI_PUBLIC_KEY
  const assistantId = process.env.VAPI_ASSISTANT_ID

  if (!publicKey) {
    return NextResponse.json(
      { error: "VAPI_PUBLIC_KEY is not configured" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    publicKey,
    assistantId: assistantId || null,
  })
}
