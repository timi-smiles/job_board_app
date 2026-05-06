import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { readStoredFile } from '@/lib/stored-files'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('jobboard_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'JOB_SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: decoded.userId },
      select: { cvUrl: true, cvFileName: true },
    })

    if (!jobSeeker?.cvUrl) {
      return NextResponse.json({ error: 'No CV on file' }, { status: 404 })
    }

    const data = await readStoredFile(jobSeeker.cvUrl)
    if (!data) {
      return NextResponse.json({ error: 'File missing' }, { status: 404 })
    }

    const rawName = jobSeeker.cvFileName?.trim() || 'resume'
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
  } catch (error) {
    console.error('Error serving seeker CV:', error)
    return NextResponse.json({ error: 'Failed to load CV' }, { status: 500 })
  }
}
