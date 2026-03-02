/**
 * API Authentication Middleware
 * Protect API routes and extract user info from JWT
 */

import { NextRequest } from 'next/server'
import { verifyToken, type JWTPayload } from './jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

/**
 * Authenticate request and extract user from JWT
 */
export async function authenticate(
  request: NextRequest
): Promise<{ user: JWTPayload | null; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No token provided' }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const payload = verifyToken(token)

    if (!payload) {
      return { user: null, error: 'Invalid or expired token' }
    }

    return { user: payload }
  } catch (error) {
    console.error('Authentication error:', error)
    return { user: null, error: 'Authentication failed' }
  }
}

/**
 * Standard API responses
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return Response.json(
    { success: false, error: message },
    { status: 401 }
  )
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return Response.json(
    { success: false, error: message },
    { status: 403 }
  )
}

export function badRequestResponse(message: string = 'Bad Request') {
  return Response.json(
    { success: false, error: message },
    { status: 400 }
  )
}

export function notFoundResponse(message: string = 'Not Found') {
  return Response.json(
    { success: false, error: message },
    { status: 404 }
  )
}

export function internalErrorResponse(message: string = 'Internal Server Error') {
  return Response.json(
    { success: false, error: message },
    { status: 500 }
  )
}

export function successResponse<T>(data: T, status: number = 200) {
  return Response.json(
    { success: true, data },
    { status }
  )
}
