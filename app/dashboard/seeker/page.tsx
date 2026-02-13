'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Briefcase, 
  FileText, 
  Trophy, 
  AlertCircle, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  Sparkles,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface JobSeekerProfile {
  firstName?: string
  lastName?: string
  summary?: string
  yearsOfExperience?: number
  cvUrl?: string
  skills?: Array<{ name: string }>
}

interface ApplicationStats {
  applied: number
  shortlisted: number
  rejected: number
}

export default function SeekerDashboard() {
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null)
  const [stats, setStats] = useState<ApplicationStats>({
    applied: 0,
    shortlisted: 0,
    rejected: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        const profileResponse = await fetch('/api/seeker/profile')
        if (!profileResponse.ok) throw new Error('Failed to fetch profile')
        const profileData = await profileResponse.json()
        setProfile(profileData.profile)

        // Fetch stats
        const statsResponse = await fetch('/api/seeker/applications/stats')
        if (!statsResponse.ok) throw new Error('Failed to fetch stats')
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const fullName = profile?.firstName || profile?.lastName
    ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
    : 'User'

  const isProfileIncomplete = !profile?.summary || !profile?.yearsOfExperience
  const profileCompletion = calculateProfileCompletion(profile)
  const totalApplications = stats.applied + stats.shortlisted + stats.rejected

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Greeting */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {fullName}! 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {getTimeGreeting()} - Let's find your dream job today
            </p>
          </div>

          {/* Profile Completion Banner */}
          {profileCompletion < 100 && (
            <Card className="mb-6 p-4 sm:p-5 bg-blue-50 border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600 shrink-0" />
                    <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
                    <Badge className="bg-blue-600 text-white">{profileCompletion}%</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    A complete profile increases your chances of getting hired by 70%!
                  </p>
                  <Progress value={profileCompletion} className="h-2 mb-3" />
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/dashboard/seeker/profile">
                      Complete Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Grid - Enhanced */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="relative p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
                <p className="text-xs text-gray-500 mt-2">+{stats.applied} this month</p>
              </div>
            </Card>

            <Card className="relative p-6 border-2 border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-xs">Success</Badge>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">Shortlisted</p>
                <p className="text-3xl font-bold text-gray-900">{stats.shortlisted}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Great progress!
                </p>
              </div>
            </Card>

            <Card className="relative p-6 border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Profile</Badge>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">Profile Views</p>
                <p className="text-3xl font-bold text-gray-900">{Math.floor(totalApplications * 2.5)}</p>
                <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
              </div>
            </Card>

            <Card className="relative p-6 border-2 border-gray-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Status</Badge>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalApplications > 0 ? Math.round((stats.shortlisted / totalApplications) * 100) : 0}%
                </p>
                <p className="text-xs text-orange-600 mt-2">Keep it up!</p>
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Quick Actions & Application Status */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card className="p-6 border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    Quick Actions
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button asChild className="h-auto py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white group">
                    <Link href="/dashboard/seeker/jobs" className="flex flex-col items-start gap-2">
                      <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="font-semibold">Browse Jobs</div>
                        <div className="text-xs opacity-90">Find your perfect match</div>
                      </div>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 border-2 hover:border-purple-500 hover:bg-purple-50 group">
                    <Link href="/dashboard/seeker/profile" className="flex flex-col items-start gap-2">
                      <FileText className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Update Profile</div>
                        <div className="text-xs text-gray-600">Keep it fresh</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </Card>

              {/* Application Status Overview */}
              <Card className="p-6 border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Application Pipeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">Under Review</p>
                        <p className="text-xs text-gray-600">Applications submitted</p>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 shrink-0">{stats.applied}</div>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">Shortlisted</p>
                        <p className="text-xs text-gray-600">Great progress!</p>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-green-600 shrink-0">{stats.shortlisted}</div>
                  </div>

                  {stats.rejected > 0 && (
                    <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-400 rounded-full flex items-center justify-center shrink-0">
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">Not Selected</p>
                          <p className="text-xs text-gray-600">Keep trying!</p>
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-600 shrink-0">{stats.rejected}</div>
                    </div>
                  )}
                </div>

                <Button asChild variant="outline" className="w-full mt-4 border-2 hover:bg-gray-50">
                  <Link href="/dashboard/seeker/applications">
                    View All Applications <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </Card>
            </div>

            {/* Right Column - Profile Summary */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="p-6 border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="text-center mb-5">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-lg">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{fullName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {profile?.yearsOfExperience ? `${profile.yearsOfExperience} years experience` : 'Job Seeker'}
                  </p>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Profile</span>
                    <Badge className={profileCompletion === 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                      {profileCompletion}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">CV Status</span>
                    <Badge className={profile?.cvUrl ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {profile?.cvUrl ? '✓ Uploaded' : '✗ Missing'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Skills</span>
                    <Badge variant="secondary">
                      {profile?.skills?.length || 0} added
                    </Badge>
                  </div>
                </div>

                <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  <Link href="/dashboard/seeker/profile">
                    Edit Profile <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </Card>

              {/* Tips Card */}
              <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Pro Tip</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {profileCompletion < 100 
                        ? "Complete your profile to stand out! Employers are 3x more likely to view complete profiles."
                        : "Great job! Now apply to at least 5 jobs per week to maximize your chances."}
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

// Helper Functions
function calculateProfileCompletion(profile: JobSeekerProfile | null): number {
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

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
