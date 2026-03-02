'use client'

/**
 * Transaction List Component
 * Displays list of transactions with filters
 */

import { useState } from 'react'

interface Transaction {
  _id: string
  amount: number
  type: 'EXPENSE' | 'INCOME'
  category: string
  description: string
  date: string
  merchantName?: string
  paymentMethod?: string
}

interface TransactionListProps {
  transactions: Transaction[]
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
}

const categoryIcons: Record<string, string> = {
  food: '🍽️',
  transport: '🚗',
  shopping: '🛍️',
  entertainment: '🎬',
  bills: '📄',
  healthcare: '🏥',
  education: '📚',
  salary: '💼',
  investment: '📈',
  other: '📝'
}

export default function TransactionList({ 
  transactions, 
  onEdit, 
  onDelete 
}: TransactionListProps) {
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(t => filter === 'all' || t.type.toLowerCase() === filter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return b.amount - a.amount
    })

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-lg p-4 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'expense'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'income'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Income
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>
      </div>

      {/* Transaction List */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-4xl">📭</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'Start by adding your first transaction'
              : `No ${filter} transactions found`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, txns]) => (
            <div key={date} className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 px-2">
                {date}
              </h3>
              <div className="space-y-2">
                {txns.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                          {categoryIcons[transaction.category.toLowerCase()] || '📝'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.category}
                            {transaction.merchantName && ` • ${transaction.merchantName}`}
                            {transaction.paymentMethod && ` • ${transaction.paymentMethod}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${
                            transaction.type === 'EXPENSE'
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {transaction.type === 'EXPENSE' ? '-' : '+'}₹
                          {transaction.amount.toLocaleString('en-IN')}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(transaction)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(transaction._id)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
