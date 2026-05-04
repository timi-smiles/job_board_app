import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import type { TokenPayload } from '@/lib/auth'

/** Separate from employer / job-seeker `jobboard_token` */
export const ADMIN_AUTH_COOKIE = 'jobboard_admin_token'

export function adminAuthCookieAttributes(maxAgeSecs: number): {
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax'
  path: string
  maxAge: number
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSecs,
  }
}

export function getAdminFromRequest(request: NextRequest): TokenPayload | null {
  const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
  if (!token) return null
  const decoded = verifyToken(token)
  if (!decoded || decoded.role !== 'ADMIN') return null
  return decoded
}
