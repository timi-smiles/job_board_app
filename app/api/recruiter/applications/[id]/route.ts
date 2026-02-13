import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendApplicationStatusEmail } from '@/lib/email'
import { sendPushToUser } from '@/lib/push'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.cookies.get('jobboard_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: decoded.userId },
    })

    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter profile not found' }, { status: 404 })
    }

    // Fetch full application with candidate and job details (for notifications)
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: id,
        jobListing: {
          recruiterId: recruiter.id,
        },
      },
      include: {
        jobSeeker: {
          include: {
            user: { select: { email: true } },
          },
        },
        jobListing: {
          include: {
            recruiter: { select: { companyName: true } },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found or access denied' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const previousStatus = application.status

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: id },
      data: { status },
    })

    // Send notifications when status changes to SHORTLISTED, REJECTED, or ACCEPTED
    const notifyStatuses = ['SHORTLISTED', 'REJECTED', 'ACCEPTED'] as const
    if (previousStatus !== status && notifyStatuses.includes(status as typeof notifyStatuses[number])) {
      const candidateName =
        [application.jobSeeker.firstName, application.jobSeeker.lastName].filter(Boolean).join(' ') ||
        'Candidate'
      const jobTitle = application.jobListing.jobTitle
      const companyName = application.jobListing.recruiter.companyName
      const candidateEmail = application.jobSeeker.user?.email
      const candidateUserId = application.jobSeeker.userId

      // Email
      if (candidateEmail) {
        sendApplicationStatusEmail(candidateEmail, {
          candidateName,
          jobTitle,
          companyName,
          newStatus: status as 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED',
        }).catch((e) => console.error('[Notifications] Email failed:', e))
      }

      // Push notification (jobSeeker.userId is the User id)
      if (candidateUserId) {
        const statusLabels = {
          SHORTLISTED: "You've been shortlisted!",
          REJECTED: 'Application update',
          ACCEPTED: "You've been accepted for an interview!",
        }
        sendPushToUser(candidateUserId, {
          title: statusLabels[status as keyof typeof statusLabels] || 'Application update',
          body: `${companyName} – ${jobTitle}`,
          url: '/dashboard/seeker/applications',
        }).catch((e) => console.error('[Notifications] Push failed:', e))
      }
    }

    return NextResponse.json({ application: updatedApplication })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}
