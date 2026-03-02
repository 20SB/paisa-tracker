/**
 * Single Transaction API Routes
 * GET /api/transactions/[id] - Get transaction by ID
 * PUT /api/transactions/[id] - Update transaction
 * DELETE /api/transactions/[id] - Delete transaction
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import connectDB from '@/lib/db/mongodb'
import { TransactionService } from '@/lib/modules/transactions/transaction-service'
import type { UpdateTransactionInput } from '@/lib/modules/transactions/transaction-service'

/**
 * GET /api/transactions/[id]
 * Get a specific transaction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const transaction = await TransactionService.getTransactionById(
      id,
      payload.userId
    )

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('GET /api/transactions/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/transactions/[id]
 * Update a transaction
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
      amount,
      type,
      category,
      description,
      date,
      merchantName,
      paymentMethod,
      accountId
    } = body

    // Build update object
    const updates: UpdateTransactionInput = {}

    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive number' },
          { status: 400 }
        )
      }
      updates.amount = amount
    }

    if (type !== undefined) {
      if (type !== 'EXPENSE' && type !== 'INCOME') {
        return NextResponse.json(
          { error: 'Type must be either EXPENSE or INCOME' },
          { status: 400 }
        )
      }
      updates.type = type
    }

    if (category !== undefined) updates.category = category
    if (description !== undefined) updates.description = description.trim()
    if (date !== undefined) updates.date = new Date(date)
    if (merchantName !== undefined) updates.merchantName = merchantName.trim()
    if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod.trim()
    if (accountId !== undefined) updates.accountId = accountId

    // Update transaction
    const transaction = await TransactionService.updateTransaction(
      id,
      payload.userId,
      updates
    )

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('PUT /api/transactions/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/transactions/[id]
 * Delete a transaction (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const success = await TransactionService.deleteTransaction(
      id,
      payload.userId
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    })
  } catch (error) {
    console.error('DELETE /api/transactions/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
