'use client'

/**
 * Analytics Page
 * Financial insights and visualizations
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import SpendingTrendChart from '@/components/charts/spending-trend-chart'
import CategoryPieChart from '@/components/charts/category-pie-chart'
import MonthlyComparisonChart from '@/components/charts/monthly-comparison-chart'

interface Transaction {
  _id: string
  amount: number
  type: 'EXPENSE' | 'INCOME'
  category: string
  description: string
  date: string
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const getToken = () => useAuthStore.getState().accessToken
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | '3months'>('month')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchTransactions()
  }, [isAuthenticated, router])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch('/api/transactions?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600">
              Visualize your financial data
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Dashboard
            </button>
            {/* Period Selector */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="3months">Last 3 Months</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading analytics...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Data Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add some transactions to see beautiful charts and insights
            </p>
            <button
              onClick={() => router.push('/transactions')}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Transactions
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Spending Trend */}
            <SpendingTrendChart transactions={transactions} period={period} />

            {/* Category Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart transactions={transactions} type="EXPENSE" />
              <CategoryPieChart transactions={transactions} type="INCOME" />
            </div>

            {/* Monthly Comparison */}
            <MonthlyComparisonChart transactions={transactions} months={6} />

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {transactions.length}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-1">
                    Income Sources
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {
                      new Set(
                        transactions
                          .filter((t) => t.type === 'INCOME')
                          .map((t) => t.category)
                      ).size
                    }
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 font-medium mb-1">
                    Expense Categories
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {
                      new Set(
                        transactions
                          .filter((t) => t.type === 'EXPENSE')
                          .map((t) => t.category)
                      ).size
                    }
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium mb-1">
                    Avg Transaction
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    ₹
                    {Math.round(
                      transactions.reduce((sum, t) => sum + t.amount, 0) /
                        transactions.length
                    ).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
