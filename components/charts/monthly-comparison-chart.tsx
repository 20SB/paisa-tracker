'use client'

/**
 * Monthly Comparison Bar Chart
 * Compare income vs expenses across months
 */

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Transaction {
  amount: number
  type: 'EXPENSE' | 'INCOME'
  date: string
}

interface MonthlyComparisonChartProps {
  transactions: Transaction[]
  months?: number
}

export default function MonthlyComparisonChart({
  transactions,
  months = 6,
}: MonthlyComparisonChartProps) {
  const chartData = useMemo(() => {
    // Group by month
    const grouped = transactions.reduce((acc, t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!acc[monthKey]) {
        acc[monthKey] = { expenses: 0, income: 0 }
      }

      if (t.type === 'EXPENSE') {
        acc[monthKey].expenses += t.amount
      } else {
        acc[monthKey].income += t.amount
      }

      return acc
    }, {} as Record<string, { expenses: number; income: number }>)

    // Get last N months
    const now = new Date()
    const monthsData = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-IN', {
        month: 'short',
        year: '2-digit',
      })

      monthsData.push({
        month: monthName,
        monthKey,
        expenses: grouped[monthKey]?.expenses || 0,
        income: grouped[monthKey]?.income || 0,
        savings: (grouped[monthKey]?.income || 0) - (grouped[monthKey]?.expenses || 0),
      })
    }

    return monthsData
  }, [transactions, months])

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}k`
    }
    return `₹${value}`
  }

  if (chartData.every((d) => d.expenses === 0 && d.income === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-600">No transaction data to display</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Monthly Comparison
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
          />
          <Legend />
          <Bar dataKey="income" fill="#10b981" name="Income" radius={[8, 8, 0, 0]} />
          <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {chartData.length > 0 && (
          <>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Avg Income</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(
                  chartData.reduce((sum, d) => sum + d.income, 0) / chartData.length
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Avg Expenses</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(
                  chartData.reduce((sum, d) => sum + d.expenses, 0) / chartData.length
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Avg Savings</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(
                  chartData.reduce((sum, d) => sum + d.savings, 0) / chartData.length
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
