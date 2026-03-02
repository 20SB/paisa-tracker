'use client'

/**
 * Dashboard Page
 * Main expense tracking dashboard with real data
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import TransactionStats from '@/components/transactions/transaction-stats'

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

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const getToken = () => useAuthStore.getState().accessToken
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchRecentTransactions()
  }, [isAuthenticated, router])

  const fetchRecentTransactions = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch('/api/transactions?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const result = await response.json()
      setTransactions(result.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8">
          <TransactionStats transactions={transactions} period="month" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push('/transactions')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-2xl">➕</span>
            </div>
            <h3 className="font-semibold text-gray-900">Add Transaction</h3>
            <p className="text-sm text-gray-600 mt-1">Track a new expense or income</p>
          </button>

          <button
            onClick={() => router.push('/transactions')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="font-semibold text-gray-900">View All</h3>
            <p className="text-sm text-gray-600 mt-1">See all transactions</p>
          </button>

          <button
            onClick={() => router.push('/analytics')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">Charts & insights</p>
          </button>

          <button
            onClick={() => router.push('/accounts')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🏦</span>
            </div>
            <h3 className="font-semibold text-gray-900">Accounts</h3>
            <p className="text-sm text-gray-600 mt-1">Manage accounts</p>
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <button
              onClick={() => router.push('/transactions')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600 mb-6">
                Start tracking your expenses by adding your first transaction
              </p>
              <button
                onClick={() => router.push('/transactions')}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Transaction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                      {categoryIcons[transaction.category.toLowerCase()] || '📝'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.category}
                        {transaction.merchantName && ` • ${transaction.merchantName}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        transaction.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {transaction.type === 'EXPENSE' ? '-' : '+'}₹
                      {transaction.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
