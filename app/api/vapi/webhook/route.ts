import { NextResponse } from "next/server"

/**
 * VAPI Webhook Endpoint
 * Handles real-time conversation data and function calls from VAPI
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // VAPI sends different event types
    const { type, message, functionCall, call } = body
    
    // Handle function calls for screen analysis
    if (type === "function-call" && functionCall?.name === "analyzeScreen") {
      // Return response indicating the tool is available
      // The actual screen analysis happens client-side and is sent via messages
      return NextResponse.json({
        result: "Screen analysis will be provided by the client in real-time.",
        toolCallId: functionCall.id,
      })
    }
    
    // Handle other VAPI events
    if (type === "status-update") {
      // Handle status updates
      return NextResponse.json({ received: true })
    }
    
    if (type === "conversation-update") {
      // Handle conversation updates
      return NextResponse.json({ received: true })
    }
    
    // Default response
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[v0] VAPI webhook error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process webhook" },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET(request: Request) {
  return NextResponse.json({ status: "VAPI webhook endpoint is active" })
}
