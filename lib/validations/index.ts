/**
 * Input Validation Utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

/**
 * Validate amount
 */
export function isValidAmount(amount: number): boolean {
  return amount > 0 && amount < 10000000 && Number.isFinite(amount)
}

/**
 * Validate date
 */
export function isValidDate(date: string | Date): boolean {
  const parsedDate = new Date(date)
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime())
}

/**
 * Sanitize string input
 */
export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '')
}

/**
 * Sanitize amount (round to 2 decimals)
 */
export function sanitizeAmount(amount: number): number {
  return Math.round(amount * 100) / 100
}

/**
 * Validate category name
 */
export function isValidCategoryName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 50
}

/**
 * Validate transaction type
 */
export function isValidTransactionType(type: string): boolean {
  const validTypes = ['upi', 'card', 'neft', 'imps', 'atm', 'cash', 'sip', 'emi']
  return validTypes.includes(type)
}

/**
 * Validate bank account type
 */
export function isValidAccountType(type: string): boolean {
  const validTypes = ['savings', 'current', 'credit_card', 'wallet']
  return validTypes.includes(type)
}
