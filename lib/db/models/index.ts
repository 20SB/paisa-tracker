/**
 * Database Models Export
 * Central export for all Mongoose models
 */

export { User, type IUser } from './User'
export { Transaction, type ITransaction } from './Transaction'
export { BankAccount, type IBankAccount } from './BankAccount'
export { Category, type ICategory } from './Category'

// Export all models as a single object
import { User } from './User'
import { Transaction } from './Transaction'
import { BankAccount } from './BankAccount'
import { Category } from './Category'

export const models = {
  User,
  Transaction,
  BankAccount,
  Category,
}

export default models
