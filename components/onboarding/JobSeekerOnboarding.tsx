'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertCircle,
  User,
  Briefcase,
  Award,
  GraduationCap,
  FileText,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Trophy
} from 'lucide-react'

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ElementType
  fields: string[]
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Personal Information',
    description: 'Tell us about yourself',
    icon: User,
    fields: ['firstName', 'lastName', 'phoneNumber', 'location']
  },
  {
    id: 2,
    title: 'Professional Background',
    description: 'Share your experience',
    icon: Briefcase,
    fields: ['summary', 'yearsOfExperience']
  },
  {
    id: 3,
    title: 'Skills',
    description: 'What are you good at?',
    icon: Award,
    fields: ['skills']
  },
  {
    id: 4,
    title: 'Education',
    description: 'Your qualifications',
    icon: GraduationCap,
    fields: ['education']
  },
  {
    id: 5,
    title: 'Upload Resume',
    description: 'Add your CV/Resume',
    icon: FileText,
    fields: ['cv']
  }
]

interface ProfileData {
  firstName: string
  lastName: string
  phoneNumber: string
  location: string
  summary: string
  yearsOfExperience: string
}

interface Skill {
  name: string
  proficiency: string
}

interface Education {
  qualification: string
  institution: string
  completionYear: string
}

export default function JobSeekerOnboarding() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingCV, setUploadingCV] = useState(false)

  // Profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    location: '',
    summary: '',
    yearsOfExperience: ''
  })

  // Skills
  const [skills, setSkills] = useState<Skill[]>([{ name: '', proficiency: 'Intermediate' }])

  // Education
  const [educations, setEducations] = useState<Education[]>([
    { qualification: '', institution: '', completionYear: '' }
  ])

  // CV
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUploaded, setCvUploaded] = useState(false)

  useEffect(() => {
    checkProfileCompletion()
  }, [])

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch('/api/seeker/profile')
      if (response.ok) {
        const data = await response.json()
        const profile = data.profile

        // Check if profile is incomplete
        const isIncomplete = 
          !profile.firstName ||
          !profile.lastName ||
          !profile.summary ||
          !profile.yearsOfExperience ||
          !profile.cvUrl

        if (isIncomplete) {
          // Load existing data if any
          setProfileData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            phoneNumber: profile.phoneNumber || '',
            location: profile.location || '',
            summary: profile.summary || '',
            yearsOfExperience: profile.yearsOfExperience?.toString() || ''
          })
          setCvUploaded(!!profile.cvUrl)
          setOpen(true)
        }
      }
    } catch (err) {
      console.error('Failed to check profile:', err)
    }
  }

  const calculateProgress = () => {
    const totalSteps = ONBOARDING_STEPS.length
    const completedSteps = currentStep - 1
    return (completedSteps / totalSteps) * 100
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profileData.firstName && profileData.lastName && profileData.phoneNumber && profileData.location
      case 2:
        return profileData.summary && profileData.yearsOfExperience
      case 3:
        return skills.some(s => s.name.trim() !== '')
      case 4:
        return educations.some(e => e.qualification.trim() !== '')
      case 5:
        return cvFile !== null || cvUploaded
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (!isStepValid()) {
      setError('Please fill in all required fields')
      return
    }

    setError(null)

    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      await handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError(null)

    try {
      // 4. Upload CV FIRST (if provided) - This is the most important step!
      if (cvFile) {
        setUploadingCV(true)
        const formData = new FormData()
        formData.append('file', cvFile)

        console.log('Uploading CV file:', cvFile.name, cvFile.size, 'bytes')

        const cvResponse = await fetch('/api/upload/cv', {
          method: 'POST',
          body: formData
        })

        if (!cvResponse.ok) {
          const errorData = await cvResponse.json()
          console.error('CV upload failed:', errorData)
          throw new Error(errorData.error || 'Failed to upload CV')
        }

        const cvData = await cvResponse.json()
        console.log('CV uploaded successfully:', cvData)
        
        // Verify the upload was saved to database
        if (!cvData.success || !cvData.url) {
          throw new Error('CV upload did not complete properly')
        }
        
        setUploadingCV(false)
        setCvUploaded(true) // Mark as uploaded
      } else if (!cvUploaded) {
        // If no file selected and no previous upload, this shouldn't happen due to validation
        throw new Error('Please upload your CV/Resume to continue')
      }

      // 1. Update profile
      const profileResponse = await fetch('/api/seeker/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileData,
          yearsOfExperience: parseInt(profileData.yearsOfExperience)
        })
      })

      if (!profileResponse.ok) throw new Error('Failed to update profile')

      // 2. Add skills
      for (const skill of skills.filter(s => s.name.trim() !== '')) {
        await fetch('/api/seeker/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(skill)
        })
      }

      // 3. Add educations
      for (const edu of educations.filter(e => e.qualification.trim() !== '')) {
        await fetch('/api/seeker/educations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qualification: edu.qualification,
            institution: edu.institution || null,
            completionYear: edu.completionYear ? parseInt(edu.completionYear) : null
          })
        })
      }

      // Success!
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete profile')
      setUploadingCV(false)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        setCvFile(null)
        e.target.value = '' // Clear the input
        return
      }
      
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF or DOC/DOCX file only')
        setCvFile(null)
        e.target.value = '' // Clear the input
        return
      }
      
      // File is valid
      setCvFile(file)
      setError(null)
      console.log('CV file selected:', file.name, file.type, file.size, 'bytes')
    }
  }

  const addSkill = () => {
    setSkills([...skills, { name: '', proficiency: 'Intermediate' }])
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const updateSkill = (index: number, field: 'name' | 'proficiency', value: string) => {
    const updated = [...skills]
    updated[index][field] = value
    setSkills(updated)
  }

  const addEducation = () => {
    setEducations([...educations, { qualification: '', institution: '', completionYear: '' }])
  }

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index))
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educations]
    updated[index][field] = value
    setEducations(updated)
  }

  const StepIcon = ONBOARDING_STEPS[currentStep - 1]?.icon || User

  return (
    <Dialog open={open} onOpenChange={(value) => {
      // Don't allow closing until complete
      if (!value && calculateProgress() < 100) {
        setError('Please complete your profile to continue using the platform')
        return
      }
      setOpen(value)
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
              <StepIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                {ONBOARDING_STEPS[currentStep - 1]?.title}
              </DialogTitle>
              <DialogDescription>
                {ONBOARDING_STEPS[currentStep - 1]?.description}
              </DialogDescription>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Step {currentStep} of {ONBOARDING_STEPS.length}</span>
              <span className="font-semibold text-gray-900">{Math.round(calculateProgress())}% Complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="py-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    placeholder="John"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    placeholder="Doe"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  placeholder="San Francisco, CA"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 2: Professional Background */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="summary">Professional Summary *</Label>
                <Textarea
                  id="summary"
                  value={profileData.summary}
                  onChange={(e) => setProfileData({ ...profileData, summary: e.target.value })}
                  placeholder="Tell us about your professional background, key achievements, and career goals..."
                  rows={6}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">This will be shown to recruiters</p>
              </div>

              <div>
                <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  value={profileData.yearsOfExperience}
                  onChange={(e) => setProfileData({ ...profileData, yearsOfExperience: e.target.value })}
                  placeholder="5"
                  min="0"
                  max="50"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 3: Skills */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Add your professional skills</p>
              {skills.map((skill, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      placeholder="e.g., JavaScript, Project Management, Marketing"
                    />
                  </div>
                  <div className="w-40">
                    <select
                      value={skill.proficiency}
                      onChange={(e) => updateSkill(index, 'proficiency', e.target.value)}
                      className="w-full h-10 px-3 border border-gray-200 rounded-md"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  {skills.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSkill(index)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                className="w-full"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Add Another Skill
              </Button>
            </div>
          )}

          {/* Step 4: Education */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Add your educational qualifications</p>
              {educations.map((edu, index) => (
                <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <Input
                      value={edu.qualification}
                      onChange={(e) => updateEducation(index, 'qualification', e.target.value)}
                      placeholder="e.g., B.Sc in Computer Science, MBA"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      placeholder="Institution name (optional)"
                    />
                    <Input
                      type="number"
                      value={edu.completionYear}
                      onChange={(e) => updateEducation(index, 'completionYear', e.target.value)}
                      placeholder="Year (optional)"
                      min="1950"
                      max="2030"
                    />
                  </div>
                  {educations.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEducation(index)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEducation}
                className="w-full"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Add Another Education
              </Button>
            </div>
          )}

          {/* Step 5: CV Upload */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Upload your CV/Resume to complete your profile. This is <strong>required</strong> for recruiters to review your application.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <Label htmlFor="cv-upload" className="cursor-pointer">
                  <div className="text-sm text-gray-600 mb-2">
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{cvFile.name}</span>
                      </div>
                    ) : cvUploaded ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Resume already uploaded</span>
                      </div>
                    ) : (
                      <span className="font-medium">Click to upload your resume/CV *</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">PDF or DOC, max 10MB</p>
                </Label>
                <Input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {cvFile && (
                <Alert className="bg-blue-50 border-blue-200">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>{cvFile.name}</strong> ({(cvFile.size / 1024 / 1024).toFixed(2)} MB) - Ready to upload
                  </AlertDescription>
                </Alert>
              )}

              {cvUploaded && !cvFile && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your resume is already uploaded. You can upload a new one to replace it.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < ONBOARDING_STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || loading}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!isStepValid() || loading || uploadingCV}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {uploadingCV ? 'Uploading CV...' : loading ? 'Saving Profile...' : 'Complete Profile'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
