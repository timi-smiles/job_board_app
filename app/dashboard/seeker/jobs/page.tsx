'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Search, Briefcase } from 'lucide-react'

interface JobListing {
  id: string
  jobTitle: string
  description: string
  employmentType: string
  location?: string
  recruiter: {
    companyName: string
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([])
  const [searchTerm, setSearchTerm] = useState('')
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
    if (searchTerm.trim() === '') {
      setFilteredJobs(jobs)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredJobs(
        jobs.filter(
          (job) =>
            job.jobTitle.toLowerCase().includes(term) ||
            job.description.toLowerCase().includes(term) ||
            job.recruiter.companyName.toLowerCase().includes(term)
        )
      )
    }
  }, [searchTerm, jobs])

  const handleApply = async (jobId: string) => {
    try {
      const response = await fetch('/api/seeker/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobListingId: jobId }),
      })

      if (!response.ok) throw new Error('Failed to apply')

      alert('Application submitted!')
      // Refresh the page
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to apply for job')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Jobs</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search jobs by title, description, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center border border-gray-200">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No jobs found matching your search.' : 'No jobs available at the moment.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-6 border border-gray-200 hover:border-gray-300 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{job.jobTitle}</h3>
                    <p className="text-gray-600 text-sm mt-1">{job.recruiter.companyName}</p>
                    <p className="text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                    <div className="flex gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="text-sm font-medium text-gray-900">{job.employmentType}</p>
                      </div>
                      {job.location && (
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-900">{job.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleApply(job.id)}
                    className="ml-4 bg-gray-900 hover:bg-gray-800 text-white whitespace-nowrap"
                  >
                    Apply Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
