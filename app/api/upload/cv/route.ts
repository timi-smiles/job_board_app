import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// This is a placeholder implementation
// In production, you would upload to a cloud storage service like AWS S3, Google Cloud Storage, or Vercel Blob
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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type and size
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and DOC files are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // In production, upload to cloud storage and get URL
    // For now, we'll just store the file name
    const fileName = `${Date.now()}-${file.name}`

    // Update job seeker profile with CV info
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: decoded.userId },
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // In production, you would upload to cloud storage and get a URL
    // For demo purposes, we'll use a placeholder URL
    const cvUrl = `/uploads/cv/${fileName}`

    await prisma.jobSeeker.update({
      where: { id: jobSeeker.id },
      data: {
        cvUrl,
        cvFileName: file.name,
      },
    })

    return NextResponse.json(
      {
        success: true,
        url: cvUrl,
        fileName: file.name,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
