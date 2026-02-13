import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails('mailto:support@jobboard.com', vapidPublicKey, vapidPrivateKey)
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log('[Push] Skipping - VAPID keys not set')
    return { ok: true }
  }

  const subscription = await prisma.pushSubscription.findUnique({
    where: { userId },
  })

  if (!subscription) return { ok: true }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload),
      { TTL: 86400 } // 24 hours
    )
    return { ok: true }
  } catch (err) {
    console.error('[Push] Send failed:', err)
    return { ok: false }
  }
}

export function getVapidPublicKey() {
  return vapidPublicKey || null
}
