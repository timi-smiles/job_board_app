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
  SlidersHorizontal, 
  MapPin, 
  DollarSign, 
  Clock,
  Building2,
  TrendingUp,
  Filter,
  X
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface JobListing {
  id: string
  jobTitle: string
  description: string
  employmentType: string
  location?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  recruiter: {
    companyName: string
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('')
  const [minSalary, setMinSalary] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
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

    // Search term filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.jobTitle.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term) ||
          job.recruiter.companyName.toLowerCase().includes(term) ||
          job.location?.toLowerCase().includes(term)
      )
    }

    // Employment type filter
    if (employmentTypeFilter !== 'all') {
      filtered = filtered.filter((job) => job.employmentType === employmentTypeFilter)
    }

    // Location filter
    if (locationFilter.trim() !== '') {
      const locTerm = locationFilter.toLowerCase()
      filtered = filtered.filter((job) => 
        job.location?.toLowerCase().includes(locTerm)
      )
    }

    // Salary filter
    if (minSalary.trim() !== '') {
      const minSal = parseInt(minSalary)
      if (!isNaN(minSal)) {
        filtered = filtered.filter((job) => {
          if (job.salaryMax) {
            return job.salaryMax >= minSal
          }
          if (job.salaryMin) {
            return job.salaryMin >= minSal
          }
          return false
        })
      }
    }

    setFilteredJobs(filtered)
  }, [searchTerm, employmentTypeFilter, locationFilter, minSalary, jobs])

  const clearFilters = () => {
    setSearchTerm('')
    setEmploymentTypeFilter('all')
    setLocationFilter('')
    setMinSalary('')
  }

  const hasActiveFilters = searchTerm !== '' || employmentTypeFilter !== 'all' || locationFilter !== '' || minSalary !== ''

  const getUniqueLocations = () => {
    const locations = jobs
      .map(job => job.location)
      .filter((loc): loc is string => !!loc)
    return Array.from(new Set(locations)).sort()
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse Jobs 🔍</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <p className="text-sm sm:text-base">
                  <span className="font-semibold text-blue-600">{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'job' : 'jobs'} available
                </p>
              </div>
            </div>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filters */}
          <Card className="p-4 sm:p-6 border-2 border-gray-200 mb-6 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 w-full min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder="Search jobs, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 w-full"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`whitespace-nowrap border-2 transition-all ${showFilters ? 'bg-blue-50 border-blue-500 text-blue-600' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-blue-600 text-white text-xs">
                    {[employmentTypeFilter !== 'all', locationFilter !== '', minSalary !== ''].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Employment Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Employment Type
                    </label>
                    <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                        <SelectItem value="PART_TIME">Part-Time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Remote, New York"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>

                  {/* Minimum Salary */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Minimum Salary
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            )}
            </div>
          </Card>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center border-2 border-gray-200 bg-gray-50">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters ? 'Try adjusting your filters to see more results.' : 'Check back soon for new opportunities!'}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700 text-white">
                <X className="w-4 h-4 mr-2" />
                Clear filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-4 sm:p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <Link href={`/dashboard/seeker/jobs/${job.id}`} className="block">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                            {job.jobTitle}
                          </h3>
                          <p className="text-gray-600 font-medium text-sm truncate">{job.recruiter.companyName}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm sm:text-base line-clamp-2 mb-4 leading-relaxed">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {job.employmentType.replace('_', ' ')}
                        </Badge>
                        {job.location && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </Badge>
                        )}
                        {(job.salaryMin || job.salaryMax) && (
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {job.salaryMin && job.salaryMax
                              ? `${job.currency || 'USD'} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                              : job.salaryMin
                              ? `From ${job.currency || 'USD'} ${job.salaryMin.toLocaleString()}`
                              : `Up to ${job.currency || 'USD'} ${job.salaryMax?.toLocaleString()}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="sm:ml-4 self-start w-full sm:w-auto">
                      <div className="px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg font-medium text-sm text-center group-hover:bg-blue-700 transition-colors">
                        View Details →
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
