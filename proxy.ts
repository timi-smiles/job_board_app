import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenMiddleware } from '@/lib/jwt-middleware'
import { ADMIN_AUTH_COOKIE } from '@/lib/admin-auth'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // --- Admin area: uses `jobboard_admin_token`, not `jobboard_token`
  if (pathname.startsWith('/admin')) {
    const isPublicAdmin =
      pathname === '/admin' ||
      pathname === '/admin/' ||
      pathname.startsWith('/admin/login') ||
      pathname.startsWith('/admin/register')

    if (isPublicAdmin) {
      return NextResponse.next()
    }

    const adminToken = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
    const adminDecoded = adminToken
      ? await verifyTokenMiddleware(adminToken)
      : null
    if (adminDecoded?.role === 'ADMIN') {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const publicRoutes = ['/', '/auth/login', '/auth/register']
  const isPublicRoute = publicRoutes.includes(pathname)

  const token = request.cookies.get('jobboard_token')?.value

  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (token) {
    const decoded = await verifyTokenMiddleware(token)

    if (!decoded && !isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
