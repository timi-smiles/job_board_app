import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'JobBoard <onboarding@resend.dev>'

export async function sendApplicationStatusEmail(
  to: string,
  params: {
    candidateName: string
    jobTitle: string
    companyName: string
    newStatus: 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED'
  }
) {
  if (!resend) {
    console.log('[Email] Skipping - RESEND_API_KEY not set. Would have sent to:', to, params)
    return { ok: true }
  }

  const { candidateName, jobTitle, companyName, newStatus } = params
  const firstName = candidateName.split(' ')[0] || 'there'
  const statusMessages: Record<string, { subject: string; headline: string; body: string; cta: string }> = {
    SHORTLISTED: {
      subject: `Great news! You've been shortlisted for ${jobTitle}`,
      headline: "You've been shortlisted! 🎉",
      body: `${companyName} has shortlisted your application for the ${jobTitle} position. They're interested in learning more about you.`,
      cta: 'View your application',
    },
    REJECTED: {
      subject: `Update on your application for ${jobTitle}`,
      headline: 'Application status update',
      body: `Thank you for applying to ${jobTitle} at ${companyName}. Unfortunately, they have decided to move forward with other candidates at this time. We encourage you to keep applying to other roles.`,
      cta: 'Browse more jobs',
    },
    ACCEPTED: {
      subject: `Congratulations! You've been accepted for an interview at ${companyName}`,
      headline: "You've been accepted for an interview! 🎉",
      body: `Great news! ${companyName} wants to interview you for the ${jobTitle} position. They will be in touch with next steps.`,
      cta: 'View details',
    },
  }
  const config = statusMessages[newStatus]
  if (!config) return { ok: true }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: config.subject,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.subject}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="margin:0 0 16px;font-size:24px;color:#111827;">${config.headline}</h1>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">Hi ${firstName},</p>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">${config.body}</p>
      <a href="${appUrl}/dashboard/seeker/applications" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">${config.cta}</a>
      <p style="margin:24px 0 0;font-size:14px;color:#9ca3af;">JobBoard – Find your dream job</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    })
    if (error) {
      console.error('[Email] Resend error:', error)
      return { ok: false, error }
    }
    return { ok: true }
  } catch (err) {
    console.error('[Email] Send failed:', err)
    return { ok: false, error: err }
  }
}
