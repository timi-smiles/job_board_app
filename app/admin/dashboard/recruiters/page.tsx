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
import { Building2, Download, FileText } from 'lucide-react'
import { PageLoading } from '@/components/PageLoading'

type RecruiterRow = {
  id: string
  userId: string
  companyName: string
  companyDescription?: string | null
  industry?: string | null
  companyWebsite?: string | null
  companyLocation?: string | null
  isVerified: boolean
  verificationDocUrl?: string | null
  verificationDocName?: string | null
  createdAt: string
  updatedAt: string
  user: { email: string; createdAt: string }
  _count?: { jobListings: number }
}

export default function AdminRecruitersPage() {
  const [rows, setRows] = useState<RecruiterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<RecruiterRow | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      try {
        const res = await fetch('/api/admin/recruiters')
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Failed to load recruiters')
        if (!cancelled) setRows(data.recruiters ?? [])
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
    return <PageLoading variant="section" message="Loading recruiters…" />
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All recruiters</h1>
            <p className="mt-1 text-gray-600 text-sm">
              Employer accounts registered on JobBoard ({rows.length} total).
            </p>
          </div>
          <Badge variant="secondary" className="w-fit text-sm px-3 py-1">
            Registered companies
          </Badge>
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
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Location</th>
                  <th className="px-4 py-3 font-semibold">Jobs</th>
                  <th className="px-4 py-3 font-semibold">Verified</th>
                  <th className="px-4 py-3 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 shrink-0">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900 truncate max-w-[10rem] sm:max-w-xs">
                          {r.companyName?.trim() || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell truncate max-w-xs">
                      {r.user.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {r.companyLocation?.trim() || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium tabular-nums">
                      {r._count?.jobListings ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      {r.isVerified ? (
                        <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-700">
                          No
                        </Badge>
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
            <p className="p-10 text-center text-gray-600">No recruiters yet.</p>
          )}
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Recruiter details</DialogTitle>
            <DialogDescription>
              Employer profile and linked account ({selected?.companyName})
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <dl className="space-y-3 text-sm">
              <div className="grid gap-1">
                <dt className="font-medium text-gray-500">Company name</dt>
                <dd className="text-gray-900">{selected.companyName || '—'}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-gray-500">Account email</dt>
                <dd className="text-gray-900 break-all">{selected.user.email}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-gray-500">Registered</dt>
                <dd className="text-gray-900">{fmtDate(selected.user.createdAt)}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-gray-500">Industry</dt>
                <dd className="text-gray-900">{selected.industry?.trim() || '—'}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-gray-500">Location</dt>
                <dd className="text-gray-900">{selected.companyLocation?.trim() || '—'}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-gray-500">Website</dt>
                <dd className="text-gray-900 break-all">
                  {selected.companyWebsite?.trim() ? (
                    <Link
                      href={selected.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selected.companyWebsite}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-gray-500">Verification</dt>
                <dd className="text-gray-900 space-y-2">
                  <div>
                    {selected.isVerified ? 'Verified' : 'Not verified'}
                    {selected.verificationDocName
                      ? ` · Doc: ${selected.verificationDocName}`
                      : selected.verificationDocUrl
                        ? ' · Document on file'
                        : ''}
                  </div>
                  {selected.verificationDocUrl && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button variant="outline" size="sm" className="border-gray-200" asChild>
                        <a
                          href={`/api/admin/recruiters/${selected.id}/verification-document?download=1`}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download document
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-200" asChild>
                        <a
                          href={`/api/admin/recruiters/${selected.id}/verification-document`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Open / preview
                        </a>
                      </Button>
                    </div>
                  )}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-gray-500">Job postings</dt>
                <dd className="text-gray-900">{selected._count?.jobListings ?? 0} listings</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-gray-500">Description</dt>
                <dd className="text-gray-800 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 border border-gray-100 max-h-40 overflow-y-auto">
                  {selected.companyDescription?.trim() || '—'}
                </dd>
              </div>
            </dl>
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
