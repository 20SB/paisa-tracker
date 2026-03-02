'use client'

/**
 * Transactions Page
 * Full transaction management interface
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import TransactionList from '@/components/transactions/transaction-list'
import TransactionStats from '@/components/transactions/transaction-stats'
import AddTransactionForm from '@/components/transactions/add-transaction-form'
import SMSParser from '@/components/transactions/sms-parser'
import { TransactionListSkeleton } from '@/components/ui/skeleton'
import { toast } from '@/lib/store/toast-store'
import { exportToCSVWithSummary } from '@/lib/utils/export'

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

export default function TransactionsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const getToken = () => useAuthStore.getState().accessToken
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showSMSParser, setShowSMSParser] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [parsedData, setParsedData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

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
      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const result = await response.json()
      setTransactions(result.data)
      setFilteredTransactions(result.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = transactions.filter((t) =>
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.merchantName?.toLowerCase().includes(query)
    )
    setFilteredTransactions(filtered)
  }, [searchQuery, transactions])

  const handleAddTransaction = async (formData: any) => {
    try {
      const token = getToken()
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          type: formData.type,
          category: formData.category,
          description: formData.description,
          date: formData.date,
          merchantName: formData.merchantName || null,
          paymentMethod: formData.paymentMethod || null,
          accountId: formData.accountId || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create transaction')
      }

      await fetchTransactions()
      setShowAddForm(false)
      setParsedData(null)
      toast.success('Transaction added successfully!')
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Failed to add transaction. Please try again.')
    }
  }

  const handleEditTransaction = async (formData: any) => {
    if (!editingTransaction) return

    try {
      const token = getToken()
      const response = await fetch(`/api/transactions/${editingTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          type: formData.type,
          category: formData.category,
          description: formData.description,
          date: formData.date,
          merchantName: formData.merchantName || null,
          paymentMethod: formData.paymentMethod || null,
          accountId: formData.accountId || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update transaction')
      }

      await fetchTransactions()
      setEditingTransaction(null)
      toast.success('Transaction updated successfully!')
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast.error('Failed to update transaction. Please try again.')
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    try {
      const token = getToken()
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete transaction')
      }

      await fetchTransactions()
      toast.success('Transaction deleted successfully!')
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('Failed to delete transaction. Please try again.')
    }
  }

  const handleSMSParsed = (data: any) => {
    setParsedData(data)
    setShowSMSParser(false)
    setShowAddForm(true)
    toast.success('SMS parsed successfully!')
  }

  const handleExport = () => {
    const dataToExport = filteredTransactions.length > 0 ? filteredTransactions : transactions
    exportToCSVWithSummary(dataToExport as any)
    toast.success(`Exported ${dataToExport.length} transactions`)
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
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-600">Track all your expenses and income</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Dashboard
            </button>
            <button
              onClick={handleExport}
              disabled={transactions.length === 0}
              className="px-4 py-2 text-sm font-medium text-green-600 border border-green-500 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📥 Export
            </button>
            <button
              onClick={() => {
                setShowSMSParser(!showSMSParser)
                setShowAddForm(false)
              }}
              className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-500 rounded-lg hover:bg-purple-50"
            >
              {showSMSParser ? 'Cancel' : '✨ Parse SMS'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm)
                setShowSMSParser(false)
                setParsedData(null)
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              {showAddForm ? 'Cancel' : '+ Add Manual'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* SMS Parser */}
        {showSMSParser && (
          <div className="mb-8">
            <SMSParser
              onParsed={handleSMSParsed}
              onClose={() => setShowSMSParser(false)}
            />
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingTransaction) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingTransaction ? 'Edit Transaction' : parsedData ? 'Review Parsed Transaction' : 'Add New Transaction'}
            </h2>
            {parsedData && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✨ Transaction auto-filled from SMS (Confidence: {parsedData.confidence}%)
                </p>
              </div>
            )}
            <AddTransactionForm
              onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
              onCancel={() => {
                setShowAddForm(false)
                setEditingTransaction(null)
                setParsedData(null)
              }}
              initialData={parsedData || (editingTransaction ? {
                amount: editingTransaction.amount.toString(),
                type: editingTransaction.type,
                category: editingTransaction.category,
                description: editingTransaction.description,
                date: new Date(editingTransaction.date).toISOString().split('T')[0],
                merchantName: editingTransaction.merchantName || '',
                paymentMethod: editingTransaction.paymentMethod || 'upi'
              } : undefined)}
            />
          </div>
        )}

        {/* Stats */}
        <div className="mb-8">
          <TransactionStats transactions={transactions} period="month" />
        </div>

        {/* Search Bar */}
        {!loading && transactions.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions... (description, category, merchant)"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-600 mt-2">
                Found {filteredTransactions.length} of {transactions.length} transactions
              </p>
            )}
          </div>
        )}

        {/* Transaction List */}
        {loading ? (
          <TransactionListSkeleton />
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            onEdit={(transaction) => {
              setEditingTransaction(transaction)
              setShowAddForm(false)
            }}
            onDelete={handleDeleteTransaction}
          />
        )}
      </main>
    </div>
  )
}
