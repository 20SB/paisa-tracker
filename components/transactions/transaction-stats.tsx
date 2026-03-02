'use client'

/**
 * Transaction Stats Component
 * Shows spending/income summary
 */

interface Transaction {
  amount: number
  type: 'EXPENSE' | 'INCOME'
  date: string
}

interface TransactionStatsProps {
  transactions: Transaction[]
  period?: 'today' | 'week' | 'month' | 'year'
}

export default function TransactionStats({ 
  transactions, 
  period = 'month' 
}: TransactionStatsProps) {
  // Filter transactions by period
  const now = new Date()
  const filteredTransactions = transactions.filter(t => {
    const txDate = new Date(t.date)
    
    switch (period) {
      case 'today':
        return txDate.toDateString() === now.toDateString()
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return txDate >= weekAgo
      case 'month':
        return txDate.getMonth() === now.getMonth() && 
               txDate.getFullYear() === now.getFullYear()
      case 'year':
        return txDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  })

  // Calculate totals
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const periodLabel = {
    today: 'Today',
    week: 'This week',
    month: 'This month',
    year: 'This year'
  }[period]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Spent */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">{periodLabel}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">📤</span>
          </div>
        </div>
      </div>

      {/* Total Income */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Income</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">{periodLabel}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-2xl">📥</span>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Balance</p>
            <p className={`text-3xl font-bold mt-2 ${
              balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {balance >= 0 ? '+' : ''}₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">{periodLabel}</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            balance >= 0 ? 'bg-blue-100' : 'bg-yellow-100'
          }`}>
            <span className="text-2xl">{balance >= 0 ? '💰' : '⚠️'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
