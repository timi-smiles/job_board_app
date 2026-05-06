import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import path from 'path'
import { deleteBlobIfExists, storePrivateUpload } from '@/lib/stored-files'
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

    const MIME_TYPES = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ])
    const ALLOWED_CV_EXT = new Set(['.pdf', '.doc', '.docx'])

    const ext = path.extname(file.name).toLowerCase()
    const cvTypeOk =
      ALLOWED_CV_EXT.has(ext) &&
      (MIME_TYPES.has(file.type) ||
        file.type === '' ||
        file.type === 'application/octet-stream')

    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!cvTypeOk) {
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

    // Get job seeker profile
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: decoded.userId },
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const extKey = path.extname(file.name).slice(1).toLowerCase()
    const fileName = `${decoded.userId}-${Date.now()}.${extKey}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const contentHint =
      file.type && file.type !== 'application/octet-stream'
        ? file.type
        : undefined

    const previousCvUrl = jobSeeker.cvUrl
    const { storedUrl: cvUrl } = await storePrivateUpload(
      `cv/${fileName}`,
      buffer,
      contentHint
    )

    await deleteBlobIfExists(previousCvUrl)

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
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
