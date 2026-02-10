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

    // Get all job seekers with their related data
    const candidates = await prisma.jobSeeker.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        summary: true,
        yearsOfExperience: true,
        location: true,
        skills: {
          select: {
            id: true,
            name: true,
            proficiency: true,
          },
        },
        educations: {
          select: {
            id: true,
            qualification: true,
          },
        },
        certifications: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ candidates })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}
