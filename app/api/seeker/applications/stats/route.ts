import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('jobboard_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'JOB_SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: decoded.userId },
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const stats = {
      applied: await prisma.jobApplication.count({
        where: { jobSeekerId: jobSeeker.id, status: 'APPLIED' },
      }),
      shortlisted: await prisma.jobApplication.count({
        where: { jobSeekerId: jobSeeker.id, status: 'SHORTLISTED' },
      }),
      rejected: await prisma.jobApplication.count({
        where: { jobSeekerId: jobSeeker.id, status: 'REJECTED' },
      }),
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
