'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Briefcase, Eye, EyeOff, Info, Shield } from 'lucide-react'

const schema = z
  .object({
    email: z.string().email('Valid email required'),
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
    signupSecret: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function AdminRegisterPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/admin/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          ...(data.signupSecret?.trim()
            ? { signupSecret: data.signupSecret.trim() }
            : {}),
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error || 'Registration failed')
        return
      }
      router.push('/admin/dashboard')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 overflow-x-hidden">
      <Card className="w-full max-w-md mx-auto border-2 border-gray-200 shadow-xl">
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create admin account</h1>
              <p className="text-gray-600 text-sm">Separate from job seeker and recruiter signup</p>
            </div>
          </div>

          <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-900">
            <Info className="h-4 w-4 shrink-0 text-blue-600" />
            <AlertDescription className="text-xs">
              Optional env{' '}
              <code className="font-mono rounded bg-blue-100/80 px-1 py-0.5">
                ADMIN_SIGNUP_SECRET
              </code>{' '}
              — match it below when set on the server. Leave blank if unset.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-900 text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="signupSecret" className="text-gray-900 text-sm font-medium">
                Signup secret (if required by server)
              </Label>
              <Input
                id="signupSecret"
                type="password"
                autoComplete="new-password"
                placeholder="Blank if ADMIN_SIGNUP_SECRET is unset"
                {...register('signupSecret')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-900 text-sm font-medium">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  autoComplete="new-password"
                  className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-900 text-sm font-medium">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={`mt-1 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {loading ? 'Creating…' : 'Create admin & sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link href="/admin/login" className="font-medium text-blue-600 hover:text-blue-700">
              Already have an account?
            </Link>
          </p>
          <p className="mt-4 text-center">
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Admin overview
            </Link>
            <span className="mx-2 text-gray-300">·</span>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Briefcase className="w-4 h-4" />
              Job seeker / employer register
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
