'use client'

import React, { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Briefcase, Shield } from 'lucide-react'
import { PageLoading } from '@/components/PageLoading'

function AdminLandingContent() {
  const router = useRouter()

  useEffect(() => {
    const maybeRedirect = async () => {
      const res = await fetch('/api/admin/auth/me')
      if (!res.ok) return
      router.replace('/admin/dashboard')
    }
    void maybeRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md mx-auto border-2 border-gray-200 shadow-xl">
        <div className="p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Super Admin</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in or register to manage verification and oversight.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/login"
              className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/admin/register"
              className="flex items-center justify-center rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            >
              Create admin account
            </Link>
            <Link
              href="/"
              className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              Back to JobBoard home
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function AdminLandingPage() {
  return (
    <Suspense fallback={<PageLoading message={null} size="lg" />}>
      <AdminLandingContent />
    </Suspense>
  )
}
