'use client'

/**
 * Dashboard Page
 * Main expense tracking dashboard
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹0</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">📤</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹0</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">📥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹0</p>
                <p className="text-xs text-gray-500 mt-1">Current</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-5xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No transactions yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start tracking your expenses by adding your first transaction. Click the button below to get started.
          </p>
          <button className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
            Add Transaction
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-2xl">➕</span>
            </div>
            <h3 className="font-semibold text-gray-900">Add Expense</h3>
            <p className="text-sm text-gray-600 mt-1">Track a new expense</p>
          </button>

          <button className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="font-semibold text-gray-900">Add Income</h3>
            <p className="text-sm text-gray-600 mt-1">Record an income</p>
          </button>
        </div>
      </main>
    </div>
  )
}
