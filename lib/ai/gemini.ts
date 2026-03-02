/**
 * Google Gemini AI Service
 * Handles all AI-powered features:
 * - SMS parsing
 * - Transaction categorization
 * - Merchant name cleaning
 * - Subscription detection
 * - Financial insights
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro'

if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not found. AI features will be disabled.')
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

/**
 * Parse SMS transaction message
 */
export async function parseSMS(smsText: string): Promise<{
  amount?: number
  type?: 'debit' | 'credit'
  merchant?: string
  upiId?: string
  date?: string
  balance?: number
  bankAccount?: string
  transactionType?: string
  confidence: number
}> {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    const prompt = `
You are an expert at parsing Indian bank SMS transaction messages.

Extract the following information from this SMS:
- amount (number only, without currency symbol)
- type (debit or credit)
- merchant name (clean name without special characters)
- UPI ID (if present)
- transaction date (YYYY-MM-DD format)
- remaining balance (if mentioned)
- account number last 4 digits
- transaction type (upi, card, neft, imps, atm)

SMS: "${smsText}"

Respond in JSON format:
{
  "amount": number,
  "type": "debit" or "credit",
  "merchant": "string",
  "upiId": "string",
  "date": "YYYY-MM-DD",
  "balance": number,
  "bankAccount": "XXXX1234",
  "transactionType": "upi|card|neft|imps|atm",
  "confidence": 0-100
}

Only include fields you're confident about. If unsure, omit the field.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return parsed
    }

    return { confidence: 0 }
  } catch (error) {
    console.error('SMS parsing error:', error)
    return { confidence: 0 }
  }
}

/**
 * Categorize transaction using AI
 */
export async function categorizeTransaction(data: {
  merchant?: string
  amount: number
  description?: string
  transactionType?: string
}): Promise<{
  category: string
  subcategory?: string
  confidence: number
  alternatives?: Array<{ category: string; confidence: number }>
}> {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    const prompt = `
You are a financial transaction categorization expert for Indian users.

Categorize this transaction into ONE of these categories:
- Food (restaurants, food delivery, groceries)
- Transport (uber, ola, petrol, metro, bus, flight)
- Shopping (online shopping, retail, clothing)
- Bills (electricity, water, phone, internet)
- Entertainment (movies, subscriptions, games)
- Healthcare (doctors, medicines, insurance)
- Education (courses, books, tuition)
- Investment (SIP, mutual funds, stocks)
- EMI (loan payments)
- Rent
- Family (transfers to family members)
- Miscellaneous

Transaction details:
- Merchant: ${data.merchant || 'Unknown'}
- Amount: ₹${data.amount}
- Description: ${data.description || 'None'}
- Type: ${data.transactionType || 'Unknown'}

Respond in JSON format:
{
  "category": "string",
  "subcategory": "string (optional)",
  "confidence": 0-100,
  "alternatives": [
    {"category": "string", "confidence": 0-100}
  ]
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return parsed
    }

    return { category: 'Miscellaneous', confidence: 0 }
  } catch (error) {
    console.error('Categorization error:', error)
    return { category: 'Miscellaneous', confidence: 0 }
  }
}

/**
 * Clean merchant name
 */
export async function cleanMerchantName(rawName: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    const prompt = `
Clean this merchant name by removing:
- Special characters (*-@#)
- UPI suffixes
- Transaction codes
- Extra whitespace

Keep only the actual business/merchant name.

Raw name: "${rawName}"

Respond with ONLY the cleaned name, nothing else.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const cleanedName = response.text().trim()
    
    return cleanedName || rawName
  } catch (error) {
    console.error('Merchant name cleaning error:', error)
    return rawName
  }
}

/**
 * Generate financial insight
 */
export async function generateInsight(data: {
  monthlySpending: number
  previousMonthSpending: number
  topCategories: Array<{ category: string; amount: number }>
  subscriptionTotal: number
}): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    const prompt = `
You are a personal finance advisor for an Indian user.

Generate ONE actionable financial insight (max 2 sentences) based on this data:
- This month spending: ₹${data.monthlySpending}
- Last month spending: ₹${data.previousMonthSpending}
- Top spending categories: ${data.topCategories.map(c => `${c.category} ₹${c.amount}`).join(', ')}
- Monthly subscriptions: ₹${data.subscriptionTotal}

Focus on:
- Spending trends
- Savings opportunities
- Subscription optimization
- Budget recommendations

Be friendly, concise, and specific.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const insight = response.text().trim()
    
    return insight
  } catch (error) {
    console.error('Insight generation error:', error)
    return 'Track your expenses regularly to understand your spending patterns better.'
  }
}

/**
 * Detect if transaction is a subscription
 */
export async function detectSubscription(data: {
  merchant: string
  amount: number
  frequency: string
}): Promise<{
  isSubscription: boolean
  serviceName?: string
  confidence: number
}> {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    const prompt = `
Determine if this is a subscription service payment.

Details:
- Merchant: ${data.merchant}
- Amount: ₹${data.amount}
- Payment frequency: ${data.frequency}

Common Indian subscriptions: Netflix, Amazon Prime, Spotify, Disney+ Hotstar, Swiggy One, Zomato Pro, iCloud, etc.

Respond in JSON:
{
  "isSubscription": true/false,
  "serviceName": "string (if subscription)",
  "confidence": 0-100
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return parsed
    }

    return { isSubscription: false, confidence: 0 }
  } catch (error) {
    console.error('Subscription detection error:', error)
    return { isSubscription: false, confidence: 0 }
  }
}

export const gemini = {
  parseSMS,
  categorizeTransaction,
  cleanMerchantName,
  generateInsight,
  detectSubscription,
}

export default gemini
