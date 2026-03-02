/**
 * Transaction Helper Functions
 * Utility functions for transaction operations
 */

export interface Transaction {
  amount: number
  type: 'EXPENSE' | 'INCOME'
  date: string | Date
  category: string
}

/**
 * Calculate total expenses
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calculate total income
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calculate balance (income - expenses)
 */
export function calculateBalance(transactions: Transaction[]): number {
  const income = calculateTotalIncome(transactions)
  const expenses = calculateTotalExpenses(transactions)
  return income - expenses
}

/**
 * Group transactions by date
 */
export function groupTransactionsByDate(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    
    return groups
  }, {} as Record<string, Transaction[]>)
}

/**
 * Group transactions by category
 */
export function groupTransactionsByCategory(
  transactions: Transaction[]
): Record<string, { total: number; count: number; transactions: Transaction[] }> {
  return transactions.reduce((groups, transaction) => {
    const category = transaction.category
    
    if (!groups[category]) {
      groups[category] = {
        total: 0,
        count: 0,
        transactions: []
      }
    }
    
    groups[category].total += transaction.amount
    groups[category].count += 1
    groups[category].transactions.push(transaction)
    
    return groups
  }, {} as Record<string, { total: number; count: number; transactions: Transaction[] }>)
}

/**
 * Get transactions for a specific period
 */
export function getTransactionsForPeriod(
  transactions: Transaction[],
  period: 'today' | 'week' | 'month' | 'year'
): Transaction[] {
  const now = new Date()
  
  return transactions.filter(t => {
    const txDate = new Date(t.date)
    
    switch (period) {
      case 'today':
        return txDate.toDateString() === now.toDateString()
      
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return txDate >= weekAgo
      
      case 'month':
        return txDate.getMonth() === now.getMonth() && 
               txDate.getFullYear() === now.getFullYear()
      
      case 'year':
        return txDate.getFullYear() === now.getFullYear()
      
      default:
        return true
    }
  })
}

/**
 * Format currency in Indian format
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format date in Indian format
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Get date range for period
 */
export function getDateRangeForPeriod(
  period: 'today' | 'week' | 'month' | 'year'
): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  let startDate = new Date()
  
  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      break
    
    case 'week':
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    
    case 'month':
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      break
    
    case 'year':
      startDate.setMonth(0, 1)
      startDate.setHours(0, 0, 0, 0)
      break
  }
  
  return { startDate, endDate }
}

/**
 * Calculate average daily spending
 */
export function calculateAverageDailySpending(
  transactions: Transaction[],
  days: number
): number {
  const expenses = calculateTotalExpenses(transactions)
  return days > 0 ? expenses / days : 0
}

/**
 * Get top spending categories
 */
export function getTopSpendingCategories(
  transactions: Transaction[],
  limit = 5
): Array<{ category: string; total: number; percentage: number }> {
  const expenses = transactions.filter(t => t.type === 'EXPENSE')
  const totalExpenses = calculateTotalExpenses(expenses)
  
  const categoryGroups = groupTransactionsByCategory(expenses)
  
  return Object.entries(categoryGroups)
    .map(([category, data]) => ({
      category,
      total: data.total,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

/**
 * Validate transaction amount
 */
export function validateTransactionAmount(amount: number): {
  valid: boolean
  error?: string
} {
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' }
  }
  
  if (amount > 10000000) { // 1 crore limit
    return { valid: false, error: 'Amount exceeds maximum limit' }
  }
  
  return { valid: true }
}

/**
 * Sanitize transaction description
 */
export function sanitizeDescription(description: string): string {
  return description
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .substring(0, 200) // Max 200 characters
}

/**
 * Get month name
 */
export function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

/**
 * Check if transaction is recent (within last 7 days)
 */
export function isRecentTransaction(transaction: Transaction): boolean {
  const txDate = new Date(transaction.date)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return txDate >= weekAgo
}
