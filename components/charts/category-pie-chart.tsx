'use client'

/**
 * Category Breakdown Pie Chart
 * Shows spending distribution by category
 */

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface Transaction {
  amount: number
  type: 'EXPENSE' | 'INCOME'
  category: string
}

interface CategoryPieChartProps {
  transactions: Transaction[]
  type?: 'EXPENSE' | 'INCOME'
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food & Dining',
  transport: 'Transport',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  bills: 'Bills',
  healthcare: 'Healthcare',
  education: 'Education',
  other: 'Other',
  salary: 'Salary',
  investment: 'Investment',
  business: 'Business',
}

export default function CategoryPieChart({
  transactions,
  type = 'EXPENSE',
}: CategoryPieChartProps) {
  const chartData = useMemo(() => {
    // Filter by type
    const filtered = transactions.filter((t) => t.type === type)

    // Group by category
    const grouped = filtered.reduce((acc, t) => {
      const category = t.category || 'other'
      acc[category] = (acc[category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

    // Convert to array and sort by amount
    const data = Object.entries(grouped)
      .map(([category, amount]) => ({
        category,
        name: CATEGORY_LABELS[category] || category,
        value: amount,
      }))
      .sort((a, b) => b.value - a.value)

    return data
  }, [transactions, type])

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0)
  }, [chartData])

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`
  }

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))

    if (percent < 0.05) return null // Hide labels for <5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-600">
          No {type === 'EXPENSE' ? 'expense' : 'income'} data to display
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {type === 'EXPENSE' ? 'Expense' : 'Income'} by Category
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [
              formatCurrency(value),
              `${((value / total) * 100).toFixed(1)}%`,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const percent = ((entry.value / total) * 100).toFixed(1)
              return `${value} (${percent}%)`
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Top Categories */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Top Categories
        </h4>
        <div className="space-y-2">
          {chartData.slice(0, 5).map((item, index) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.value)}
                </p>
                <p className="text-xs text-gray-500">
                  {((item.value / total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
