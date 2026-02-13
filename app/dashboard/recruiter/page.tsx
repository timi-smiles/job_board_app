'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  Eye,
  Users,
  AlertCircle,
  Bell,
  Clock,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Building2,
  FileCheck,
  Target,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RecruiterProfile {
  companyName: string
  companyDescription?: string
  industry?: string
  isVerified: boolean
  verificationDocUrl?: string | null
}

interface DashboardStats {
  activeJobs: number
  totalApplications: number
  totalCandidatesViewed: number
  newApplications: number
}

interface RecentApplication {
  id: string
  status: string
  appliedAt: string
  jobSeeker: {
    firstName?: string
    lastName?: string
  }
  jobListing: {
    id: string
    jobTitle: string
  }
}

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function RecruiterDashboard() {
  const [company, setCompany] = useState<RecruiterProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalApplications: 0,
    totalCandidatesViewed: 0,
    newApplications: 0,
  })
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await fetch('/api/recruiter/profile')
        if (!profileResponse.ok) throw new Error('Failed to fetch profile')
        const profileData = await profileResponse.json()
        setCompany(profileData.profile)

        const statsResponse = await fetch('/api/recruiter/stats')
        if (!statsResponse.ok) throw new Error('Failed to fetch stats')
        const statsData = await statsResponse.json()
        setStats(statsData.stats)

        const appsResponse = await fetch('/api/recruiter/applications?limit=5')
        if (appsResponse.ok) {
          const appsData = await appsResponse.json()
          setRecentApplications(appsData.applications.slice(0, 5))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const companyName = company?.companyName || 'Company'
  const companyInitial = companyName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {companyName}! 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {getTimeGreeting()} — Here's what's happening with your hiring
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Verification banner - only show for companies that haven't submitted docs */}
          {!company?.isVerified && !company?.verificationDocUrl && (
            <Card className="mb-6 p-4 sm:p-5 bg-amber-50 border-amber-200 border-2 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">Verify your company</h3>
                    <p className="text-sm text-amber-800 mt-1">
                      Build credibility with job seekers and get more applications.
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 w-full sm:w-auto">
                  <Link href="/dashboard/recruiter/company">Verify now</Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Verification pending - doc submitted, awaiting review */}
          {!company?.isVerified && company?.verificationDocUrl && (
            <Card className="mb-6 p-4 sm:p-5 bg-blue-50 border-blue-200 border-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">Verification pending</h3>
                  <p className="text-sm text-blue-800 mt-0.5">
                    Your documents are under review. We&apos;ll notify you once verification is complete.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* New applications alert */}
          {stats.newApplications > 0 && (
            <Card className="mb-6 p-4 sm:p-5 bg-blue-50 border-2 border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                      {stats.newApplications} new application{stats.newApplications > 1 ? 's' : ''} to review
                    </h3>
                    <p className="text-sm text-blue-800">Don&apos;t keep candidates waiting!</p>
                  </div>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 w-full sm:w-auto">
                  <Link href="/dashboard/recruiter/applications">
                    Review Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="relative p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Live</Badge>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
            </Card>

            <Card className="relative p-6 border-2 border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </Card>

            <Card className="relative p-6 border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-blue-600 text-white text-xs">Action</Badge>
                </div>
                <p className="text-sm text-blue-700 font-medium mb-1">New Applications</p>
                <p className="text-3xl font-bold text-blue-900">{stats.newApplications}</p>
              </div>
            </Card>

            <Card className="relative p-6 border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">Candidates Viewed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCandidatesViewed}</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent applications */}
            <Card className="lg:col-span-2 p-6 border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
                </div>
                <Button asChild variant="outline" size="sm" className="border-2 hover:bg-blue-50 hover:border-blue-200">
                  <Link href="/dashboard/recruiter/applications">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {recentApplications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No applications yet</p>
                  <p className="text-sm text-gray-500 mt-1">Post jobs to start receiving applications</p>
                  <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/dashboard/recruiter/jobs/new">Post a Job</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {app.jobSeeker.firstName && app.jobSeeker.lastName
                            ? `${app.jobSeeker.firstName} ${app.jobSeeker.lastName}`
                            : 'New Candidate'}
                        </p>
                        <p className="text-sm text-gray-600 truncate">Applied for {app.jobListing.jobTitle}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {app.status === 'APPLIED' && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Clock className="w-3 h-3 mr-1" />
                            New
                          </Badge>
                        )}
                        {app.status === 'SHORTLISTED' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Reviewed
                          </Badge>
                        )}
                        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Link href="/dashboard/recruiter/applications">View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Company & quick actions */}
            <div className="space-y-6">
              <Card className="p-6 border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="text-center mb-5">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-lg">
                    {companyInitial}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{companyName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{company?.industry || 'Recruiter'}</p>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={
                      company?.isVerified ? 'bg-green-100 text-green-700' 
                      : company?.verificationDocUrl ? 'bg-blue-100 text-blue-700' 
                      : 'bg-amber-100 text-amber-700'
                    }>
                      {company?.isVerified ? '✓ Verified' : company?.verificationDocUrl ? 'Verification pending' : 'Not verified'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Active Jobs</span>
                    <Badge variant="secondary">{stats.activeJobs}</Badge>
                  </div>
                </div>

                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/dashboard/recruiter/company">
                    Edit Company <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </Card>

              <Card className="p-6 border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900">Quick Actions</h4>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Button asChild className="h-auto py-4 bg-blue-600 hover:bg-blue-700 text-white group">
                    <Link href="/dashboard/recruiter/jobs/new" className="flex flex-col items-start gap-2">
                      <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="font-semibold">Post New Job</div>
                        <div className="text-xs opacity-90">Reach more candidates</div>
                      </div>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 border-2 hover:border-blue-500 hover:bg-blue-50 group">
                    <Link href="/dashboard/recruiter/candidates" className="flex flex-col items-start gap-2">
                      <Users className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Find Candidates</div>
                        <div className="text-xs text-gray-600">Search talent pool</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6 border-2 border-gray-200 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Pro Tip</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {stats.newApplications > 0
                        ? 'Review new applications within 24 hours to improve your response rate and candidate experience.'
                        : 'Keep your job listings active and detailed to attract more qualified applicants.'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
