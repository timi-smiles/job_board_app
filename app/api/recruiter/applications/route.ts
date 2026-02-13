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
      return NextResponse.json({ error: 'Recruiter profile not found' }, { status: 404 })
    }

    // Check for limit parameter
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : undefined

    // Get all applications for this recruiter's job listings
    const applications = await prisma.jobApplication.findMany({
      where: {
        jobListing: {
          recruiterId: recruiter.id,
        },
      },
      include: {
        jobSeeker: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
            skills: true,
            educations: true,
            certifications: true,
          },
        },
        jobListing: {
          select: {
            id: true,
            jobTitle: true,
            employmentType: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
      take: limit,
    })

    // Transform the data to include email in jobSeeker
    const transformedApplications = applications.map((app) => ({
      id: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      jobSeeker: {
        id: app.jobSeeker.id,
        firstName: app.jobSeeker.firstName,
        lastName: app.jobSeeker.lastName,
        email: app.jobSeeker.user.email,
        phoneNumber: app.jobSeeker.phoneNumber,
        summary: app.jobSeeker.summary,
        location: app.jobSeeker.location,
        yearsOfExperience: app.jobSeeker.yearsOfExperience,
        cvUrl: app.jobSeeker.cvUrl,
        cvFileName: app.jobSeeker.cvFileName,
        skills: app.jobSeeker.skills,
        educations: app.jobSeeker.educations,
        certifications: app.jobSeeker.certifications,
      },
      jobListing: app.jobListing,
    }))

    return NextResponse.json({ applications: transformedApplications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
