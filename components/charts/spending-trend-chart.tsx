'use client'

/**
 * Spending Trend Chart
 * Line chart showing spending over time
 */

import { useMemo } from 'react'
import {
  LineChart,
  Line,
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

interface SpendingTrendChartProps {
  transactions: Transaction[]
  period?: 'week' | 'month' | '3months'
}

export default function SpendingTrendChart({
  transactions,
  period = 'month',
}: SpendingTrendChartProps) {
  const chartData = useMemo(() => {
    // Group transactions by date
    const groupedByDate = transactions.reduce((acc, t) => {
      const date = new Date(t.date).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { expenses: 0, income: 0 }
      }
      if (t.type === 'EXPENSE') {
        acc[date].expenses += t.amount
      } else {
        acc[date].income += t.amount
      }
      return acc
    }, {} as Record<string, { expenses: number; income: number }>)

    // Convert to array and sort by date
    const data = Object.entries(groupedByDate)
      .map(([date, values]) => ({
        date,
        expenses: values.expenses,
        income: values.income,
        net: values.income - values.expenses,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Filter by period
    const now = new Date()
    let daysAgo = 30
    if (period === 'week') daysAgo = 7
    if (period === '3months') daysAgo = 90

    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    return data.filter((d) => new Date(d.date) >= cutoffDate)
  }, [transactions, period])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  const formatCurrency = (value: number) => {
    return `₹${(value / 1000).toFixed(1)}k`
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-600">No transaction data to display</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Spending Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
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
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
            labelFormatter={(label) => formatDate(label as string)}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Expenses"
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Income"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
