/**
 * User-friendly messages for Firebase Auth errors.
 * Firebase returns codes like auth/wrong-password; we map them to readable text.
 */

export function getAuthErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : ""

  const authMessages: Record<string, string> = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/invalid-login-credentials": "Invalid email or password.",
    "auth/email-already-in-use": "An account already exists with this email. Try signing in.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Contact support.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/popup-blocked": "Sign-in popup was blocked. Allow popups for this site.",
    "auth/cancelled-popup-request": "Sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/requires-recent-login": "Please sign in again to complete this action.",
  }

  if (code && authMessages[code]) return authMessages[code]
  if (message && message.includes("auth/")) {
    const match = message.match(/auth\/[a-z-]+/i)
    if (match && authMessages[match[0]]) return authMessages[match[0]]
  }
  return message || "Something went wrong. Please try again."
}
