import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { z } from 'zod'

const BodySchema = z.object({
  approved: z.boolean(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ recruiterId: string }> }
) {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { recruiterId } = await params

  try {
    const body = BodySchema.parse(await request.json())

    const recruiter = await prisma.recruiter.findUnique({
      where: { id: recruiterId },
    })

    if (!recruiter) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const updated = await prisma.recruiter.update({
      where: { id: recruiterId },
      data: {
        isVerified: body.approved,
        // When rejecting, clear doc so employer can upload again
        ...(body.approved === false
          ? { verificationDocUrl: null, verificationDocName: null }
          : {}),
      },
    })

    return NextResponse.json({ recruiter: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error(error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
