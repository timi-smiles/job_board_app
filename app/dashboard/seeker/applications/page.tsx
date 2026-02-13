'use client'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Briefcase, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  MapPin,
  ArrowRight,
  TrendingUp,
  Award,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { enablePushNotifications } from '@/components/PushNotificationPrompt'
import { Bell } from 'lucide-react'

const POLL_INTERVAL_MS = 15000 // 15 seconds - check for status updates

interface Application {
  id: string
  status: string
  appliedAt: string
  jobListing: {
    id: string
    jobTitle: string
    description: string
    employmentType: string
    location?: string
    recruiter: {
      companyName: string
    }
  }
}

const STATUS_LABELS: Record<string, string> = {
  SHORTLISTED: "You've been shortlisted!",
  REJECTED: 'Application update',
  ACCEPTED: "You've been accepted for an interview!",
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPushPrompt, setShowPushPrompt] = useState(false)
  const previousAppsRef = useRef<Map<string, string>>(new Map())
  const hasShownInitialToastsRef = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      setShowPushPrompt(true)
    }
  }, [])

  const handleEnablePush = async () => {
    const ok = await enablePushNotifications()
    if (ok) {
      setShowPushPrompt(false)
      toast.success('Notifications enabled')
    }
    else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') toast.error('Notifications blocked')
    else toast.error('Could not enable notifications')
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/seeker/applications')
      if (!response.ok) throw new Error('Failed to fetch applications')
      const data = await response.json()
      const apps: Application[] = data.applications || []

      const showToastForApp = (app: Application) => {
        const label = STATUS_LABELS[app.status] || 'Status updated'
        const jobTitle = app.jobListing?.jobTitle || 'Your application'
        const company = app.jobListing?.recruiter?.companyName || ''
        const msg = company ? `${jobTitle} at ${company}` : jobTitle
        if (app.status === 'SHORTLISTED' || app.status === 'ACCEPTED') {
          toast.success(label, { description: msg, duration: 6000 })
        } else if (app.status === 'REJECTED') {
          toast.info(label, { description: msg, duration: 5000 })
        }
      }

      // On first load: show toast for any already-shortlisted/accepted (e.g. user just logged in)
      if (!hasShownInitialToastsRef.current) {
        hasShownInitialToastsRef.current = true
        apps.forEach((app) => {
          previousAppsRef.current.set(app.id, app.status)
          if (app.status === 'SHORTLISTED' || app.status === 'ACCEPTED') {
            showToastForApp(app)
          }
        })
      } else {
        // Polling: detect status changes
        apps.forEach((app) => {
          const prevStatus = previousAppsRef.current.get(app.id)
          if (prevStatus && prevStatus !== app.status) {
            showToastForApp(app)
          }
          previousAppsRef.current.set(app.id, app.status)
        })
      }
      setApplications(apps)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  // Poll for status changes when user has applications page open
  useEffect(() => {
    if (applications.length === 0) return
    const interval = setInterval(fetchApplications, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [applications.length])

  const getStatusConfig = (status: string) => {
    const configs = {
      APPLIED: {
        label: 'Applied',
        icon: Clock,
        className: 'bg-blue-100 text-blue-800',
        description: 'Your application is being reviewed',
      },
      SHORTLISTED: {
        label: 'Shortlisted',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800',
        description: 'Congratulations! You\'ve been shortlisted',
      },
      REJECTED: {
        label: 'Not Selected',
        icon: XCircle,
        className: 'bg-red-100 text-red-800',
        description: 'Unfortunately, you were not selected for this position',
      },
      ACCEPTED: {
        label: 'Interview Scheduled',
        icon: CheckCircle,
        className: 'bg-emerald-100 text-emerald-800',
        description: 'Great news! You\'ve been accepted for an interview',
      },
      WITHDRAWN: {
        label: 'Withdrawn',
        icon: XCircle,
        className: 'bg-gray-100 text-gray-800',
        description: 'Application withdrawn',
      },
    }

    return configs[status as keyof typeof configs] || configs.APPLIED
  }

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status)
    const Icon = config.icon

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const groupApplicationsByStatus = () => {
    const groups = {
      active: applications.filter(app => ['APPLIED', 'SHORTLISTED'].includes(app.status)),
      accepted: applications.filter(app => app.status === 'ACCEPTED'),
      other: applications.filter(app => ['REJECTED', 'WITHDRAWN'].includes(app.status)),
    }
    return groups
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your applications...</p>
        </div>
      </div>
    )
  }

  const { active, accepted, other } = groupApplicationsByStatus()
  const successRate = applications.length > 0 ? Math.round(((active.length + accepted.length) / applications.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Applications 📝</h1>
              <p className="text-gray-600">Track the status of all your job applications</p>
            </div>
            {showPushPrompt && (
              <button
                type="button"
                onClick={handleEnablePush}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium shrink-0"
              >
                <Bell className="w-4 h-4" />
                Enable notifications
              </button>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
            <Card className="p-4 sm:p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{applications.length}</p>
            </Card>

            <Card className="p-4 sm:p-6 border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-600">{active.length}</p>
            </Card>

            <Card className="p-4 sm:p-6 border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Interviews</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{accepted.length}</p>
            </Card>

            <Card className="p-4 sm:p-6 border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">{successRate}%</p>
            </Card>
          </div>

          {applications.length === 0 ? (
            <Card className="p-12 text-center border-2 border-gray-200 bg-gray-50">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-6">Start applying to jobs and track your progress here.</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                <Link href="/dashboard/seeker/jobs">
                  Browse Jobs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Active Applications */}
              {active.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Active Applications ({active.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {active.map((application) => {
                      const statusConfig = getStatusConfig(application.status)
                      return (
                        <Card key={application.id} className="p-4 sm:p-6 border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                                {application.jobListing.jobTitle}
                              </h3>
                              {getStatusBadge(application.status)}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 mb-2">
                              <Building2 className="w-4 h-4 shrink-0" />
                              <span className="truncate">{application.jobListing.recruiter.companyName}</span>
                              {application.jobListing.location && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <MapPin className="w-4 h-4 shrink-0" />
                                  <span>{application.jobListing.location}</span>
                                </>
                              )}
                            </div>

                            <p className="text-sm text-gray-700 mb-3">{statusConfig.description}</p>

                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {application.jobListing.employmentType.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>

                          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto shrink-0">
                            <Link href={`/dashboard/seeker/jobs/${application.jobListing.id}`}>
                              View Job
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Accepted/Interview */}
            {accepted.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Interview Scheduled ({accepted.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {accepted.map((application) => {
                    const statusConfig = getStatusConfig(application.status)
                    return (
                      <Card key={application.id} className="p-4 sm:p-6 border-2 border-green-400 hover:shadow-lg transition-all duration-300 bg-green-50/50">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                                {application.jobListing.jobTitle}
                              </h3>
                              {getStatusBadge(application.status)}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 mb-2">
                              <Building2 className="w-4 h-4 shrink-0" />
                              <span className="truncate">{application.jobListing.recruiter.companyName}</span>
                              {application.jobListing.location && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <MapPin className="w-4 h-4 shrink-0" />
                                  <span>{application.jobListing.location}</span>
                                </>
                              )}
                            </div>

                            <Alert className="mb-3 bg-green-50 border-green-200">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <AlertDescription className="text-green-800">
                                {statusConfig.description}. The recruiter will contact you soon with details.
                              </AlertDescription>
                            </Alert>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto shrink-0">
                            <Link href={`/dashboard/seeker/jobs/${application.jobListing.id}`}>
                              View Job
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Other (Rejected/Withdrawn) */}
            {other.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Past Applications ({other.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {other.map((application) => {
                    const statusConfig = getStatusConfig(application.status)
                    return (
                      <Card key={application.id} className="p-4 sm:p-6 border-2 border-gray-200 hover:shadow-lg transition-all duration-300 bg-gray-50/50">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-700 line-clamp-2">
                                {application.jobListing.jobTitle}
                              </h3>
                              {getStatusBadge(application.status)}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 mb-2">
                              <Building2 className="w-4 h-4 shrink-0" />
                              <span className="truncate">{application.jobListing.recruiter.companyName}</span>
                              {application.jobListing.location && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <MapPin className="w-4 h-4 shrink-0" />
                                  <span>{application.jobListing.location}</span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto shrink-0">
                            <Link href={`/dashboard/seeker/jobs/${application.jobListing.id}`}>
                              View Job
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
