import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const jobs = await prisma.jobListing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        recruiter: {
          select: {
            companyName: true,
            isVerified: true,
            companyLocation: true,
            user: { select: { email: true } },
          },
        },
        _count: { select: { applications: true } },
      },
    })

    return NextResponse.json({ jobs })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 })
  }
}
