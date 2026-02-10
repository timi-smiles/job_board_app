'use client';

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@prisma/client'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Login failed')
        }

        const data = await response.json()
        setUser(data.user)
        router.push(
          data.user.role === 'JOB_SEEKER'
            ? '/dashboard/seeker'
            : '/dashboard/recruiter'
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const register = useCallback(
    async (
      email: string,
      password: string,
      confirmPassword: string,
      role: 'JOB_SEEKER' | 'RECRUITER'
    ) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, confirmPassword, role }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Registration failed')
        }

        const data = await response.json()
        setUser(data.user)
        router.push(
          role === 'JOB_SEEKER' ? '/dashboard/seeker' : '/dashboard/recruiter'
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/auth/login')
    } catch {
      setError('Logout failed')
    } finally {
      setLoading(false)
    }
  }, [router])

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }
}
