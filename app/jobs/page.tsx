'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import HeaderNav from '@/components/HeaderNav'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface JobListing {
  id: string
  jobTitle: string
  description: string
  employmentType: string
  location?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  recruiter: { companyName: string }
}

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs')
        if (!response.ok) throw new Error('Failed to fetch jobs')
        const data = await response.json()
        setJobs(data.jobs)
        setFilteredJobs(data.jobs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  useEffect(() => {
    let filtered = jobs
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.jobTitle.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term) ||
          job.recruiter.companyName.toLowerCase().includes(term) ||
          job.location?.toLowerCase().includes(term)
      )
    }
    if (employmentTypeFilter !== 'all') {
      filtered = filtered.filter((job) => job.employmentType === employmentTypeFilter)
    }
    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase()
      filtered = filtered.filter((job) => job.location?.toLowerCase().includes(loc))
    }
    setFilteredJobs(filtered)
  }, [searchTerm, employmentTypeFilter, locationFilter, jobs])

  const getUniqueLocations = () => {
    const locs = jobs.map((j) => j.location).filter((l): l is string => !!l)
    return Array.from(new Set(locs)).sort()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <HeaderNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-600">Find opportunities that match your skills. Sign up to apply.</p>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6 border-2 border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search jobs, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="FULL_TIME">Full-time</SelectItem>
                <SelectItem value="PART_TIME">Part-time</SelectItem>
                <SelectItem value="CONTRACT">Contract</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter || 'all'} onValueChange={(v) => setLocationFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {getUniqueLocations().map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="p-12 text-center border-2 border-gray-200">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="p-4 sm:p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {job.jobTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.recruiter.companyName}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                        )}
                        <Badge variant="secondary">{job.employmentType.replace('_', ' ')}</Badge>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salaryMin && job.salaryMax
                              ? `${job.currency || 'USD'} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                              : job.salaryMin
                              ? `From ${job.currency || 'USD'} ${job.salaryMin.toLocaleString()}`
                              : `Up to ${job.currency || 'USD'} ${job.salaryMax?.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="sm:shrink-0">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm group-hover:bg-blue-700 transition-colors">
                        View details <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-3">Ready to apply? Create an account and complete your profile.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/auth/register">Sign up free</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
