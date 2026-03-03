import { NextResponse } from "next/server"
import { Resend } from "resend"

/**
 * Request Access API
 *
 * Environment variables:
 * - REQUEST_ACCESS_TO_EMAIL: recipient for request notifications (required when sending)
 * - RESEND_API_KEY: Resend API key (required when sending)
 * - REQUEST_ACCESS_FROM_EMAIL: optional "from" address (defaults to onboarding@resend.dev for testing)
 */
const toEmail = process.env.REQUEST_ACCESS_TO_EMAIL
const fromEmail = process.env.REQUEST_ACCESS_FROM_EMAIL ?? "onboarding@resend.dev"

const REQUIRED = ["name", "email", "jobTitle", "industry", "useCase"] as const

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""
  const jobTitle = typeof body.jobTitle === "string" ? body.jobTitle.trim() : ""
  const industry = typeof body.industry === "string" ? body.industry.trim() : ""
  const useCase = typeof body.useCase === "string" ? body.useCase.trim() : ""
  const schoolEmail = typeof body.schoolEmail === "string" ? body.schoolEmail.trim() : undefined

  for (const key of REQUIRED) {
    const value = key === "name" ? name : key === "email" ? email : key === "jobTitle" ? jobTitle : key === "industry" ? industry : useCase
    if (!value) {
      return NextResponse.json({ error: `Missing or invalid required field: ${key}` }, { status: 400 })
    }
  }

  if (!toEmail || !process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Request access email is not configured. Set REQUEST_ACCESS_TO_EMAIL and RESEND_API_KEY." },
      { status: 503 }
    )
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const subject = `Request Access: ${name} (${email})`
    const html = `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Job title:</strong> ${escapeHtml(jobTitle)}</p>
      <p><strong>Industry:</strong> ${escapeHtml(industry)}</p>
      <p><strong>What do you plan to use Clarte for?</strong></p>
      <p>${escapeHtml(useCase)}</p>
      ${schoolEmail ? `<p><strong>School email:</strong> ${escapeHtml(schoolEmail)}</p>` : ""}
    `.trim()

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
    })

    const sendAutoReply = process.env.REQUEST_ACCESS_AUTO_REPLY !== "false"
    if (sendAutoReply) {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "We've received your Clarte access request",
        html: `
          <p>Hi ${escapeHtml(name)},</p>
          <p>We've received your request for early access to Clarte. We'll review it and get back to you soon.</p>
          <p>— The Clarte team</p>
        `.trim(),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json(
      { error: message || "Failed to send request" },
      { status: 500 }
    )
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
