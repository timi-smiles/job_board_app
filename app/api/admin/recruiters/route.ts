import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const recruiters = await prisma.recruiter.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { email: true, createdAt: true } },
        _count: { select: { jobListings: true } },
      },
    })

    return NextResponse.json({ recruiters })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load recruiters' }, { status: 500 })
  }
}
