/**
 * Transactions API Routes
 * GET /api/transactions - List transactions
 * POST /api/transactions - Create transaction
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import connectDB from '@/lib/db/mongodb'
import { TransactionService } from '@/lib/modules/transactions/transaction-service'
import type { CreateTransactionInput } from '@/lib/modules/transactions/transaction-service'

/**
 * GET /api/transactions
 * List user's transactions with filters
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'EXPENSE' | 'INCOME' | null
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    const searchQuery = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    // Build filters
    const filters: any = {
      userId: payload.userId
    }

    if (type) filters.type = type
    if (category) filters.category = category
    if (startDate) filters.startDate = new Date(startDate)
    if (endDate) filters.endDate = new Date(endDate)
    if (minAmount) filters.minAmount = parseFloat(minAmount)
    if (maxAmount) filters.maxAmount = parseFloat(maxAmount)
    if (searchQuery) filters.searchQuery = searchQuery

    // Fetch transactions
    const result = await TransactionService.getTransactions(filters, limit, skip)

    return NextResponse.json({
      success: true,
      data: result.transactions,
      total: result.total,
      limit,
      skip
    })
  } catch (error) {
    console.error('GET /api/transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/transactions
 * Create a new transaction
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
      amount,
      type,
      category,
      description,
      date,
      merchantName,
      paymentMethod,
      accountId
    } = body

    // Validate required fields
    if (!amount || !type || !category || !description || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, type, category, description, date' },
        { status: 400 }
      )
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Validate type
    if (type !== 'EXPENSE' && type !== 'INCOME') {
      return NextResponse.json(
        { error: 'Type must be either EXPENSE or INCOME' },
        { status: 400 }
      )
    }

    // Create transaction input
    const transactionInput: CreateTransactionInput = {
      userId: payload.userId,
      amount,
      type,
      category,
      description: description.trim(),
      date: new Date(date),
      merchantName: merchantName?.trim(),
      paymentMethod: paymentMethod?.trim(),
      accountId
    }

    // Create transaction
    const transaction = await TransactionService.createTransaction(transactionInput)

    return NextResponse.json(
      {
        success: true,
        data: transaction
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
