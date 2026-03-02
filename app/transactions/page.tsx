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
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

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
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

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
          paymentMethod: formData.paymentMethod || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create transaction')
      }

      await fetchTransactions()
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating transaction:', error)
      alert('Failed to add transaction. Please try again.')
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
          paymentMethod: formData.paymentMethod || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update transaction')
      }

      await fetchTransactions()
      setEditingTransaction(null)
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Failed to update transaction. Please try again.')
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
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Failed to delete transaction. Please try again.')
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
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              {showAddForm ? 'Cancel' : '+ Add Transaction'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Add/Edit Form */}
        {(showAddForm || editingTransaction) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <AddTransactionForm
              onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
              onCancel={() => {
                setShowAddForm(false)
                setEditingTransaction(null)
              }}
              initialData={editingTransaction ? {
                amount: editingTransaction.amount.toString(),
                type: editingTransaction.type,
                category: editingTransaction.category,
                description: editingTransaction.description,
                date: new Date(editingTransaction.date).toISOString().split('T')[0],
                merchantName: editingTransaction.merchantName || '',
                paymentMethod: editingTransaction.paymentMethod || 'upi'
              } : undefined}
            />
          </div>
        )}

        {/* Stats */}
        <div className="mb-8">
          <TransactionStats transactions={transactions} period="month" />
        </div>

        {/* Transaction List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading transactions...</p>
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
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
