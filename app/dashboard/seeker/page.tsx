'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, FileText, Trophy, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface JobSeekerProfile {
  firstName?: string
  lastName?: string
  summary?: string
  yearsOfExperience?: number
  cvUrl?: string
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
      <div className="p-8">
        <div className="text-gray-600">Loading your dashboard...</div>
      </div>
    )
  }

  const fullName = profile?.firstName || profile?.lastName
    ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
    : 'User'

  const isProfileIncomplete = !profile?.summary || !profile?.yearsOfExperience

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {fullName}</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your job search</p>
        </div>

        {/* Alerts */}
        {isProfileIncomplete && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Complete your profile to improve your chances of getting hired.{' '}
              <Link href="/dashboard/seeker/profile" className="font-semibold underline">
                Update profile
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.applied}</p>
              </div>
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
          </Card>

          <Card className="p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Shortlisted</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.shortlisted}</p>
              </div>
              <Trophy className="w-12 h-12 text-gray-400" />
            </div>
          </Card>

          <Card className="p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Profile Completion</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {profile?.summary && profile?.yearsOfExperience ? '100' : '50'}%
                </p>
              </div>
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/dashboard/seeker/profile">
                  <User className="w-4 h-4 mr-2" />
                  Update Your Profile
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/dashboard/seeker/jobs">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Open Positions
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{fullName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600">Experience</p>
                <p className="font-medium text-gray-900">
                  {profile?.yearsOfExperience ? `${profile.yearsOfExperience} years` : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">CV</p>
                <p className="font-medium text-gray-900">
                  {profile?.cvUrl ? 'Uploaded' : 'Not uploaded'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { User } from 'lucide-react'
