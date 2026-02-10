import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes that don't require auth
  const publicRoutes = ['/', '/auth/login', '/auth/register']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Get token from cookies
  const token = request.cookies.get('jobboard_token')?.value

  // If it's a protected route and no token, redirect to login
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If token exists, verify it
  if (token) {
    const decoded = verifyToken(token)

    // If token is invalid, redirect to login
    if (!decoded && !isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check role-based route protection
    if (decoded) {
      const isJobSeekerRoute = pathname.startsWith('/dashboard/seeker')
      const isRecruiterRoute = pathname.startsWith('/dashboard/recruiter')

      if (isJobSeekerRoute && decoded.role !== 'JOB_SEEKER') {
        return NextResponse.redirect(new URL('/dashboard/recruiter', request.url))
      }

      if (isRecruiterRoute && decoded.role !== 'RECRUITER') {
        return NextResponse.redirect(new URL('/dashboard/seeker', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
