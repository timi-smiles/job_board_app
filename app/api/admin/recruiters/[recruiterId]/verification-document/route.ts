import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

const UPLOAD_PREFIX = '/uploads/verification/'

function mimeForFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  const map: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.doc': 'application/msword',
    '.docx':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
  return map[ext] ?? 'application/octet-stream'
}

/** Safe single-segment file name under verification uploads */
function parseVerificationFileName(verificationDocUrl: string): string | null {
  if (!verificationDocUrl.startsWith(UPLOAD_PREFIX)) return null
  const rest = verificationDocUrl.slice(UPLOAD_PREFIX.length)
  if (!rest || rest.includes('/') || rest.includes('\\') || rest.includes('..')) {
    return null
  }
  return rest
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recruiterId: string }> }
) {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { recruiterId } = await params

  const recruiter = await prisma.recruiter.findUnique({
    where: { id: recruiterId },
  })

  if (!recruiter?.verificationDocUrl) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const baseName = parseVerificationFileName(recruiter.verificationDocUrl)
  if (!baseName) {
    return NextResponse.json({ error: 'Invalid document path' }, { status: 400 })
  }

  const absolutePath = path.join(
    process.cwd(),
    'public',
    'uploads',
    'verification',
    baseName
  )

  let buffer: Buffer
  try {
    buffer = await readFile(absolutePath)
  } catch {
    return NextResponse.json(
      { error: 'File missing on server. Re-upload may be required.' },
      { status: 404 }
    )
  }

  const download = request.nextUrl.searchParams.get('download') === '1'
  const rawName = recruiter.verificationDocName?.trim() || baseName
  const safeName =
    rawName.replace(/[^\w.\- ()\[\]]+/g, '_').slice(0, 200) || baseName

  const contentType = mimeForFileName(baseName)
  const disposition = download ? 'attachment' : 'inline'

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `${disposition}; filename="${safeName.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
