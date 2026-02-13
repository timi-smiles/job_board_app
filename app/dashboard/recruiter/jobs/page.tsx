'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link as LinkIcon, Eye, Edit, Trash2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface JobListing {
  id: string
  jobTitle: string
  description: string
  employmentType: string
  location?: string
  isActive: boolean
  createdAt: string
  _count?: {
    applications: number
  }
}

export default function JobListingsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/recruiter/jobs')
        if (!response.ok) throw new Error('Failed to fetch jobs')
        const data = await response.json()
        setJobs(data.jobs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      const response = await fetch(`/api/recruiter/jobs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete job')

      setJobs(jobs.filter(j => j.id !== id))
      alert('Job deleted successfully')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete job')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/recruiter/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) throw new Error('Failed to update job')

      setJobs(jobs.map(j => j.id === id ? { ...j, isActive: !isActive } : j))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update job')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading job listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Job Listings</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your open positions</p>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
              <Link href="/dashboard/recruiter/jobs/new">Create New Job</Link>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {jobs.length === 0 ? (
            <Card className="p-12 text-center border-2 border-gray-200 bg-white">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No job listings yet</h3>
              <p className="text-gray-600 mb-6">Create your first job to start receiving applications.</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/dashboard/recruiter/jobs/new">Create Your First Job</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="p-4 sm:p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{job.jobTitle}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 text-sm">
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium text-gray-900">{job.employmentType}</p>
                      </div>
                      {job.location && (
                        <div>
                          <p className="text-gray-600">Location</p>
                          <p className="font-medium text-gray-900">{job.location}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600">Applications</p>
                        <p className="font-medium text-gray-900">{job._count?.applications || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className={`font-medium ${job.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                      onClick={() => handleToggleActive(job.id, job.isActive)}
                      variant="outline"
                      size="sm"
                      title={job.isActive ? 'Deactivate' : 'Activate'}
                      className="border-2 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href={`/dashboard/recruiter/jobs/${job.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      onClick={() => handleDelete(job.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
