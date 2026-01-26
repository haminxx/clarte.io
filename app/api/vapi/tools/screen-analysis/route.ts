import { NextResponse } from "next/server"

/**
 * VAPI Server-Side Tool Endpoint for Screen Analysis
 * This endpoint is called by VAPI when the assistant needs to analyze the user's screen
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // VAPI function call structure
    const { functionCall, call } = body
    
    if (!functionCall || functionCall.name !== "analyzeScreen") {
      return NextResponse.json(
        { error: "Invalid function call" },
        { status: 400 }
      )
    }

    // Get the screen frame from the request
    // Note: The screen frame should be sent by the client when VAPI requests it
    // For now, we'll return a message indicating the tool is available
    // The actual screen capture happens client-side
    
    return NextResponse.json({
      result: "Screen analysis tool is available. The client will send screen frames for analysis.",
      toolCallId: functionCall.id,
    })
  } catch (error: any) {
    console.error("[v0] VAPI screen analysis tool error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process screen analysis request" },
      { status: 500 }
    )
  }
}
