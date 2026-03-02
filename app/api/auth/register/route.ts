/**
 * POST /api/auth/register
 * Register new user with email and password
 */

import { NextRequest } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import { User } from '@/lib/db/models'
import { hashPassword } from '@/lib/auth/password'
import { generateToken, generateRefreshToken } from '@/lib/auth/jwt'
import { isValidEmail } from '@/lib/validations'
import {
  badRequestResponse,
  successResponse,
  internalErrorResponse,
} from '@/lib/auth/middleware'
import { validatePassword } from '@/lib/auth/password'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, password, name } = body

    // Validation
    if (!email || !isValidEmail(email)) {
      return badRequestResponse('Invalid email address')
    }

    if (!password) {
      return badRequestResponse('Password is required')
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return badRequestResponse(passwordValidation.errors.join(', '))
    }

    if (!name || name.trim().length < 2) {
      return badRequestResponse('Name must be at least 2 characters')
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return badRequestResponse('User already exists with this email')
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name: name.trim(),
      preferences: {
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        language: 'en',
        theme: 'light',
        notificationsEnabled: true,
        biometricEnabled: false,
      },
      onboardingCompleted: false,
      onboardingStep: 0,
    })

    // Generate tokens
    const accessToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
    })

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
    })

    // Save refresh token
    user.refreshToken = refreshToken
    await user.save()

    // Remove sensitive data
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      preferences: user.preferences,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
    }

    return successResponse(
      {
        user: userResponse,
        accessToken,
        refreshToken,
      },
      201
    )
  } catch (error) {
    console.error('Registration error:', error)
    return internalErrorResponse('Failed to register user')
  }
}
