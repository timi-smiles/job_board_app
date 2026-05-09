import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('jobboard_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        summary: true,
        location: true,
        yearsOfExperience: true,
        cvUrl: true,
        cvFileName: true,
        user: {
          select: { email: true },
        },
        skills: {
          select: { id: true, name: true, proficiency: true },
          orderBy: { name: 'asc' },
        },
        educations: {
          select: {
            id: true,
            qualification: true,
            institution: true,
            completionYear: true,
          },
        },
        certifications: {
          select: {
            id: true,
            name: true,
            issuer: true,
            issueDate: true,
            expiryDate: true,
          },
        },
      },
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const { user, ...rest } = jobSeeker

    return NextResponse.json({
      candidate: {
        ...rest,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Error fetching candidate:', error)
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 })
  }
}
