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

    const jobs = await prisma.jobListing.findMany({
      where: { recruiterId: recruiter.id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()

    const job = await prisma.jobListing.create({
      data: {
        recruiterId: recruiter.id,
        jobTitle: body.jobTitle,
        description: body.description,
        employmentType: body.employmentType,
        location: body.location,
        requiredQualifications: body.requiredQualifications,
        requiredSkills: body.requiredSkills,
        salaryMin: body.salaryMin,
        salaryMax: body.salaryMax,
        isActive: true,
      },
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
