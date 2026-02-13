'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award,
  FileText,
  Save,
  Sparkles
} from 'lucide-react'

interface Education {
  id: string
  qualification: string
  institution?: string
  completionYear?: number
}

interface Skill {
  id: string
  name: string
  proficiency?: string
}

interface Certification {
  id: string
  name: string
  issuer?: string
  issueDate?: string
  expiryDate?: string
}

interface JobSeekerProfile {
  id: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  summary?: string
  location?: string
  yearsOfExperience?: number
  cvUrl?: string
  educations: Education[]
  skills: Skill[]
  certifications: Certification[]
}

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters').optional().or(z.literal('')),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters').optional().or(z.literal('')),
  phoneNumber: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  summary: z.string().max(1000, 'Summary must be less than 1000 characters').optional().or(z.literal('')),
  location: z.string().max(100, 'Location must be less than 100 characters').optional().or(z.literal('')),
  yearsOfExperience: z.coerce.number().min(0, 'Years of experience must be 0 or greater').max(50, 'Years of experience must be less than 50').optional().or(z.literal('')),
})

const educationSchema = z.object({
  qualification: z.string().min(2, 'Qualification must be at least 2 characters').max(100, 'Qualification must be less than 100 characters'),
  institution: z.string().max(100, 'Institution must be less than 100 characters').optional().or(z.literal('')),
  completionYear: z.coerce.number().min(1950, 'Year must be 1950 or later').max(new Date().getFullYear() + 10, 'Year cannot be too far in the future').optional().or(z.literal('')),
})

const skillSchema = z.object({
  name: z.string().min(2, 'Skill name must be at least 2 characters').max(50, 'Skill name must be less than 50 characters'),
  proficiency: z.string().max(50, 'Proficiency must be less than 50 characters').optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>
type EducationFormData = z.infer<typeof educationSchema>
type SkillFormData = z.infer<typeof skillSchema>

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Sections state
  const [educations, setEducations] = useState<Education[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  
  // New item forms
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: ''
  })

  // Main profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // Education form
  const {
    register: registerEducation,
    handleSubmit: handleSubmitEducation,
    reset: resetEducation,
    formState: { errors: educationErrors },
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
  })

  // Skill form
  const {
    register: registerSkill,
    handleSubmit: handleSubmitSkill,
    reset: resetSkill,
    formState: { errors: skillErrors },
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/seeker/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        const data = await response.json()
        
        const p = data.profile
        setProfile(p)
        resetProfile({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phoneNumber: p.phoneNumber || '',
          summary: p.summary || '',
          location: p.location || '',
          yearsOfExperience: p.yearsOfExperience?.toString() || '',
        })
        setEducations(p.educations || [])
        setSkills(p.skills || [])
        setCertifications(p.certifications || [])
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
  }, [resetProfile])

  const onSubmitProfile = async (data: ProfileFormData) => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/seeker/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          phoneNumber: data.phoneNumber || null,
          summary: data.summary || null,
          location: data.location || null,
          yearsOfExperience: data.yearsOfExperience || null,
        }),
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

  const onSubmitEducation = async (data: EducationFormData) => {
    try {
      const response = await fetch('/api/seeker/educations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qualification: data.qualification,
          institution: data.institution || null,
          completionYear: data.completionYear || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to add education')

      const responseData = await response.json()
      setEducations([...educations, responseData.education])
      resetEducation()
      setMessage({ type: 'success', text: 'Education added' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to add education',
      })
    }
  }

  const handleDeleteEducation = async (id: string) => {
    try {
      const response = await fetch(`/api/seeker/educations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete education')

      setEducations(educations.filter(e => e.id !== id))
      setMessage({ type: 'success', text: 'Education removed' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete education',
      })
    }
  }

  const onSubmitSkill = async (data: SkillFormData) => {
    try {
      const response = await fetch('/api/seeker/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          proficiency: data.proficiency || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to add skill')

      const responseData = await response.json()
      setSkills([...skills, responseData.skill])
      resetSkill()
      setMessage({ type: 'success', text: 'Skill added' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to add skill',
      })
    }
  }

  const handleDeleteSkill = async (id: string) => {
    try {
      const response = await fetch(`/api/seeker/skills/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete skill')

      setSkills(skills.filter(s => s.id !== id))
      setMessage({ type: 'success', text: 'Skill removed' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete skill',
      })
    }
  }

  const calculateProfileCompletion = () => {
    let completion = 0
    if (profile?.firstName) completion += 10
    if (profile?.lastName) completion += 10
    if (profile?.phoneNumber) completion += 10
    if (profile?.location) completion += 10
    if (profile?.yearsOfExperience) completion += 10
    if (profile?.summary) completion += 15
    if (educations.length > 0) completion += 15
    if (skills.length > 0) completion += 10
    if (certifications.length > 0) completion += 10
    return completion
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const completion = calculateProfileCompletion()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {jobId && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                Complete your profile to apply for jobs.{' '}
                <Link href={`/jobs/${jobId}`} className="font-medium text-blue-600 hover:underline">
                  Back to job
                </Link>
              </AlertDescription>
            </Alert>
          )}
          {/* Header with Progress */}
          <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your professional information</p>
            </div>
            <Card className="p-4 bg-blue-50 border-blue-200 w-full sm:w-auto sm:min-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Profile Strength</p>
                    <p className="text-2xl font-bold text-gray-900">{completion}%</p>
                  </div>
                </div>
                <Progress value={completion} className="h-2 mt-3" />
              </Card>
            </div>
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6 border-2">
              {message.type === 'error' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <AlertDescription className="font-medium">{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card className="p-6 border-2 border-gray-200 mb-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            </div>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-900">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  {...registerProfile('firstName')}
                  className={`mt-1 ${profileErrors.firstName ? 'border-red-500' : ''}`}
                  placeholder="John"
                />
                {profileErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-900">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  {...registerProfile('lastName')}
                  className={`mt-1 ${profileErrors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Doe"
                />
                {profileErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.lastName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-900">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  {...registerProfile('phoneNumber')}
                  className={`mt-1 ${profileErrors.phoneNumber ? 'border-red-500' : ''}`}
                  placeholder="+1 (555) 000-0000"
                />
                {profileErrors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.phoneNumber.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-900">
                  Location
                </Label>
                <Input
                  id="location"
                  {...registerProfile('location')}
                  className={`mt-1 ${profileErrors.location ? 'border-red-500' : ''}`}
                  placeholder="San Francisco, CA"
                />
                {profileErrors.location && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.location.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="experience" className="text-sm font-medium text-gray-900">
                  Years of Experience
                </Label>
                <Input
                  id="experience"
                  type="number"
                  {...registerProfile('yearsOfExperience')}
                  className={`mt-1 ${profileErrors.yearsOfExperience ? 'border-red-500' : ''}`}
                  placeholder="5"
                />
                {profileErrors.yearsOfExperience && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.yearsOfExperience.message}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="summary" className="text-sm font-medium text-gray-900">
                Professional Summary
              </Label>
              <Textarea
                id="summary"
                {...registerProfile('summary')}
                className={`mt-1 ${profileErrors.summary ? 'border-red-500' : ''}`}
                placeholder="Tell recruiters about yourself..."
                rows={4}
              />
              {profileErrors.summary && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.summary.message}</p>
              )}
            </div>

            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>

        {/* Education */}
        <Card className="p-6 border-2 border-gray-200 mb-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Education</h2>
            <Badge variant="secondary" className="ml-auto">{educations.length} added</Badge>
          </div>

          {educations.length > 0 && (
            <div className="mb-6 space-y-4">
              {educations.map((edu) => (
                <div key={edu.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{edu.qualification}</p>
                    {edu.institution && (
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                    )}
                    {edu.completionYear && (
                      <p className="text-sm text-gray-600">Completed in {edu.completionYear}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Add Education</h3>
            <form onSubmit={handleSubmitEducation(onSubmitEducation)} className="space-y-3">
              <div>
                <Label htmlFor="qualification" className="text-sm font-medium text-gray-900">
                  Qualification (e.g., B.Sc in English, HND) *
                </Label>
                <Input
                  id="qualification"
                  {...registerEducation('qualification')}
                  className={`mt-1 ${educationErrors.qualification ? 'border-red-500' : ''}`}
                  placeholder="B.Sc in English"
                />
                {educationErrors.qualification && (
                  <p className="text-red-500 text-sm mt-1">{educationErrors.qualification.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="institution" className="text-sm font-medium text-gray-900">
                    Institution
                  </Label>
                  <Input
                    id="institution"
                    {...registerEducation('institution')}
                    className={`mt-1 ${educationErrors.institution ? 'border-red-500' : ''}`}
                    placeholder="University Name"
                  />
                  {educationErrors.institution && (
                    <p className="text-red-500 text-sm mt-1">{educationErrors.institution.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="completionYear" className="text-sm font-medium text-gray-900">
                    Completion Year
                  </Label>
                  <Input
                    id="completionYear"
                    type="number"
                    {...registerEducation('completionYear')}
                    className={`mt-1 ${educationErrors.completionYear ? 'border-red-500' : ''}`}
                    placeholder="2020"
                  />
                  {educationErrors.completionYear && (
                    <p className="text-red-500 text-sm mt-1">{educationErrors.completionYear.message}</p>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </form>
          </div>
        </Card>

        {/* Skills */}
        <Card className="p-6 border-2 border-gray-200 mb-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Skills</h2>
            <Badge variant="secondary" className="ml-auto">{skills.length} added</Badge>
          </div>

          {skills.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg"
                >
                  <span className="text-sm font-medium">{skill.name}</span>
                  {skill.proficiency && (
                    <span className="text-xs text-gray-400">({skill.proficiency})</span>
                  )}
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="ml-1 hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Add Skill</h3>
            <form onSubmit={handleSubmitSkill(onSubmitSkill)} className="space-y-3">
              <div>
                <Label htmlFor="skillName" className="text-sm font-medium text-gray-900">
                  Skill (e.g., Frontend Development, Accounting) *
                </Label>
                <Input
                  id="skillName"
                  {...registerSkill('name')}
                  className={`mt-1 ${skillErrors.name ? 'border-red-500' : ''}`}
                  placeholder="Frontend Development"
                />
                {skillErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{skillErrors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="proficiency" className="text-sm font-medium text-gray-900">
                  Proficiency Level
                </Label>
                <Input
                  id="proficiency"
                  {...registerSkill('proficiency')}
                  className={`mt-1 ${skillErrors.proficiency ? 'border-red-500' : ''}`}
                  placeholder="Beginner, Intermediate, Advanced"
                />
                {skillErrors.proficiency && (
                  <p className="text-red-500 text-sm mt-1">{skillErrors.proficiency.message}</p>
                )}
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </form>
          </div>
        </Card>

        {/* Certifications */}
        <Card className="p-6 border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Certifications</h2>
            <Badge variant="secondary" className="ml-auto">{certifications.length} added</Badge>
          </div>

          {certifications.length > 0 && (
            <div className="mb-6 space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{cert.name}</p>
                    {cert.issuer && (
                      <p className="text-sm text-gray-600">Issued by: {cert.issuer}</p>
                    )}
                    {cert.issueDate && (
                      <p className="text-sm text-gray-600">Date: {cert.issueDate}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/seeker/certifications/${cert.id}`, {
                          method: 'DELETE'
                        })
                        
                        if (!response.ok) throw new Error('Failed to delete certification')
                        
                        setCertifications(certifications.filter(c => c.id !== cert.id))
                        setMessage({ type: 'success', text: 'Certification removed' })
                      } catch (err) {
                        setMessage({ type: 'error', text: 'Failed to remove certification' })
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Add Certification</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="certName" className="text-sm font-medium text-gray-900">
                  Certification Name
                </Label>
                <Input
                  id="certName"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                  className="mt-1"
                  placeholder="AWS Certified Developer"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="certIssuer" className="text-sm font-medium text-gray-900">
                    Issuer
                  </Label>
                  <Input
                    id="certIssuer"
                    value={newCertification.issuer}
                    onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                    className="mt-1"
                    placeholder="Amazon"
                  />
                </div>
                <div>
                  <Label htmlFor="certIssueDate" className="text-sm font-medium text-gray-900">
                    Issue Date
                  </Label>
                  <Input
                    id="certIssueDate"
                    type="date"
                    value={newCertification.issueDate}
                    onChange={(e) => setNewCertification({ ...newCertification, issueDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={async () => {
                  if (!newCertification.name.trim()) {
                    setMessage({ type: 'error', text: 'Certification name is required' })
                    return
                  }
                  
                  try {
                    const response = await fetch('/api/seeker/certifications', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newCertification)
                    })
                    
                    if (!response.ok) throw new Error('Failed to add certification')
                    
                    const data = await response.json()
                    setCertifications([...certifications, data.certification])
                    setNewCertification({ name: '', issuer: '', issueDate: '', expiryDate: '' })
                    setMessage({ type: 'success', text: 'Certification added successfully' })
                  } catch (err) {
                    setMessage({ type: 'error', text: 'Failed to add certification' })
                  }
                }}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </div>
  )
}
