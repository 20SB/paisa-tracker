/**
 * Transaction Service
 * Business logic for transaction management
 */

import Transaction from '@/lib/db/models/Transaction'
import type { ITransaction } from '@/lib/db/models/Transaction'

export interface CreateTransactionInput {
  userId: string
  amount: number
  type: 'EXPENSE' | 'INCOME'
  category: string
  description: string
  date: Date
  merchantName?: string
  paymentMethod?: string
  accountId?: string
}

export interface UpdateTransactionInput {
  amount?: number
  type?: 'EXPENSE' | 'INCOME'
  category?: string
  description?: string
  date?: Date
  merchantName?: string
  paymentMethod?: string
  accountId?: string
}

export interface TransactionFilters {
  userId: string
  type?: 'EXPENSE' | 'INCOME'
  category?: string
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
  searchQuery?: string
}

export class TransactionService {
  /**
   * Create a new transaction
   */
  static async createTransaction(input: CreateTransactionInput): Promise<ITransaction> {
    try {
      const transaction = await Transaction.create(input)
      return transaction
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw new Error('Failed to create transaction')
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(
    transactionId: string,
    userId: string
  ): Promise<ITransaction | null> {
    try {
      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId,
        deleted: false
      })
      return transaction
    } catch (error) {
      console.error('Error fetching transaction:', error)
      throw new Error('Failed to fetch transaction')
    }
  }

  /**
   * Get all transactions with filters
   */
  static async getTransactions(
    filters: TransactionFilters,
    limit = 50,
    skip = 0
  ): Promise<{ transactions: ITransaction[]; total: number }> {
    try {
      const query: any = {
        userId: filters.userId,
        deleted: false
      }

      // Type filter
      if (filters.type) {
        query.type = filters.type
      }

      // Category filter
      if (filters.category) {
        query.category = filters.category
      }

      // Date range filter
      if (filters.startDate || filters.endDate) {
        query.date = {}
        if (filters.startDate) {
          query.date.$gte = filters.startDate
        }
        if (filters.endDate) {
          query.date.$lte = filters.endDate
        }
      }

      // Amount range filter
      if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
        query.amount = {}
        if (filters.minAmount !== undefined) {
          query.amount.$gte = filters.minAmount
        }
        if (filters.maxAmount !== undefined) {
          query.amount.$lte = filters.maxAmount
        }
      }

      // Search query (description or merchant name)
      if (filters.searchQuery) {
        query.$or = [
          { description: { $regex: filters.searchQuery, $options: 'i' } },
          { merchantName: { $regex: filters.searchQuery, $options: 'i' } }
        ]
      }

      const [transactions, total] = await Promise.all([
        Transaction.find(query)
          .sort({ date: -1 })
          .limit(limit)
          .skip(skip)
          .lean(),
        Transaction.countDocuments(query)
      ])

      return { transactions: transactions as ITransaction[], total }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw new Error('Failed to fetch transactions')
    }
  }

  /**
   * Update transaction
   */
  static async updateTransaction(
    transactionId: string,
    userId: string,
    updates: UpdateTransactionInput
  ): Promise<ITransaction | null> {
    try {
      const transaction = await Transaction.findOneAndUpdate(
        { _id: transactionId, userId, deleted: false },
        { $set: updates },
        { new: true }
      )

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      return transaction
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw new Error('Failed to update transaction')
    }
  }

  /**
   * Soft delete transaction
   */
  static async deleteTransaction(
    transactionId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const result = await Transaction.findOneAndUpdate(
        { _id: transactionId, userId, deleted: false },
        { $set: { deleted: true } },
        { new: true }
      )

      return !!result
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw new Error('Failed to delete transaction')
    }
  }

  /**
   * Get transaction summary (totals by type)
   */
  static async getTransactionSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalExpenses: number
    totalIncome: number
    balance: number
    transactionCount: number
  }> {
    try {
      const query: any = {
        userId,
        deleted: false
      }

      if (startDate || endDate) {
        query.date = {}
        if (startDate) query.date.$gte = startDate
        if (endDate) query.date.$lte = endDate
      }

      const result = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])

      let totalExpenses = 0
      let totalIncome = 0
      let transactionCount = 0

      result.forEach((item) => {
        if (item._id === 'EXPENSE') {
          totalExpenses = item.total
        } else if (item._id === 'INCOME') {
          totalIncome = item.total
        }
        transactionCount += item.count
      })

      return {
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses,
        transactionCount
      }
    } catch (error) {
      console.error('Error calculating summary:', error)
      throw new Error('Failed to calculate transaction summary')
    }
  }

  /**
   * Get category-wise breakdown
   */
  static async getCategoryBreakdown(
    userId: string,
    type: 'EXPENSE' | 'INCOME',
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{ category: string; total: number; count: number }>> {
    try {
      const query: any = {
        userId,
        type,
        deleted: false
      }

      if (startDate || endDate) {
        query.date = {}
        if (startDate) query.date.$gte = startDate
        if (endDate) query.date.$lte = endDate
      }

      const result = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } }
      ])

      return result.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count
      }))
    } catch (error) {
      console.error('Error calculating category breakdown:', error)
      throw new Error('Failed to calculate category breakdown')
    }
  }

  /**
   * Get recent transactions
   */
  static async getRecentTransactions(
    userId: string,
    limit = 10
  ): Promise<ITransaction[]> {
    try {
      const transactions = await Transaction.find({
        userId,
        deleted: false
      })
        .sort({ date: -1 })
        .limit(limit)
        .lean()

      return transactions as ITransaction[]
    } catch (error) {
      console.error('Error fetching recent transactions:', error)
      throw new Error('Failed to fetch recent transactions')
    }
  }
}
