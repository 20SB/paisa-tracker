/**
 * AI Categorization API Route
 * POST /api/ai/categorize - Get category suggestion for transaction
 */

import { NextRequest, NextResponse } from 'next/server'
import { categorizeTransaction } from '@/lib/ai/gemini'

/**
 * POST /api/ai/categorize
 * Get AI-powered category suggestion
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { merchant, amount, description, transactionType } = body

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      )
    }

    // Get AI category suggestion
    const result = await categorizeTransaction({
      merchant,
      amount,
      description,
      transactionType,
    })

    // Map AI category to app category
    const categoryMap: Record<string, string> = {
      'Food': 'food',
      'Transport': 'transport',
      'Shopping': 'shopping',
      'Bills': 'bills',
      'Entertainment': 'entertainment',
      'Healthcare': 'healthcare',
      'Education': 'education',
      'Investment': 'investment',
      'Salary': 'salary',
    }

    const mappedCategory = categoryMap[result.category] || 'other'

    return NextResponse.json({
      success: true,
      data: {
        category: mappedCategory,
        confidence: result.confidence,
        rawCategory: result.category,
        subcategory: result.subcategory,
        alternatives: result.alternatives,
      }
    })
  } catch (error) {
    console.error('Categorization error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to categorize transaction' 
      },
      { status: 500 }
    )
  }
}
