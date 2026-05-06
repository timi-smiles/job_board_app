import { jwtVerify } from 'jose'
import type { UserRole } from '@/generated/client'
import { getJwtSecretString } from '@/lib/auth-constants'

export interface MiddlewareTokenPayload {
  userId: string
  email: string
  role: UserRole
}

/**
 * Edge-safe JWT verify for `proxy.ts`. Do not use `jsonwebtoken` in middleware — it breaks on Edge.
 */
export async function verifyTokenMiddleware(
  token: string
): Promise<MiddlewareTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretString()),
      { algorithms: ['HS256'] }
    )
    const userId = payload.userId
    const email = payload.email
    const role = payload.role
    if (
      typeof userId !== 'string' ||
      typeof email !== 'string' ||
      typeof role !== 'string'
    ) {
      return null
    }
    return {
      userId,
      email,
      role: role as UserRole,
    }
  } catch {
    return null
  }
}
