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

    let profile = await prisma.recruiter.findUnique({
      where: { userId: decoded.userId },
    })

    // If profile doesn't exist, create it (for users who registered before this was set up)
    if (!profile) {
      console.log('Profile not found, creating new profile for user:', decoded.userId)
      profile = await prisma.recruiter.create({
        data: {
          userId: decoded.userId,
          companyName: '',
        },
      })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('jobboard_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()

    const profile = await prisma.recruiter.update({
      where: { userId: decoded.userId },
      data: {
        companyName: body.companyName,
        companyDescription: body.companyDescription,
        industry: body.industry,
        companyWebsite: body.companyWebsite,
        companyLocation: body.companyLocation,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
