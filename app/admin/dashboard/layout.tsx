'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Briefcase, LogOut, Shield, ClipboardList, Building2, Users, Menu, X, Home } from 'lucide-react'
import { PageLoading } from '@/components/PageLoading'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/admin/auth/me')
        if (!res.ok) {
          router.replace('/admin/login')
          return
        }
        const data = await res.json()
        setEmail(data.user.email ?? '')
      } catch {
        router.replace('/admin/login')
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  const logout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (loading) {
    return <PageLoading message="Loading admin dashboard..." />
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Verification', icon: ClipboardList },
    { href: '/admin/dashboard/recruiters', label: 'Recruiters', icon: Building2 },
    { href: '/admin/dashboard/candidates', label: 'Candidates', icon: Users },
    { href: '/admin/dashboard/jobs', label: 'All jobs', icon: Briefcase },
  ]

  const isNavActive = (href: string) =>
    href === '/admin/dashboard'
      ? pathname === '/admin/dashboard'
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:relative inset-y-0 right-0 z-50 w-64 max-w-[85vw] bg-white border-l border-gray-200 lg:border-l-0 lg:border-r flex flex-col shadow-lg lg:shadow-sm
          transform transition-transform duration-200 ease-out
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between lg:block">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Admin</h1>
              <p className="text-xs text-gray-500">Platform oversight</p>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shrink-0 text-sm">
              {email ? email.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate" title={email}>
                {email || '—'}
              </p>
              <p className="text-xs text-gray-600">Super administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isNavActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            asChild
            variant="outline"
            className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Home className="w-4 h-4 mr-2" />
              JobBoard site
            </Link>
          </Button>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 mr-2 group-hover:scale-105 transition-transform" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 truncate">Admin</span>
          </div>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 shrink-0"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
        <main className="flex flex-1 min-h-0 flex-col overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
