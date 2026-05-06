'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserRound } from 'lucide-react'
import { PageLoading } from '@/components/PageLoading'

type Education = {
  id: string
  qualification: string
  institution?: string | null
  completionYear?: number | null
}
type Skill = { id: string; name: string; proficiency?: string | null }
type Certification = {
  id: string
  name: string
  issuer?: string | null
  issueDate?: string | null
  expiryDate?: string | null
}

type CandidateRow = {
  id: string
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  summary?: string | null
  location?: string | null
  cvUrl?: string | null
  cvFileName?: string | null
  yearsOfExperience?: number | null
  profileImage?: string | null
  createdAt: string
  user: { email: string; createdAt: string }
  educations: Education[]
  skills: Skill[]
  certifications: Certification[]
  _count: { applications: number }
}

export default function AdminCandidatesPage() {
  const [rows, setRows] = useState<CandidateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<CandidateRow | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      try {
        const res = await fetch('/api/admin/job-seekers')
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Failed to load candidates')
        if (!cancelled) setRows(data.jobSeekers ?? [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <PageLoading variant="section" message="Loading candidates…" />
  }

  const displayName = (r: CandidateRow) => {
    const n = `${r.firstName || ''} ${r.lastName || ''}`.trim()
    return n || '—'
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All candidates</h1>
          <p className="mt-1 text-gray-600 text-sm">
            Registered job seekers ({rows.length} total) with profiles, skills, and applications.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Location</th>
                  <th className="px-4 py-3 font-semibold">Applications</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 shrink-0">
                          <UserRound className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{displayName(r)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell truncate max-w-xs">
                      {r.user.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {r.location?.trim() || '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium">{r._count?.applications ?? 0}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell text-xs whitespace-nowrap">
                      {fmtDate(r.user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button type="button" size="sm" variant="outline" onClick={() => setSelected(r)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && !error && (
            <p className="p-10 text-center text-gray-600">No candidates registered yet.</p>
          )}
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Candidate profile</DialogTitle>
            <DialogDescription>
              Job seeker account and résumé fields ({selected ? displayName(selected) : ''})
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <dl className="space-y-3">
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Email</dt>
                  <dd className="text-gray-900 break-all">{selected.user.email}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Phone</dt>
                  <dd className="text-gray-900">{selected.phoneNumber?.trim() || '—'}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Location</dt>
                  <dd className="text-gray-900">{selected.location?.trim() || '—'}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Years of experience</dt>
                  <dd className="text-gray-900">
                    {selected.yearsOfExperience != null ? selected.yearsOfExperience : '—'}
                  </dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">CV</dt>
                  <dd className="text-gray-900">
                    {selected.cvUrl ? (
                      <span className="break-all">
                        {selected.cvFileName || 'Uploaded file'}{' · '}
                        <Link
                          href={`/api/admin/job-seekers/${selected.id}/cv`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Open file
                        </Link>
                      </span>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Summary</dt>
                  <dd className="text-gray-800 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 border border-gray-100 max-h-36 overflow-y-auto">
                    {selected.summary?.trim() || '—'}
                  </dd>
                </div>
              </dl>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wide">
                  Education
                </h4>
                <ul className="space-y-2 text-gray-700">
                  {selected.educations?.length ? (
                    selected.educations.map((e) => (
                      <li key={e.id} className="rounded-md border border-gray-100 px-3 py-2 bg-white">
                        <span className="font-medium">{e.qualification}</span>
                        {e.institution ? ` · ${e.institution}` : ''}
                        {e.completionYear != null ? ` (${e.completionYear})` : ''}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">None listed</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wide">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selected.skills?.length ? (
                    selected.skills.map((s) => (
                      <Badge key={s.id} variant="secondary" className="font-normal">
                        {s.name}
                        {s.proficiency ? ` · ${s.proficiency}` : ''}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">None listed</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wide">
                  Certifications
                </h4>
                <ul className="space-y-2 text-gray-700">
                  {selected.certifications?.length ? (
                    selected.certifications.map((c) => (
                      <li key={c.id} className="rounded-md border border-gray-100 px-3 py-2 bg-white">
                        {c.name}
                        {c.issuer ? ` — ${c.issuer}` : ''}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">None listed</li>
                  )}
                </ul>
              </div>

              <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                Profile updated from account · Registered {fmtDate(selected.user.createdAt)} ·
                Applications: {selected._count?.applications ?? 0}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
