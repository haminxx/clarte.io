/**
 * Phase-1 bridge: map assistant spoken/text lines to ASL viewer intents.
 * Replace with tool calls or structured output when the Vapi assistant supports it.
 */
export function mapAssistantTextToIntent(text: string): string | null {
  const t = text.toLowerCase()
  if (/\b(hello|hi there|hey there|hi|hey|welcome|good morning|good afternoon|good evening)\b/.test(t)) {
    return "GREETING"
  }
  if (
    /\b(can i help|how can i help|what can i do for you|need any help|anything i can help|here to help)\b/.test(t)
  ) {
    return "OFFER_HELP"
  }
  return null
}
