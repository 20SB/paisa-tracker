'use client'

/**
 * Landing Page
 * Redirects to dashboard or shows landing
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth-store'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading, setLoading } = useAuthStore()

  useEffect(() => {
    setLoading(false)
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router, setLoading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-500 text-white text-5xl mb-8">
            💰
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Paisa Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered personal finance management for India. Stop wondering where your money went.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Automatically categorize expenses using Google Gemini AI. No manual work.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">SMS Parsing</h3>
            <p className="text-gray-600">
              Auto-detect transactions from bank SMS. Track UPI, cards, and more.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
            <p className="text-gray-600">
              Your data stays yours. Local processing, encrypted storage, no sharing.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Insights</h3>
            <p className="text-gray-600">
              Get personalized financial insights and spending patterns analysis.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Everything</h3>
            <p className="text-gray-600">
              Expenses, investments, SIPs, subscriptions - all in one place.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Goal Tracking</h3>
            <p className="text-gray-600">
              Set financial goals and track progress automatically.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of Indians tracking their paisa smartly.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-lg"
          >
            Start Tracking Now →
          </Link>
        </div>
      </div>
    </div>
  )
}
