'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import HeaderNav from '@/components/HeaderNav'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface JobListing {
  id: string
  jobTitle: string
  description: string
  employmentType: string
  location?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  requiredQualifications?: string
  requiredSkills?: string
  createdAt: string
  recruiter: {
    companyName: string
    companyDescription?: string
    companyWebsite?: string
    companyLocation?: string
    industry?: string
  }
}

interface Application {
  id: string
  status: string
  appliedAt: string
}

function calculateProfileCompletion(profile: { firstName?: string; lastName?: string; summary?: string; yearsOfExperience?: number; cvUrl?: string; skills?: unknown[] } | null): number {
  if (!profile) return 0
  let completion = 0
  if (profile.firstName) completion += 15
  if (profile.lastName) completion += 15
  if (profile.summary) completion += 20
  if (profile.yearsOfExperience) completion += 15
  if (profile.cvUrl) completion += 25
  if (profile.skills && profile.skills.length > 0) completion += 10
  return completion
}

export default function PublicJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [jobId, setJobId] = useState('')
  const [job, setJob] = useState<JobListing | null>(null)
  const [, setApplication] = useState<Application | null>(null) // used only after successful apply
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [auth, setAuth] = useState<{ role: string } | null>(null)
  const [profileCompletion, setProfileCompletion] = useState<number | null>(null)

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params
      setJobId(id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!jobId) return

    const load = async () => {
      try {
        const jobRes = await fetch(`/api/jobs/${jobId}`)
        if (!jobRes.ok) throw new Error('Job not found')
        const jobData = await jobRes.json()
        setJob(jobData.job)

        const meRes = await fetch('/api/auth/me')
        if (meRes.ok) {
          const meData = await meRes.json()
          setAuth(meData.user)

          if (meData.user?.role === 'JOB_SEEKER') {
            const profileRes = await fetch('/api/seeker/profile')
            if (profileRes.ok) {
              const profileData = await profileRes.json()
              setProfileCompletion(calculateProfileCompletion(profileData.profile))
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [jobId])

  const handleApplyClick = () => {
    if (!auth) {
      router.push(`/auth/login?redirect=/jobs/${jobId}`)
      return
    }
    if (auth.role !== 'JOB_SEEKER') {
      return
    }
    if (profileCompletion !== null && profileCompletion < 100) {
      router.push(`/dashboard/seeker/profile?from=apply&jobId=${jobId}`)
      return
    }
    setShowConfirmDialog(true)
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      const res = await fetch('/api/seeker/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobListingId: jobId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to apply')
      }
      const data = await res.json()
      setApplication(data.application)
      setShowConfirmDialog(false)
      setSuccessMessage('Application submitted successfully!')
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to apply'
      setError(msg.includes('already applied') ? "You've already applied to this job. Check My Applications for status." : msg)
      setShowConfirmDialog(false)
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderNav />
        <div className="max-w-5xl mx-auto px-4 py-16 flex justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderNav />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Job not found</AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link href="/jobs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to jobs
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const canApply = auth?.role === 'JOB_SEEKER' && profileCompletion === 100
  const needsProfile = auth?.role === 'JOB_SEEKER' && profileCompletion !== null && profileCompletion < 100
  const needsLogin = !auth

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <HeaderNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button asChild variant="ghost" className="mb-6 -ml-2">
          <Link href="/jobs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to jobs
          </Link>
        </Button>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{job.jobTitle}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="text-lg">{job.recruiter.companyName}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 sm:mt-6">
                {job.employmentType && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{job.employmentType.replace('_', ' ')}</span>
                  </div>
                )}
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{job.location}</span>
                  </div>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {job.salaryMin && job.salaryMax
                        ? `${job.currency || 'USD'} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                        : job.salaryMin
                        ? `From ${job.currency || 'USD'} ${job.salaryMin.toLocaleString()}`
                        : `Up to ${job.currency || 'USD'} ${job.salaryMax?.toLocaleString()}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <div className="text-gray-700 whitespace-pre-wrap">{job.description}</div>
              </div>

              {job.requiredQualifications && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Qualifications</h3>
                  <div className="text-gray-700 whitespace-pre-wrap">{job.requiredQualifications}</div>
                </div>
              )}

              {job.requiredSkills && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Required Skills</h3>
                  <div className="text-gray-700 whitespace-pre-wrap">{job.requiredSkills}</div>
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card className="p-6 border-2 border-gray-200 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">{job.recruiter.companyName}</h3>
              {job.recruiter.industry && (
                <p className="text-sm text-gray-600 mb-3">Industry: {job.recruiter.industry}</p>
              )}
              {job.recruiter.companyLocation && (
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {job.recruiter.companyLocation}
                </p>
              )}

              <div className="mt-6 space-y-3">
                {canApply ? (
                  <Button onClick={handleApplyClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white size-lg">
                    Apply Now
                  </Button>
                ) : needsProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <User className="w-5 h-5 text-amber-600" />
                      <p className="text-sm font-medium text-amber-900">Complete your profile to apply</p>
                    </div>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href="/dashboard/seeker/profile">Complete profile</Link>
                    </Button>
                  </div>
                ) : needsLogin ? (
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white size-lg">
                      <Link href={`/auth/login?redirect=/jobs/${jobId}`}>Apply Now</Link>
                    </Button>
                    <p className="text-sm text-center text-gray-600">
                      Don&apos;t have an account?{' '}
                      <Link href={`/auth/register?redirect=/jobs/${jobId}`} className="font-medium text-blue-600 hover:underline">
                        Sign up
                      </Link>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Candidates only. Sign in as a job seeker to apply.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm application</DialogTitle>
            <DialogDescription>
              Your profile and resume will be sent to {job.recruiter.companyName}. Apply for {job.jobTitle}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={applying}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={applying} className="bg-blue-600 hover:bg-blue-700">
              {applying ? 'Submitting...' : 'Confirm & Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
