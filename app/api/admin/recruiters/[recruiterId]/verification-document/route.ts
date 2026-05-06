import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { readStoredFile } from '@/lib/stored-files'

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

  const stored = await readStoredFile(recruiter.verificationDocUrl)
  if (!stored) {
    return NextResponse.json(
      { error: 'File missing on server. Re-upload may be required.' },
      { status: 404 }
    )
  }

  const url = recruiter.verificationDocUrl
  const pathFromUrl = url.startsWith('http')
    ? (() => {
        try {
          return path.basename(new URL(url).pathname)
        } catch {
          return 'document'
        }
      })()
    : path.basename(url)
  const rawName = recruiter.verificationDocName?.trim() || pathFromUrl || 'document'
  const safeName =
    rawName.replace(/[^\w.\- ()\[\]]+/g, '_').slice(0, 200) || 'document'

  const download = request.nextUrl.searchParams.get('download') === '1'
  const disposition = download ? 'attachment' : 'inline'
  const contentType =
    stored.contentType !== 'application/octet-stream'
      ? stored.contentType
      : mimeForFileName(safeName)

  return new NextResponse(stored.buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `${disposition}; filename="${safeName.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
