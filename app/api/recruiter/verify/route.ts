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
    if (!decoded || decoded.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type and size
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: decoded.userId },
    })

    if (!recruiter) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // In production, upload to cloud storage and get URL
    const fileName = `${Date.now()}-${file.name}`
    const docUrl = `/uploads/verification/${fileName}`

    await prisma.recruiter.update({
      where: { id: recruiter.id },
      data: {
        verificationDocUrl: docUrl,
        verificationDocName: file.name,
        // Note: In production, you would verify the document and set isVerified accordingly
        // For this demo, we'll set it to false and let an admin review it
      },
    })

    return NextResponse.json(
      {
        success: true,
        url: docUrl,
        fileName: file.name,
        message: 'Document uploaded successfully. Our team will review it shortly.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error uploading verification document:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}
