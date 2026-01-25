import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

interface ConversationMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  screenContext?: string
}

export async function POST(request: Request) {
  try {
    const { conversation, format, includeScreenContext } = await request.json()

    if (!conversation || !Array.isArray(conversation)) {
      return Response.json(
        { error: "No conversation provided" },
        { status: 400 }
      )
    }

    // Format conversation for AI processing
    const conversationText = conversation
      .map((msg: ConversationMessage) => {
        let text = `[${msg.role.toUpperCase()}]: ${msg.content}`
        if (includeScreenContext && msg.screenContext) {
          text += `\n[Screen Context]: ${msg.screenContext}`
        }
        return text
      })
      .join("\n\n")

    let prompt = ""
    let outputFormat = ""

    switch (format) {
      case "timeline":
        prompt = `Based on this conversation, create a detailed timeline of events, decisions, and key milestones discussed. Include dates/times if mentioned, and organize chronologically.`
        outputFormat = "markdown"
        break
      case "milestones":
        prompt = `Extract all milestones, goals, and actionable items from this conversation. Organize them by priority and include any deadlines mentioned. Format as a clear list with checkboxes.`
        outputFormat = "markdown"
        break
      case "meeting-notes":
        prompt = `Create professional meeting notes from this conversation. Include: Summary, Key Discussion Points, Action Items, Decisions Made, and Next Steps.`
        outputFormat = "markdown"
        break
      case "notion":
        prompt = `Format this conversation as a Notion-compatible document with proper headers, toggles, callouts, and structured content. Use Notion markdown syntax.`
        outputFormat = "notion-markdown"
        break
      case "google-doc":
        prompt = `Create a professional document from this conversation suitable for Google Docs. Include proper headings, bullet points, and structured sections.`
        outputFormat = "markdown"
        break
      case "spreadsheet":
        prompt = `Extract structured data from this conversation into a CSV format. Include columns for: Item, Category, Status, Priority, Due Date, Notes. Only include rows where relevant data exists.`
        outputFormat = "csv"
        break
      case "json":
        prompt = `Extract all structured data from this conversation into a JSON format including: topics, action_items, decisions, participants, key_points, timeline, and metadata.`
        outputFormat = "json"
        break
      default:
        prompt = `Create a comprehensive summary of this conversation.`
        outputFormat = "markdown"
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting and formatting information from conversations. 
Output format: ${outputFormat}
Be thorough but concise. Include all relevant details from the conversation.`,
        },
        {
          role: "user",
          content: `${prompt}

CONVERSATION:
${conversationText}`,
        },
      ],
    })

    return Response.json({
      content: text,
      format: outputFormat,
      exportType: format,
    })
  } catch (error: any) {
    console.error("[v0] Export error:", error)
    return Response.json(
      { error: error.message || "Failed to generate export" },
      { status: 500 }
    )
  }
}
