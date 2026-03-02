/**
 * AI SMS Parser API Route
 * POST /api/ai/parse-sms - Parse bank SMS using Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { parseSMS } from '@/lib/ai/sms-parser'

/**
 * POST /api/ai/parse-sms
 * Parse bank transaction SMS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { smsText } = body

    if (!smsText || typeof smsText !== 'string') {
      return NextResponse.json(
        { error: 'SMS text is required' },
        { status: 400 }
      )
    }

    // Parse SMS using Gemini AI
    const result = await parseSMS(smsText)

    if (!result) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Could not parse SMS. Please check the format.' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('SMS parsing error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to parse SMS. Please try again.' 
      },
      { status: 500 }
    )
  }
}
