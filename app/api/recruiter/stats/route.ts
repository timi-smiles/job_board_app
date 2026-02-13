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
    if (!decoded || decoded.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: decoded.userId },
    })

    if (!recruiter) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const stats = {
      activeJobs: await prisma.jobListing.count({
        where: { recruiterId: recruiter.id, isActive: true },
      }),
      totalApplications: await prisma.jobApplication.count({
        where: {
          jobListing: {
            recruiterId: recruiter.id,
          },
        },
      }),
      newApplications: await prisma.jobApplication.count({
        where: {
          jobListing: {
            recruiterId: recruiter.id,
          },
          status: 'APPLIED',
        },
      }),
      totalCandidatesViewed: await prisma.jobApplication.count({
        where: {
          jobListing: {
            recruiterId: recruiter.id,
          },
          status: {
            in: ['SHORTLISTED', 'ACCEPTED', 'REJECTED'],
          },
        },
      }),
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
