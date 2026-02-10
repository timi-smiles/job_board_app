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
      <div className="p-8">
        <div className="text-gray-600">Loading job listings...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
          <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
            <Link href="/dashboard/recruiter/jobs/new">Create New Job</Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {jobs.length === 0 ? (
          <Card className="p-12 text-center border border-gray-200">
            <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">You haven't created any job listings yet.</p>
            <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
              <Link href="/dashboard/recruiter/jobs/new">Create Your First Job</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{job.jobTitle}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{job.description}</p>
                    <div className="flex gap-6 mt-4 text-sm">
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
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleToggleActive(job.id, job.isActive)}
                      variant="outline"
                      size="sm"
                      title={job.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link href={`/dashboard/recruiter/jobs/${job.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      onClick={() => handleDelete(job.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
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
  )
}
