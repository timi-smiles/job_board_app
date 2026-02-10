'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface JobListing {
  id: string
  jobTitle: string
  description: string
  employmentType: string
  location?: string
  requiredQualifications?: string
  requiredSkills?: string
  salaryMin?: number
  salaryMax?: number
  isActive: boolean
}

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [jobId, setJobId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [jobTitle, setJobTitle] = useState('')
  const [description, setDescription] = useState('')
  const [employmentType, setEmploymentType] = useState('FULL_TIME')
  const [location, setLocation] = useState('')
  const [requiredQualifications, setRequiredQualifications] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params
      setJobId(id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!jobId) return

    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/recruiter/jobs/${jobId}`)
        if (!response.ok) throw new Error('Failed to fetch job')
        const data = await response.json()
        
        const job = data.job
        setJobTitle(job.jobTitle)
        setDescription(job.description)
        setEmploymentType(job.employmentType)
        setLocation(job.location || '')
        setRequiredQualifications(job.requiredQualifications || '')
        setRequiredSkills(job.requiredSkills || '')
        setSalaryMin(job.salaryMin?.toString() || '')
        setSalaryMax(job.salaryMax?.toString() || '')
        setIsActive(job.isActive ?? true)
      } catch (err) {
        setMessage({
          type: 'error',
          text: err instanceof Error ? err.message : 'Failed to load job',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/recruiter/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          description,
          employmentType,
          location,
          requiredQualifications,
          requiredSkills,
          salaryMin: salaryMin ? parseInt(salaryMin) : null,
          salaryMax: salaryMax ? parseInt(salaryMax) : null,
          isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update job')
      }

      setMessage({ type: 'success', text: 'Job listing updated successfully!' })
      
      setTimeout(() => {
        router.push('/dashboard/recruiter/jobs')
      }, 1000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update job',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600">Loading job...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Job Listing</h1>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-900">
                Job Title *
              </Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            {/* Employment Type & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="employmentType" className="text-sm font-medium text-gray-900">
                  Employment Type *
                </Label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                    <SelectItem value="PART_TIME">Part-Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-900">
                  Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-900">
                Job Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                rows={6}
                required
              />
            </div>

            {/* Required Qualifications */}
            <div>
              <Label htmlFor="qualifications" className="text-sm font-medium text-gray-900">
                Required Qualifications
              </Label>
              <Textarea
                id="qualifications"
                value={requiredQualifications}
                onChange={(e) => setRequiredQualifications(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Required Skills */}
            <div>
              <Label htmlFor="skills" className="text-sm font-medium text-gray-900">
                Required Skills
              </Label>
              <Textarea
                id="skills"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="salaryMin" className="text-sm font-medium text-gray-900">
                  Minimum Salary (optional)
                </Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="salaryMax" className="text-sm font-medium text-gray-900">
                  Maximum Salary (optional)
                </Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {saving ? 'Saving...' : 'Save Job Listing'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
