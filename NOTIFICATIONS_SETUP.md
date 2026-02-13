# Notification Setup

When a recruiter shortlists, rejects, or accepts an application, candidates receive:

1. **Email** – Sent via Resend (optional)
2. **In-app toast** – Shown when the candidate has the My Applications page open (polls every 45 seconds)
3. **Browser push** – If the candidate enabled push notifications

## 1. Email (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add to `.env`:
   ```
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=JobBoard <noreply@yourdomain.com>
   ```
4. For Resend's free tier, use `onboarding@resend.dev` as sender (default) – you can only send to your own email for verification.

Without `RESEND_API_KEY`, emails are skipped (logs only).

## 2. In-app toasts

No setup required. Uses Sonner toasts and polling on the My Applications page.

## 3. Push notifications

1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Add to `.env`:
   ```
   VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   ```
3. Run the migration:
   ```bash
   npx prisma migrate dev
   ```
4. Push works over **HTTPS** (or localhost). Candidates see an "Enable notifications" link on My Applications and can opt in.

Without VAPID keys, push is skipped (logs only).
