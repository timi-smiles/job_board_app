'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Upload, FileText, Shield, Clock, CheckCircle2 } from 'lucide-react'

interface RecruiterProfile {
  id: string
  companyName: string
  companyDescription?: string
  industry?: string
  companyWebsite?: string
  companyLocation?: string
  isVerified: boolean
  verificationDocUrl?: string
}

const profileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name must be less than 100 characters'),
  companyDescription: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  industry: z.string().max(50, 'Industry must be less than 50 characters').optional(),
  companyWebsite: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  companyLocation: z.string().max(100, 'Location must be less than 100 characters').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<RecruiterProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/recruiter/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        const data = await response.json()
        
        const p = data.profile
        setProfile(p)
        reset({
          companyName: p.companyName || '',
          companyDescription: p.companyDescription || '',
          industry: p.industry || '',
          companyWebsite: p.companyWebsite || '',
          companyLocation: p.companyLocation || '',
        })
      } catch (err) {
        setMessage({
          type: 'error',
          text: err instanceof Error ? err.message : 'Failed to load profile',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [reset])

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/recruiter/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update profile')

      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUploadVerification = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 10MB' })
      return
    }

    setUploading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/recruiter/verify', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload verification document')

      setMessage({ type: 'success', text: 'Verification document uploaded successfully! We will review it shortly.' })
      
      // Refresh profile
      const profileResponse = await fetch('/api/recruiter/profile')
      const profileData = await profileResponse.json()
      setProfile(profileData.profile)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload document',
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Profile</h1>

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

        {/* Company Information */}
        <Card className="p-6 border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="companyName" className="text-sm font-medium text-gray-900">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  {...register('companyName')}
                  className={`mt-1 ${errors.companyName ? 'border-red-500' : ''}`}
                  placeholder="Your Company Name"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="industry" className="text-sm font-medium text-gray-900">
                  Industry
                </Label>
                <Input
                  id="industry"
                  {...register('industry')}
                  className={`mt-1 ${errors.industry ? 'border-red-500' : ''}`}
                  placeholder="Technology"
                />
                {errors.industry && (
                  <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="website" className="text-sm font-medium text-gray-900">
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  {...register('companyWebsite')}
                  className={`mt-1 ${errors.companyWebsite ? 'border-red-500' : ''}`}
                  placeholder="https://example.com"
                />
                {errors.companyWebsite && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyWebsite.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-900">
                  Location
                </Label>
                <Input
                  id="location"
                  {...register('companyLocation')}
                  className={`mt-1 ${errors.companyLocation ? 'border-red-500' : ''}`}
                  placeholder="San Francisco, CA"
                />
                {errors.companyLocation && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyLocation.message}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="description" className="text-sm font-medium text-gray-900">
                Company Description
              </Label>
              <Textarea
                id="description"
                {...register('companyDescription')}
                className={`mt-1 ${errors.companyDescription ? 'border-red-500' : ''}`}
                placeholder="Tell us about your company..."
                rows={4}
              />
              {errors.companyDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.companyDescription.message}</p>
              )}
            </div>

            <Button type="submit" disabled={saving} className="bg-gray-900 hover:bg-gray-800 text-white">
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </Card>

        {/* Verification */}
        <Card className="p-8 border border-gray-200 bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              profile?.isVerified ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <Shield className={`w-6 h-6 ${
                profile?.isVerified ? 'text-green-600' : 'text-yellow-600'
              }`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Company Verification</h2>
              <p className="text-sm text-gray-600">Verify your company to build trust</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              profile?.isVerified 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : profile?.verificationDocUrl 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {profile?.isVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold text-sm">Verified Company</span>
                </>
              ) : profile?.verificationDocUrl ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-sm">Verification Pending</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold text-sm">Not Verified</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Required Documents</p>
                  <p className="text-sm text-blue-700">
                    Upload your company verification document such as CAC certificate, business license, 
                    tax registration, or incorporation certificate.
                  </p>
                </div>
              </div>
            </div>

            {profile?.isVerified ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Your Company is Verified!
                </h3>
                <p className="text-sm text-green-700">
                  Job seekers will see a verified badge on your job listings.
                </p>
              </div>
            ) : profile?.verificationDocUrl ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full flex-shrink-0">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-yellow-900 mb-2">
                      Document Under Review
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Your verification document has been received and is currently being reviewed by our team. 
                      This typically takes 1-3 business days.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-yellow-800">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Document uploaded successfully</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors bg-white">
                <input
                  type="file"
                  id="verification"
                  onChange={handleUploadVerification}
                  disabled={uploading}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Label htmlFor="verification" className="cursor-pointer">
                  <div className="space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-2">
                      <Upload className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900 mb-1">
                        {uploading ? 'Uploading...' : 'Upload Verification Document'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Click to browse or drag and drop your file here
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                    </div>
                  </div>
                </Label>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
