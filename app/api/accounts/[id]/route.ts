/**
 * Single Account API Routes
 * GET /api/accounts/[id] - Get account by ID
 * PUT /api/accounts/[id] - Update account
 * DELETE /api/accounts/[id] - Delete account
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import connectDB from '@/lib/db/mongodb'
import BankAccount from '@/lib/db/models/BankAccount'

/**
 * GET /api/accounts/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await connectDB()

    const account = await BankAccount.findOne({
      _id: id,
      userId: payload.userId,
      deleted: false,
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: account })
  } catch (error) {
    console.error('GET /api/accounts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 })
  }
}

/**
 * PUT /api/accounts/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { accountName, accountType, bankName, accountNumber, balance } = body

    const account = await BankAccount.findOneAndUpdate(
      { _id: id, userId: payload.userId, deleted: false },
      {
        $set: {
          accountName: accountName?.trim(),
          accountType,
          bankName: bankName?.trim(),
          accountNumber: accountNumber?.trim(),
          balance,
        },
      },
      { new: true }
    )

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: account })
  } catch (error) {
    console.error('PUT /api/accounts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

/**
 * DELETE /api/accounts/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await connectDB()

    const account = await BankAccount.findOneAndUpdate(
      { _id: id, userId: payload.userId, deleted: false },
      { $set: { deleted: true } },
      { new: true }
    )

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Account deleted' })
  } catch (error) {
    console.error('DELETE /api/accounts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
