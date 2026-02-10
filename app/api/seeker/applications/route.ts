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

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobSeekerId_jobListingId: {
          jobSeekerId: jobSeeker.id,
          jobListingId: body.jobListingId,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      )
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobSeekerId: jobSeeker.id,
        jobListingId: body.jobListingId,
        status: 'APPLIED',
      },
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}
