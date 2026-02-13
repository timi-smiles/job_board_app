'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Briefcase, MapPin, DollarSign, FileText, GraduationCap, Wrench } from 'lucide-react'

const jobSchema = z.object({
  jobTitle: z.string().min(3, 'Job title must be at least 3 characters').max(100, 'Job title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description must be less than 5000 characters'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
  location: z.string().optional(),
  requiredQualifications: z.string().optional(),
  requiredSkills: z.string().optional(),
  salaryMin: z.coerce.number().positive('Minimum salary must be positive').optional().or(z.literal('')),
  salaryMax: z.coerce.number().positive('Maximum salary must be positive').optional().or(z.literal('')),
}).refine((data) => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMax >= data.salaryMin
  }
  return true
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryMax'],
})

type JobFormData = z.infer<typeof jobSchema>

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      employmentType: 'FULL_TIME',
    },
  })

  const employmentType = watch('employmentType')

  const onSubmit = async (data: JobFormData) => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: data.jobTitle,
          description: data.description,
          employmentType: data.employmentType,
          location: data.location || null,
          requiredQualifications: data.requiredQualifications || null,
          requiredSkills: data.requiredSkills || null,
          salaryMin: data.salaryMin || null,
          salaryMax: data.salaryMax || null,
        }),
      })

      if (!response.ok) {
        const responseData = await response.json()
        throw new Error(responseData.error || 'Failed to create job')
      }

      setMessage({ type: 'success', text: 'Job listing created successfully!' })
      
      // Redirect to jobs page after a short delay
      setTimeout(() => {
        router.push('/dashboard/recruiter/jobs')
      }, 1000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to create job',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Job Listing</h1>
              <p className="text-gray-600 text-sm mt-0.5">Fill in the details below to post a new job opportunity</p>
            </div>
          </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6 shadow-md">
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Card className="p-4 sm:p-8 border-2 border-gray-200 hover:border-blue-200 transition-colors bg-white rounded-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Job Title Section */}
            <div className="space-y-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Job Information</h2>
              </div>
              <div>
                <Label htmlFor="jobTitle" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  Job Title *
                </Label>
                <Input
                  id="jobTitle"
                  {...register('jobTitle')}
                  className={`mt-2 h-12 text-base ${errors.jobTitle ? 'border-red-500 focus:ring-red-500' : 'focus:ring-gray-900'}`}
                  placeholder="e.g., Senior Frontend Developer"
                />
                {errors.jobTitle && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>
            </div>

            {/* Employment Type & Location */}
            <div className="space-y-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Location & Type</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="employmentType" className="text-sm font-semibold text-gray-900">
                    Employment Type *
                  </Label>
                  <Select value={employmentType} onValueChange={(value) => setValue('employmentType', value as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT')}>
                    <SelectTrigger className={`mt-2 h-12 ${errors.employmentType ? 'border-red-500' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                      <SelectItem value="PART_TIME">Part-Time</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.employmentType && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.employmentType.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-900">
                    Location
                  </Label>
                  <Input
                    id="location"
                    {...register('location')}
                    className={`mt-2 h-12 ${errors.location ? 'border-red-500' : ''}`}
                    placeholder="e.g., San Francisco, CA or Remote"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  className={`mt-2 text-base ${errors.description ? 'border-red-500' : 'focus:ring-gray-900'}`}
                  placeholder="Describe the role, responsibilities, team environment, and what you're looking for in an ideal candidate..."
                  rows={6}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Qualifications & Skills */}
            <div className="space-y-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="qualifications" className="text-sm font-semibold text-gray-900">
                    Required Qualifications
                  </Label>
                  <Textarea
                    id="qualifications"
                    {...register('requiredQualifications')}
                    className={`mt-2 ${errors.requiredQualifications ? 'border-red-500' : ''}`}
                    placeholder="e.g., Bachelor's degree in Computer Science&#10;5+ years of professional experience&#10;Strong portfolio of web applications"
                    rows={4}
                  />
                  {errors.requiredQualifications && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.requiredQualifications.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="skills" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Required Skills
                  </Label>
                  <Textarea
                    id="skills"
                    {...register('requiredSkills')}
                    className={`mt-2 ${errors.requiredSkills ? 'border-red-500' : ''}`}
                    placeholder="e.g., React, TypeScript, Node.js&#10;REST APIs, GraphQL&#10;Git, CI/CD, Docker"
                    rows={4}
                  />
                  {errors.requiredSkills && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.requiredSkills.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Salary */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Compensation</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="salaryMin" className="text-sm font-semibold text-gray-900">
                    Minimum Salary
                  </Label>
                  <div className="relative mt-2">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="salaryMin"
                      type="number"
                      {...register('salaryMin')}
                      className={`h-12 pl-8 ${errors.salaryMin ? 'border-red-500' : ''}`}
                      placeholder="50000"
                    />
                  </div>
                  {errors.salaryMin && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.salaryMin.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="salaryMax" className="text-sm font-semibold text-gray-900">
                    Maximum Salary
                  </Label>
                  <div className="relative mt-2">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="salaryMax"
                      type="number"
                      {...register('salaryMax')}
                      className={`h-12 pl-8 ${errors.salaryMax ? 'border-red-500' : ''}`}
                      placeholder="120000"
                    />
                  </div>
                  {errors.salaryMax && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.salaryMax.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Briefcase className="w-5 h-5 mr-2" />
                    Create Job Listing
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-8 h-12 font-semibold border-2 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
        </div>
      </div>
    </div>
  )
}
