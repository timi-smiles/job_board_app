import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Saves under public/uploads/verification for local dev. For production, use S3, GCS, or Vercel Blob.

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
])

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'])

function isAcceptedVerificationFile(file: File): boolean {
  const ext = path.extname(file.name).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) return false
  if (file.type === '' || file.type === 'application/octet-stream') return true
  return MIME_TYPES.has(file.type)
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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!isAcceptedVerificationFile(file)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
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

    const extRaw = path.extname(file.name).slice(1).toLowerCase()
    const ext =
      ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'].includes(extRaw) ? extRaw : null
    if (!ext) {
      return NextResponse.json({ error: 'Invalid file extension.' }, { status: 400 })
    }

    const fileName = `${recruiter.id}-${Date.now()}.${ext}`
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'verification')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch {
      // directory may exist
    }

    const bytes = await file.arrayBuffer()
    await writeFile(path.join(uploadsDir, fileName), Buffer.from(bytes))

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
    return NextResponse.json(
      {
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
