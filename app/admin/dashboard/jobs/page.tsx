'use client'

import React, { useEffect, useState } from 'react'
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
import { Briefcase } from 'lucide-react'
import { PageLoading } from '@/components/PageLoading'

type JobRow = {
  id: string
  jobTitle: string
  description: string
  employmentType: string
  requiredQualifications?: string | null
  requiredSkills?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  location?: string | null
  isActive: boolean
  createdAt: string
  recruiter: {
    companyName: string
    isVerified: boolean
    companyLocation?: string | null
    user: { email: string }
  }
  _count: { applications: number }
}

export default function AdminJobsPage() {
  const [rows, setRows] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<JobRow | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      try {
        const res = await fetch('/api/admin/jobs')
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Failed to load jobs')
        if (!cancelled) setRows(data.jobs ?? [])
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
    return <PageLoading variant="section" message="Loading jobs…" />
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  const salaryRange = (r: JobRow) => {
    const c = r.currency || 'USD'
    if (r.salaryMin != null && r.salaryMax != null) {
      return `${c} ${r.salaryMin.toLocaleString()} – ${r.salaryMax.toLocaleString()}`
    }
    if (r.salaryMin != null) return `${c} ${r.salaryMin.toLocaleString()}+`
    if (r.salaryMax != null) return `Up to ${c} ${r.salaryMax.toLocaleString()}`
    return '—'
  }

  const typeLabel = (t: string) =>
    t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All jobs</h1>
          <p className="mt-1 text-gray-600 text-sm">
            Every job posting on the platform ({rows.length} total).
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
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Company</th>
                  <th className="px-4 py-3 font-semibold hidden xl:table-cell">Type</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Location</th>
                  <th className="px-4 py-3 font-semibold">Applicants</th>
                  <th className="px-4 py-3 font-semibold">Active</th>
                  <th className="px-4 py-3 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[8rem]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 shrink-0">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900 line-clamp-2">{r.jobTitle}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 hidden lg:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span>{r.recruiter.companyName}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[10rem]">
                          {r.recruiter.user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden xl:table-cell whitespace-nowrap">
                      {typeLabel(r.employmentType)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {r.location?.trim() || '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium">{r._count?.applications ?? 0}</td>
                    <td className="px-4 py-3">
                      {r.isActive ? (
                        <Badge className="bg-blue-50 text-blue-800 border border-blue-100">Live</Badge>
                      ) : (
                        <Badge variant="outline">Off</Badge>
                      )}
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
            <p className="p-10 text-center text-gray-600">No jobs posted yet.</p>
          )}
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selected?.jobTitle}</DialogTitle>
            <DialogDescription>Full posting and recruiter context</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2 grid gap-1">
                  <dt className="font-medium text-gray-500">Company</dt>
                  <dd className="text-gray-900 font-semibold">{selected.recruiter.companyName}</dd>
                  <dd className="text-gray-600 text-xs break-all">{selected.recruiter.user.email}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Company verified</dt>
                  <dd className="text-gray-900">
                    {selected.recruiter.isVerified ? 'Yes' : 'No'}
                  </dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Employment type</dt>
                  <dd className="text-gray-900">{typeLabel(selected.employmentType)}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Location</dt>
                  <dd className="text-gray-900">{selected.location?.trim() || '—'}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Salary range</dt>
                  <dd className="text-gray-900">{salaryRange(selected)}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Applicants</dt>
                  <dd className="text-gray-900">{selected._count?.applications ?? 0}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Listed</dt>
                  <dd className="text-gray-900">{fmtDate(selected.createdAt)}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-gray-500">Status</dt>
                  <dd className="text-gray-900">{selected.isActive ? 'Active' : 'Inactive'}</dd>
                </div>
              </dl>

              <div className="grid gap-1">
                <span className="font-medium text-gray-500">Description</span>
                <div className="text-gray-800 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 border border-gray-100 max-h-52 overflow-y-auto">
                  {selected.description?.trim() || '—'}
                </div>
              </div>

              <div className="grid gap-1">
                <span className="font-medium text-gray-500">Required qualifications</span>
                <div className="text-gray-800 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 border border-gray-100 max-h-36 overflow-y-auto">
                  {selected.requiredQualifications?.trim() || '—'}
                </div>
              </div>

              <div className="grid gap-1">
                <span className="font-medium text-gray-500">Required skills</span>
                <div className="text-gray-800 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 border border-gray-100 max-h-36 overflow-y-auto">
                  {selected.requiredSkills?.trim() || '—'}
                </div>
              </div>
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
