import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('jobboard_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'JOB_SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: decoded.userId },
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const education = await prisma.education.create({
      data: {
        jobSeekerId: jobSeeker.id,
        qualification: body.qualification,
        institution: body.institution,
        completionYear: body.completionYear,
      },
    })

    return NextResponse.json({ education }, { status: 201 })
  } catch (error) {
    console.error('Error creating education:', error)
    return NextResponse.json({ error: 'Failed to create education' }, { status: 500 })
  }
}
