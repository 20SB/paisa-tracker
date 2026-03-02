/**
 * Transaction Summary API Route
 * GET /api/transactions/summary - Get spending/income summary
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import connectDB from '@/lib/db/mongodb'
import { TransactionService } from '@/lib/modules/transactions/transaction-service'

/**
 * GET /api/transactions/summary
 * Get transaction summary (totals, balance, category breakdown)
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') // 'today', 'week', 'month', 'year'

    let start: Date | undefined
    let end: Date | undefined

    // Handle period shortcuts
    if (period) {
      const now = new Date()
      end = now

      switch (period) {
        case 'today':
          start = new Date(now)
          start.setHours(0, 0, 0, 0)
          break
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          start = new Date(now.getFullYear(), 0, 1)
          break
      }
    } else {
      if (startDate) start = new Date(startDate)
      if (endDate) end = new Date(endDate)
    }

    // Get summary
    const summary = await TransactionService.getTransactionSummary(
      payload.userId,
      start,
      end
    )

    // Get category breakdowns
    const [expenseBreakdown, incomeBreakdown] = await Promise.all([
      TransactionService.getCategoryBreakdown(payload.userId, 'EXPENSE', start, end),
      TransactionService.getCategoryBreakdown(payload.userId, 'INCOME', start, end)
    ])

    return NextResponse.json({
      success: true,
      data: {
        summary,
        expenseBreakdown,
        incomeBreakdown,
        period: {
          startDate: start?.toISOString(),
          endDate: end?.toISOString()
        }
      }
    })
  } catch (error) {
    console.error('GET /api/transactions/summary error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction summary' },
      { status: 500 }
    )
  }
}
