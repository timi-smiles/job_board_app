'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, Eye, Users, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RecruiterProfile {
  companyName: string
  companyDescription?: string
  industry?: string
  isVerified: boolean
}

interface DashboardStats {
  activeJobs: number
  totalApplications: number
  totalCandidatesViewed: number
}

export default function RecruiterDashboard() {
  const [company, setCompany] = useState<RecruiterProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalApplications: 0,
    totalCandidatesViewed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch company profile
        const profileResponse = await fetch('/api/recruiter/profile')
        if (!profileResponse.ok) throw new Error('Failed to fetch profile')
        const profileData = await profileResponse.json()
        setCompany(profileData.profile)

        // Fetch stats
        const statsResponse = await fetch('/api/recruiter/stats')
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

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">{company?.companyName || 'Company'} - Recruiter Dashboard</p>
        </div>

        {/* Alerts */}
        {!company?.isVerified && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Verify your company to build credibility with job seekers.{' '}
              <Link href="/dashboard/recruiter/company" className="font-semibold underline">
                Verify now
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
                <p className="text-sm text-gray-600 font-medium">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeJobs}</p>
              </div>
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
          </Card>

          <Card className="p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalApplications}</p>
              </div>
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
          </Card>

          <Card className="p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Candidates Viewed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCandidatesViewed}</p>
              </div>
              <Users className="w-12 h-12 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/dashboard/recruiter/jobs/new">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Create New Job Listing
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/dashboard/recruiter/candidates">
                  <Users className="w-4 h-4 mr-2" />
                  Search for Candidates
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/dashboard/recruiter/company">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Update Company Profile
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Company Name</p>
                <p className="font-medium text-gray-900">{company?.companyName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600">Industry</p>
                <p className="font-medium text-gray-900">{company?.industry || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600">Verification Status</p>
                <p className="font-medium text-gray-900">
                  {company?.isVerified ? '✓ Verified' : '○ Pending Verification'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
