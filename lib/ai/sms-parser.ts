/**
 * SMS Parser Wrapper
 * Converts Gemini SMS parse result to transaction format
 */

import { parseSMS as geminiParseSMS, categorizeTransaction, cleanMerchantName } from './gemini'

interface ParsedTransaction {
  amount: number
  type: 'EXPENSE' | 'INCOME'
  merchantName?: string
  description: string
  category?: string
  date?: string
  paymentMethod?: string
  confidence: number
}

/**
 * Parse bank SMS and return transaction-ready format
 */
export async function parseSMS(smsText: string): Promise<ParsedTransaction | null> {
  try {
    // Parse SMS with Gemini
    const smsResult = await geminiParseSMS(smsText)

    if (!smsResult.amount || smsResult.confidence < 50) {
      return null
    }

    // Determine transaction type
    const type: 'EXPENSE' | 'INCOME' = 
      smsResult.type === 'debit' ? 'EXPENSE' : 'INCOME'

    // Clean merchant name if present
    let merchantName = smsResult.merchant
    if (merchantName) {
      merchantName = await cleanMerchantName(merchantName)
    }

    // Get AI category suggestion
    let category: string | undefined
    if (type === 'EXPENSE' && merchantName) {
      const categoryResult = await categorizeTransaction({
        merchant: merchantName,
        amount: smsResult.amount,
        transactionType: smsResult.transactionType,
      })
      
      if (categoryResult.confidence > 60) {
        // Map AI categories to our app categories
        category = mapCategory(categoryResult.category)
      }
    }

    // Generate description
    const description = generateDescription({
      type,
      merchant: merchantName,
      amount: smsResult.amount,
      transactionType: smsResult.transactionType,
    })

    // Map payment method
    const paymentMethod = mapPaymentMethod(smsResult.transactionType)

    // Format date
    let date: string | undefined
    if (smsResult.date) {
      try {
        const parsedDate = new Date(smsResult.date)
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split('T')[0]
        }
      } catch {
        // Use today if date parsing fails
        date = new Date().toISOString().split('T')[0]
      }
    } else {
      // Default to today
      date = new Date().toISOString().split('T')[0]
    }

    return {
      amount: smsResult.amount,
      type,
      merchantName,
      description,
      category,
      date,
      paymentMethod,
      confidence: smsResult.confidence,
    }
  } catch (error) {
    console.error('SMS parsing error:', error)
    return null
  }
}

/**
 * Map AI category to app category
 */
function mapCategory(aiCategory: string): string {
  const categoryMap: Record<string, string> = {
    'Food': 'food',
    'food': 'food',
    'restaurant': 'food',
    'groceries': 'food',
    'Transport': 'transport',
    'transport': 'transport',
    'travel': 'transport',
    'Shopping': 'shopping',
    'shopping': 'shopping',
    'retail': 'shopping',
    'Bills': 'bills',
    'bills': 'bills',
    'utilities': 'bills',
    'Entertainment': 'entertainment',
    'entertainment': 'entertainment',
    'movies': 'entertainment',
    'subscriptions': 'entertainment',
    'Healthcare': 'healthcare',
    'healthcare': 'healthcare',
    'medical': 'healthcare',
    'Education': 'education',
    'education': 'education',
    'Investment': 'investment',
    'investment': 'investment',
    'Salary': 'salary',
    'salary': 'salary',
    'income': 'salary',
  }

  const normalized = aiCategory.toLowerCase()
  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalized.includes(key.toLowerCase())) {
      return value
    }
  }

  return 'other'
}

/**
 * Map transaction type to payment method
 */
function mapPaymentMethod(transactionType?: string): string {
  if (!transactionType) return 'other'

  const methodMap: Record<string, string> = {
    'upi': 'upi',
    'card': 'card',
    'neft': 'netbanking',
    'imps': 'netbanking',
    'rtgs': 'netbanking',
    'atm': 'cash',
  }

  return methodMap[transactionType.toLowerCase()] || 'other'
}

/**
 * Generate transaction description
 */
function generateDescription(data: {
  type: 'EXPENSE' | 'INCOME'
  merchant?: string
  amount: number
  transactionType?: string
}): string {
  if (data.merchant) {
    if (data.type === 'EXPENSE') {
      return `Payment to ${data.merchant}`
    } else {
      return `Payment from ${data.merchant}`
    }
  }

  if (data.transactionType) {
    const method = data.transactionType.toUpperCase()
    if (data.type === 'EXPENSE') {
      return `${method} Payment`
    } else {
      return `${method} Credit`
    }
  }

  return data.type === 'EXPENSE' ? 'Expense' : 'Income'
}
