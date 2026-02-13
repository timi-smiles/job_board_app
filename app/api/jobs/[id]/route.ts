import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const job = await prisma.jobListing.findUnique({
      where: { 
        id: id,
        isActive: true
      },
      include: {
        recruiter: {
          select: {
            companyName: true,
            companyDescription: true,
            companyWebsite: true,
            companyLocation: true,
            industry: true,
            isVerified: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}
