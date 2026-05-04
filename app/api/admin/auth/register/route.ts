import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { ADMIN_AUTH_COOKIE, adminAuthCookieAttributes } from '@/lib/admin-auth'
import { UserRole } from '@/generated/client'
import { z } from 'zod'

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  signupSecret: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

/** If ADMIN_SIGNUP_SECRET is set in env, clients must send the same value in signupSecret */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = RegisterSchema.parse(body)

    const requiredSecret = process.env.ADMIN_SIGNUP_SECRET?.trim()
    if (requiredSecret && validatedData.signupSecret !== requiredSecret) {
      return NextResponse.json(
        { error: 'Invalid or missing signup secret.' },
        { status: 403 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(validatedData.password)

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )

    response.cookies.set(
      ADMIN_AUTH_COOKIE,
      token,
      adminAuthCookieAttributes(60 * 60 * 24 * 7)
    )

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Admin registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
