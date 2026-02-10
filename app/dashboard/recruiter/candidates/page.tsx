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
      <div className="p-8">
        <div className="text-gray-600">Loading candidates...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Candidates</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, skills, education, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Example: "React", "B.Sc in English", "Senior Developer", "San Francisco"
          </p>
        </div>

        {/* Candidates Grid */}
        {filteredCandidates.length === 0 ? (
          <Card className="p-12 text-center border border-gray-200">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No candidates match your search.' : 'No candidates available.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="p-6 border border-gray-200 hover:border-gray-300 transition">
                <div className="flex items-start justify-between mb-4">
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

                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  View Profile
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
