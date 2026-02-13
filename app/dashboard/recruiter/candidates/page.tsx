'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Search, User, Briefcase } from 'lucide-react'

interface Candidate {
  id: string
  firstName?: string
  lastName?: string
  summary?: string
  yearsOfExperience?: number
  location?: string
  skills: Array<{ id: string; name: string }>
  educations: Array<{ id: string; qualification: string }>
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch('/api/recruiter/candidates')
        if (!response.ok) throw new Error('Failed to fetch candidates')
        const data = await response.json()
        setCandidates(data.candidates)
        setFilteredCandidates(data.candidates)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidates')
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCandidates(candidates)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredCandidates(
        candidates.filter((candidate) => {
          const name = `${candidate.firstName || ''} ${candidate.lastName || ''}`.toLowerCase()
          const skillsStr = candidate.skills.map(s => s.name).join(' ').toLowerCase()
          const educationStr = candidate.educations.map(e => e.qualification).join(' ').toLowerCase()
          const summary = candidate.summary?.toLowerCase() || ''
          const location = candidate.location?.toLowerCase() || ''

          return (
            name.includes(term) ||
            skillsStr.includes(term) ||
            educationStr.includes(term) ||
            summary.includes(term) ||
            location.includes(term)
          )
        })
      )
    }
  }, [searchTerm, candidates])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading candidates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Search Candidates</h1>
              <p className="text-gray-600 text-sm mt-0.5">Find talent by name, skills, education, or location</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <Card className="p-4 sm:p-6 border-2 border-gray-200 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name, skills, education, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 focus:border-blue-500"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Example: &quot;React&quot;, &quot;B.Sc in English&quot;, &quot;Senior Developer&quot;, &quot;San Francisco&quot;
            </p>
          </Card>

          {/* Candidates Grid */}
          {filteredCandidates.length === 0 ? (
            <Card className="p-12 text-center border-2 border-gray-200 bg-white">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No candidates match your search. Try different keywords.' : 'No candidates available yet.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="p-4 sm:p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {candidate.firstName && candidate.lastName
                        ? `${candidate.firstName} ${candidate.lastName}`
                        : 'Candidate'}
                    </h3>
                    {candidate.location && (
                      <p className="text-sm text-gray-600 mt-1">{candidate.location}</p>
                    )}
                  </div>
                </div>

                {candidate.summary && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-2">{candidate.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {candidate.yearsOfExperience && (
                  <div className="mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {candidate.yearsOfExperience} years of experience
                    </span>
                  </div>
                )}

                {/* Education */}
                {candidate.educations.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Education</p>
                    <div className="space-y-1">
                      {candidate.educations.slice(0, 2).map((edu) => (
                        <p key={edu.id} className="text-sm text-gray-600">
                          • {edu.qualification}
                        </p>
                      ))}
                      {candidate.educations.length > 2 && (
                        <p className="text-sm text-gray-600">
                          • +{candidate.educations.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {candidate.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill.id}
                          className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{candidate.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
                  View Profile
                </Button>
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
