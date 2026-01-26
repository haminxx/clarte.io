import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { image, conversationContext, userMessage } = await request.json()

    if (!image) {
      return Response.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that can see the user's screen. Analyze what you see and provide helpful, contextual responses.
          
Your role is to:
- Understand what the user is working on based on their screen
- Provide relevant suggestions, explanations, or assistance
- Reference specific elements you can see on screen when helpful
- Be concise but thorough in your analysis

Current conversation context: ${conversationContext || "No prior context"}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userMessage || "What do you see on my screen? Please analyze and describe the content, and let me know if you can help with anything.",
            },
            {
              type: "image",
              image: image,
            },
          ],
        },
      ],
    })

    return Response.json({ analysis: text })
  } catch (error: any) {
    console.error("[v0] Vision analysis error:", error)
    return Response.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    )
  }
}
