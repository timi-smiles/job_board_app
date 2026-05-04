'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Building2, CheckCircle2, Clock, Download, FileText, ShieldAlert } from 'lucide-react'
import { PageLoading } from '@/components/PageLoading'

interface RecRow {
  id: string
  companyName: string
  verificationDocUrl: string | null
  verificationDocName: string | null
  isVerified: boolean
  user: { email: string }
}

function canPreviewInline(url: string | null): boolean {
  if (!url) return false
  return /\.pdf$/i.test(url) || /\.(png|jpg|jpeg)$/i.test(url)
}

export default function AdminDashboardPage() {
  const [recruiters, setRecruiters] = useState<RecRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<RecRow | null>(null)

  const previewSrc = preview?.id
    ? `/api/admin/recruiters/${preview.id}/verification-document`
    : null

  const load = async () => {
    setError(null)
    try {
      const res = await fetch('/api/admin/recruiters')
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error || 'Failed to load companies')
      }
      const data = await res.json()
      setRecruiters(data.recruiters ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const patchVerification = async (recruiterId: string, approved: boolean) => {
    setBusyId(recruiterId)
    setError(null)
    try {
      const res = await fetch(`/api/admin/recruiters/${recruiterId}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error || 'Update failed')
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  const pending = recruiters.filter(
    (r) => r.verificationDocUrl && !r.isVerified
  )
  const verified = recruiters.filter((r) => r.isVerified)
  const awaitingDoc = recruiters.filter((r) => !r.verificationDocUrl && !r.isVerified)

  if (loading) {
    return (
      <PageLoading
        variant="section"
        message="Loading companies…"
        size="lg"
      />
    )
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Company verification</h1>
          <p className="mt-1 text-gray-600 text-sm sm:text-base">
            Approve company verification documents submitted by recruiters.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="border-2">
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-2 border-gray-200 bg-white p-5 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-2 text-blue-600">
              <Clock className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Pending review
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">{pending.length}</div>
          </Card>
          <Card className="border-2 border-gray-200 bg-white p-5 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Verified
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">{verified.length}</div>
          </Card>
          <Card className="border-2 border-gray-200 bg-white p-5 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-2 text-gray-600">
              <ShieldAlert className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                No doc yet
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">{awaitingDoc.length}</div>
          </Card>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Awaiting approval</h2>
          {pending.length === 0 ? (
            <Card className="border-2 border-gray-200 bg-white p-10 text-center text-gray-600">
              No companies waiting for verification.
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.map((r) => (
                <Card
                  key={r.id}
                  className="border-2 border-gray-200 bg-white p-5 sm:flex sm:flex-wrap sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {r.companyName.trim() || 'Unnamed company'}
                        </span>
                        <Badge className="bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100">
                          Pending
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm text-gray-600">{r.user.email}</p>
                      {r.verificationDocName && (
                        <p className="mt-2 text-xs text-gray-500">
                          Document:{' '}
                          <span className="text-gray-700 font-medium">{r.verificationDocName}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 mt-4 sm:mt-0">
                    {r.verificationDocUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-2 border-gray-200"
                        onClick={() => setPreview(r)}
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        View / download
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      disabled={busyId === r.id}
                      onClick={() => void patchVerification(r.id, true)}
                    >
                      {busyId === r.id ? '…' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-2 border-gray-200"
                      disabled={busyId === r.id}
                      onClick={() => void patchVerification(r.id, false)}
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Verified companies</h2>
          {verified.length === 0 ? (
            <Card className="border-2 border-gray-200 bg-white p-10 text-center text-gray-600">
              None yet.
            </Card>
          ) : (
            <Card className="border-2 border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Company</th>
                    <th className="px-4 py-3 hidden sm:table-cell font-semibold">Email</th>
                    <th className="px-4 py-3 text-right font-semibold hidden md:table-cell">Document</th>
                    <th className="px-4 py-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {verified.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {r.companyName.trim() || '—'}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{r.user.email}</td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        {r.verificationDocUrl ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-gray-200"
                            onClick={() => setPreview(r)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-50">
                          Approved
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </section>

        <Dialog
          open={preview !== null}
          onOpenChange={(open) => {
            if (!open) setPreview(null)
          }}
        >
          <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
            <DialogHeader className="border-b border-gray-200 px-6 py-4 text-left">
              <DialogTitle>Verification document</DialogTitle>
              <DialogDescription className="line-clamp-2">
                {preview?.companyName && (
                  <span className="font-medium text-gray-800">{preview.companyName}</span>
                )}
                {preview?.verificationDocName && (
                  <span className="text-gray-600"> — {preview.verificationDocName}</span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="bg-gray-50 px-3 py-3">
              {preview && previewSrc && canPreviewInline(preview.verificationDocUrl) ? (
                <iframe
                  title="Document preview"
                  src={previewSrc}
                  className="h-[58vh] min-h-[320px] w-full rounded-lg border-2 border-gray-200 bg-white"
                />
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-200 bg-white p-8 text-center">
                  <FileText className="h-14 w-14 text-gray-400" />
                  <div className="max-w-md text-sm text-gray-600">
                    <p className="font-medium text-gray-800">Preview unavailable in browser</p>
                    <p className="mt-2">
                      PDFs and images preview here. For Word or other formats, download the file and
                      open it with the appropriate app.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-row flex-wrap items-center gap-2 border-t border-gray-200 px-6 py-4 sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setPreview(null)}>
                Close
              </Button>
              <div className="flex flex-wrap gap-2 justify-end">
                {previewSrc && (
                  <>
                    <Button variant="outline" asChild>
                      <a href={`${previewSrc}?download=1`}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    {preview && canPreviewInline(preview.verificationDocUrl) && (
                      <Button variant="outline" asChild>
                        <a href={previewSrc} target="_blank" rel="noopener noreferrer">
                          Open in new tab
                        </a>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
