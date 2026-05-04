import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const jobSeekers = await prisma.jobSeeker.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, createdAt: true } },
        educations: { orderBy: { completionYear: 'desc' } },
        skills: { orderBy: { name: 'asc' } },
        certifications: { orderBy: { name: 'asc' } },
        _count: { select: { applications: true } },
      },
    })

    return NextResponse.json({ jobSeekers })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load candidates' }, { status: 500 })
  }
}
