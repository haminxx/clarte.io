/**
 * Token fetch for LiveKit. Used by web, desktop (Tauri), and can be mirrored in Swift.
 */

export interface TokenResult {
  token: string
  room: string
}

export interface TokenError {
  error: string
}

export type TokenResponse = TokenResult | TokenError

export async function fetchClarteToken(
  baseUrl: string,
  options: { voice?: string; mode?: "casual" | "expert" } = {}
): Promise<TokenResponse> {
  const { voice = "marin", mode = "casual" } = options
  const tokenUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/token` : "/api/token"
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voice, mode }),
  })
  const raw = await res.text()
  if (!res.ok) {
    let errMsg = raw || `Token request failed: ${res.status}`
    try {
      const parsed = JSON.parse(raw) as { error?: string; detail?: string }
      if (parsed?.error) errMsg = parsed.error
      else if (parsed?.detail) errMsg = parsed.detail
    } catch {
      /* use raw */
    }
    return { error: errMsg }
  }
  let data: { token?: string; room?: string }
  try {
    data = JSON.parse(raw) as { token?: string; room?: string }
  } catch {
    return { error: "Invalid token response" }
  }
  const token = data?.token ?? null
  const room = data?.room ?? null
  if (!token || token.trim() === "") return { error: "Token is empty" }
  return { token, room: room ?? `room-${Date.now()}` }
}
