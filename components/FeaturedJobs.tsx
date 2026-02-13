'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Building2, MapPin, DollarSign, ArrowRight } from 'lucide-react'

interface Job {
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

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.ok ? res.json() : { jobs: [] })
      .then((data) => {
        setJobs((data.jobs || []).slice(0, 6))
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Featured Jobs</h2>
            <p className="text-gray-600">Loading opportunities...</p>
          </div>
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  if (jobs.length === 0) return null

  return (
    <section id="jobs" className="py-12 sm:py-16 md:py-24 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Featured Jobs</h2>
            <p className="text-gray-600">Explore opportunities. Sign up to apply.</p>
          </div>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            <Link href="/jobs">
              View all jobs <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="h-full p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {job.jobTitle}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 shrink-0" />
                  {job.recruiter.companyName}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {job.employmentType.replace('_', ' ')}
                  </Badge>
                  {job.location && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                  )}
                </div>
                {(job.salaryMin || job.salaryMax) && (
                  <p className="text-sm text-gray-600 mt-3 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {job.salaryMin && job.salaryMax
                      ? `${job.currency || 'USD'} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                      : job.salaryMin
                      ? `From ${job.currency || 'USD'} ${job.salaryMin.toLocaleString()}`
                      : `Up to ${job.currency || 'USD'} ${job.salaryMax?.toLocaleString()}`}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/jobs">Browse all jobs</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
