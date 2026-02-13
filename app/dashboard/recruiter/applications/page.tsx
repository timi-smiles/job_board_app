'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Search, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Eye,
  FileText,
  Briefcase,
  Mail,
  MapPin,
  Trophy
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface Application {
  id: string
  status: string
  appliedAt: string
  jobSeeker: {
    id: string
    firstName?: string
    lastName?: string
    email: string
    phoneNumber?: string
    summary?: string
    location?: string
    yearsOfExperience?: number
    cvUrl?: string
    cvFileName?: string
    skills: Array<{ id: string; name: string; proficiency?: string }>
    educations: Array<{ id: string; qualification: string; institution?: string }>
    certifications: Array<{ id: string; name: string; issuer?: string }>
  }
  jobListing: {
    id: string
    jobTitle: string
    employmentType: string
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null)
  const [showCandidateDialog, setShowCandidateDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/recruiter/applications')
      if (!response.ok) throw new Error('Failed to fetch applications')
      const data = await response.json()
      setApplications(data.applications)
      setFilteredApplications(data.applications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = applications

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((app) => {
        const fullName = `${app.jobSeeker.firstName || ''} ${app.jobSeeker.lastName || ''}`.toLowerCase()
        const jobTitle = app.jobListing.jobTitle.toLowerCase()
        const email = app.jobSeeker.email.toLowerCase()
        return fullName.includes(term) || jobTitle.includes(term) || email.includes(term)
      })
    }

    setFilteredApplications(filtered)
  }, [searchTerm, statusFilter, applications])

  const handleViewCandidate = (application: Application) => {
    setSelectedCandidate(application)
    setShowCandidateDialog(true)
  }

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/recruiter/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ))

      // Update selected candidate if viewing
      if (selectedCandidate?.id === applicationId) {
        setSelectedCandidate({ ...selectedCandidate, status: newStatus })
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDownloadResume = async (cvUrl: string, fileName: string) => {
    try {
      const response = await fetch(cvUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'resume.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Failed to download resume')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      APPLIED: { label: 'New', icon: Clock, className: 'bg-blue-100 text-blue-800' },
      SHORTLISTED: { label: 'Shortlisted', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-800' },
      ACCEPTED: { label: 'Accepted', icon: CheckCircle, className: 'bg-emerald-100 text-emerald-800' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.APPLIED
    const Icon = config.icon

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusCount = (status: string) => {
    if (status === 'all') return applications.length
    return applications.filter((app) => app.status === status).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Application Management</h1>
              <p className="text-gray-600 text-sm mt-0.5">Review and manage candidate applications for your job listings</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filters */}
          <Card className="p-4 sm:p-6 border-2 border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by candidate name, email, or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Status Tabs */}
          <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto gap-1 p-1 bg-gray-200 rounded-xl overflow-x-auto">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg text-xs sm:text-sm min-w-0 truncate">
              All ({getStatusCount('all')})
            </TabsTrigger>
            <TabsTrigger value="APPLIED" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg text-xs sm:text-sm min-w-0">
              New ({getStatusCount('APPLIED')})
            </TabsTrigger>
            <TabsTrigger value="SHORTLISTED" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg text-xs sm:text-sm min-w-0">
              Shortlisted ({getStatusCount('SHORTLISTED')})
            </TabsTrigger>
            <TabsTrigger value="ACCEPTED" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg text-xs sm:text-sm min-w-0">
              Accepted ({getStatusCount('ACCEPTED')})
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg text-xs sm:text-sm min-w-0">
              Rejected ({getStatusCount('REJECTED')})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card className="p-12 text-center border-2 border-gray-200 bg-white">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'No applications match your filters.' 
                : 'Applications will appear here when candidates apply to your jobs.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="p-4 sm:p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {application.jobSeeker.firstName && application.jobSeeker.lastName
                          ? `${application.jobSeeker.firstName} ${application.jobSeeker.lastName}`
                          : 'Candidate'}
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Applied for:</span> {application.jobListing.jobTitle}
                      </p>
                      {application.jobSeeker.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {application.jobSeeker.email}
                        </p>
                      )}
                      {application.jobSeeker.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {application.jobSeeker.location}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      {application.jobSeeker.yearsOfExperience !== null && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{application.jobSeeker.yearsOfExperience} years exp.</span>
                        </div>
                      )}
                      {application.jobSeeker.skills.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{application.jobSeeker.skills.length} skills</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Applied: </span>
                        <span className="text-gray-700">{new Date(application.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                    <Button
                      onClick={() => handleViewCandidate(application)}
                      size="sm"
                      className="flex-1 sm:flex-initial whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    {application.jobSeeker.cvUrl && (
                      <Button
                        onClick={() => handleDownloadResume(application.jobSeeker.cvUrl!, application.jobSeeker.cvFileName || 'resume.pdf')}
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-initial whitespace-nowrap border-2"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Candidate Detail Dialog */}
        <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-4xl max-h-[90vh] overflow-y-auto sm:p-6">
            {selectedCandidate && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selectedCandidate.jobSeeker.firstName && selectedCandidate.jobSeeker.lastName
                      ? `${selectedCandidate.jobSeeker.firstName} ${selectedCandidate.jobSeeker.lastName}`
                      : 'Candidate Profile'}
                  </DialogTitle>
                  <DialogDescription>
                    Applied for {selectedCandidate.jobListing.jobTitle} on{' '}
                    {new Date(selectedCandidate.appliedAt).toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Status */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Application Status</h4>
                    {getStatusBadge(selectedCandidate.status)}
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Email:</span> {selectedCandidate.jobSeeker.email}
                      </p>
                      {selectedCandidate.jobSeeker.phoneNumber && (
                        <p className="text-gray-700">
                          <span className="font-medium">Phone:</span> {selectedCandidate.jobSeeker.phoneNumber}
                        </p>
                      )}
                      {selectedCandidate.jobSeeker.location && (
                        <p className="text-gray-700">
                          <span className="font-medium">Location:</span> {selectedCandidate.jobSeeker.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {selectedCandidate.jobSeeker.summary && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Professional Summary</h4>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedCandidate.jobSeeker.summary}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {selectedCandidate.jobSeeker.yearsOfExperience !== null && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                      <p className="text-sm text-gray-700">
                        {selectedCandidate.jobSeeker.yearsOfExperience} years of professional experience
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedCandidate.jobSeeker.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.jobSeeker.skills.map((skill) => (
                          <Badge key={skill.id} variant="outline" className="text-sm px-3 py-1">
                            {skill.name}
                            {skill.proficiency && ` - ${skill.proficiency}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {selectedCandidate.jobSeeker.educations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Education</h4>
                      <div className="space-y-2">
                        {selectedCandidate.jobSeeker.educations.map((edu) => (
                          <div key={edu.id} className="text-sm">
                            <p className="font-medium text-gray-900">{edu.qualification}</p>
                            {edu.institution && <p className="text-gray-600">{edu.institution}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {selectedCandidate.jobSeeker.certifications.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
                      <div className="space-y-2">
                        {selectedCandidate.jobSeeker.certifications.map((cert) => (
                          <div key={cert.id} className="text-sm">
                            <p className="font-medium text-gray-900">{cert.name}</p>
                            {cert.issuer && <p className="text-gray-600">{cert.issuer}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume */}
                  {selectedCandidate.jobSeeker.cvUrl && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Resume</h4>
                      <Button
                        onClick={() => handleDownloadResume(
                          selectedCandidate.jobSeeker.cvUrl!,
                          selectedCandidate.jobSeeker.cvFileName || 'resume.pdf'
                        )}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Resume
                      </Button>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  {selectedCandidate.status === 'APPLIED' && (
                    <>
                      <Button
                        onClick={() => handleUpdateStatus(selectedCandidate.id, 'REJECTED')}
                        variant="outline"
                        disabled={actionLoading}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(selectedCandidate.id, 'SHORTLISTED')}
                        disabled={actionLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Shortlist
                      </Button>
                    </>
                  )}
                  {selectedCandidate.status === 'SHORTLISTED' && (
                    <>
                      <Button
                        onClick={() => handleUpdateStatus(selectedCandidate.id, 'REJECTED')}
                        variant="outline"
                        disabled={actionLoading}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(selectedCandidate.id, 'ACCEPTED')}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept for Interview
                      </Button>
                    </>
                  )}
                  {(selectedCandidate.status === 'ACCEPTED' || selectedCandidate.status === 'REJECTED') && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedCandidate.id, 'APPLIED')}
                      variant="outline"
                      disabled={actionLoading}
                    >
                      Reset to New
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  )
}
