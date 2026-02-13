'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [jobId, setJobId] = useState<string>('')
  const [job, setJob] = useState<JobListing | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setJobId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!jobId) return

    const fetchJobDetails = async () => {
      try {
        // Fetch job details
        const jobResponse = await fetch(`/api/jobs/${jobId}`)
        if (!jobResponse.ok) throw new Error('Failed to fetch job details')
        const jobData = await jobResponse.json()
        setJob(jobData.job)

        // Check if already applied
        const appResponse = await fetch(`/api/seeker/applications?jobId=${jobId}`)
        if (appResponse.ok) {
          const appData = await appResponse.json()
          if (appData.application) {
            setApplication(appData.application)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job')
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId])

  const handleApply = async () => {
    setApplying(true)
    try {
      const response = await fetch('/api/seeker/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobListingId: jobId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to apply')
      }

      const data = await response.json()
      setApplication(data.application)
      setShowConfirmDialog(false)
      setSuccessMessage('Application submitted successfully! The recruiter will be notified.')
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply for job')
      setShowConfirmDialog(false)
    } finally {
      setApplying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      APPLIED: { label: 'Applied', icon: Clock, className: 'bg-blue-100 text-blue-800' },
      SHORTLISTED: { label: 'Shortlisted', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-800' },
      ACCEPTED: { label: 'Accepted', icon: CheckCircle, className: 'bg-emerald-100 text-emerald-800' },
      WITHDRAWN: { label: 'Withdrawn', icon: XCircle, className: 'bg-gray-100 text-gray-800' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.APPLIED
    const Icon = config.icon

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-8 min-h-screen flex items-center justify-center">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-gray-600 font-medium">Loading job details...</div>
        </div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/dashboard/seeker/jobs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!job) return null

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-4 sm:mb-6 -ml-2">
          <Link href="/dashboard/seeker/jobs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Job Header */}
            <Card className="p-4 sm:p-6 lg:p-8 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">{job.jobTitle}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="text-base sm:text-lg truncate">{job.recruiter.companyName}</span>
                  </div>
                </div>
                {application && <div className="shrink-0">{getStatusBadge(application.status)}</div>}
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 sm:mt-6">
                {job.employmentType && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {job.employmentType.replace('_', ' ')}
                    </span>
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
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Job Description */}
            <Card className="p-8 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
            </Card>

            {/* Required Skills */}
            {job.requiredSkills && (
              <Card className="p-8 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.split(',').map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Required Qualifications */}
            {job.requiredQualifications && (
              <Card className="p-8 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Qualifications</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.requiredQualifications}
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="p-6 border border-gray-200 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for this position</h3>
              
              {application ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">Application Status:</p>
                    {getStatusBadge(application.status)}
                    <p className="text-xs text-blue-600 mt-2">
                      Applied on {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {application.status === 'APPLIED' && (
                    <p className="text-sm text-gray-600">
                      Your application is being reviewed by the recruiter. You'll be notified of any updates.
                    </p>
                  )}
                  {application.status === 'SHORTLISTED' && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Congratulations! You've been shortlisted for this position.
                      </AlertDescription>
                    </Alert>
                  )}
                  {application.status === 'ACCEPTED' && (
                    <Alert className="bg-emerald-50 border-emerald-200">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <AlertDescription className="text-emerald-800">
                        Congratulations! Your application has been accepted!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-6">
                    Submit your application for this position. The recruiter will review your profile and get back to you.
                  </p>
                  <Button 
                    onClick={() => setShowConfirmDialog(true)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                    size="lg"
                  >
                    Apply Now
                  </Button>
                </>
              )}
            </Card>

            {/* Company Info */}
            <Card className="p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-medium text-gray-900">{job.recruiter.companyName}</p>
                </div>
                {job.recruiter.industry && (
                  <div>
                    <p className="text-sm text-gray-600">Industry</p>
                    <p className="font-medium text-gray-900">{job.recruiter.industry}</p>
                  </div>
                )}
                {job.recruiter.companyLocation && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{job.recruiter.companyLocation}</p>
                  </div>
                )}
                {job.recruiter.companyDescription && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">About</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{job.recruiter.companyDescription}</p>
                  </div>
                )}
                {job.recruiter.companyWebsite && (
                  <div>
                    <a 
                      href={job.recruiter.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Visit Company Website
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Application</DialogTitle>
              <DialogDescription>
                Are you sure you want to apply for this position at {job.recruiter.companyName}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Your profile, resume, and application will be sent to the recruiter for review.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                disabled={applying}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApply}
                disabled={applying}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {applying ? 'Submitting...' : 'Confirm & Apply'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
