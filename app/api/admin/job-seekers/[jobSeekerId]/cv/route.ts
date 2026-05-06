import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { readStoredFile } from '@/lib/stored-files'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobSeekerId: string }> }
) {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { jobSeekerId } = await params

  const seeker = await prisma.jobSeeker.findUnique({
    where: { id: jobSeekerId },
    select: { cvUrl: true, cvFileName: true },
  })

  if (!seeker?.cvUrl) {
    return NextResponse.json({ error: 'CV not found' }, { status: 404 })
  }

  const data = await readStoredFile(seeker.cvUrl)
  if (!data) {
    return NextResponse.json({ error: 'File missing' }, { status: 404 })
  }

  const rawName = seeker.cvFileName?.trim() || 'resume'
  const safeName =
    rawName.replace(/[^\w.\- ()\[\]]+/g, '_').slice(0, 200) || 'resume'
  const download = request.nextUrl.searchParams.get('download') === '1'
  const disposition = download ? 'attachment' : 'inline'

  return new NextResponse(data.buffer, {
    status: 200,
    headers: {
      'Content-Type': data.contentType,
      'Content-Disposition': `${disposition}; filename="${safeName.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
