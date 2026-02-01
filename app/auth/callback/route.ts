import { NextResponse } from "next/server"

/**
 * Firebase Auth: OAuth redirect lands here. With signInWithPopup we don't use this;
 * if you switch to signInWithRedirect, handle getRedirectResult() on a page that loads after redirect.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get("next") ?? "/dashboard"
  return NextResponse.redirect(`${origin}${next}`)
}
