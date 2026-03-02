/**
 * POST /api/auth/login
 * Login with email and password
 */

import { NextRequest } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import { User } from '@/lib/db/models'
import { verifyPassword } from '@/lib/auth/password'
import { generateToken, generateRefreshToken } from '@/lib/auth/jwt'
import { isValidEmail } from '@/lib/validations'
import {
  badRequestResponse,
  unauthorizedResponse,
  successResponse,
  internalErrorResponse,
} from '@/lib/auth/middleware'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !isValidEmail(email)) {
      return badRequestResponse('Invalid email address')
    }

    if (!password) {
      return badRequestResponse('Password is required')
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return unauthorizedResponse('Invalid email or password')
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return unauthorizedResponse('Invalid email or password')
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

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
      lastLogin: user.lastLogin,
    }

    return successResponse({
      user: userResponse,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error('Login error:', error)
    return internalErrorResponse('Failed to login')
  }
}
