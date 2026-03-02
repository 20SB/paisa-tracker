/**
 * Bank Accounts API Routes
 * GET /api/accounts - List user's bank accounts
 * POST /api/accounts - Create new account
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import connectDB from '@/lib/db/mongodb'
import BankAccount from '@/lib/db/models/BankAccount'

/**
 * GET /api/accounts
 * List user's bank accounts and wallets
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    await connectDB()

    // Fetch accounts
    const accounts = await BankAccount.find({
      userId: payload.userId,
      deleted: false
    }).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: accounts
    })
  } catch (error) {
    console.error('GET /api/accounts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/accounts
 * Create a new bank account or wallet
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    await connectDB()

    // Parse request body
    const body = await request.json()
    const {
      accountName,
      accountType,
      bankName,
      accountNumber,
      balance,
      currency
    } = body

    // Validate required fields
    if (!accountName || !accountType) {
      return NextResponse.json(
        { error: 'Missing required fields: accountName, accountType' },
        { status: 400 }
      )
    }

    // Validate account type
    const validTypes = ['SAVINGS', 'CURRENT', 'CREDIT_CARD', 'WALLET', 'CASH']
    if (!validTypes.includes(accountType)) {
      return NextResponse.json(
        { error: `Invalid account type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // For bank accounts, require bank name
    if (['SAVINGS', 'CURRENT'].includes(accountType) && !bankName) {
      return NextResponse.json(
        { error: 'Bank name is required for savings/current accounts' },
        { status: 400 }
      )
    }

    // Create account
    const account = await BankAccount.create({
      userId: payload.userId,
      accountName: accountName.trim(),
      accountType,
      bankName: bankName?.trim(),
      accountNumber: accountNumber?.trim(),
      balance: balance || 0,
      currency: currency || 'INR'
    })

    return NextResponse.json(
      {
        success: true,
        data: account
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/accounts error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
