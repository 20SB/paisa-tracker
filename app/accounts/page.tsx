'use client'

/**
 * Accounts Management Page
 * Manage bank accounts, wallets, and cash
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'

interface Account {
  _id: string
  accountName: string
  accountType: 'SAVINGS' | 'CURRENT' | 'CREDIT_CARD' | 'WALLET' | 'CASH'
  bankName?: string
  accountNumber?: string
  balance: number
  currency: string
  createdAt: string
}

const ACCOUNT_TYPES = [
  { value: 'SAVINGS', label: 'Savings Account', icon: '🏦' },
  { value: 'CURRENT', label: 'Current Account', icon: '💼' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
  { value: 'WALLET', label: 'Digital Wallet', icon: '📱' },
  { value: 'CASH', label: 'Cash', icon: '💵' },
]

export default function AccountsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const getToken = () => useAuthStore.getState().accessToken
  
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    accountName: '',
    accountType: 'SAVINGS',
    bankName: '',
    accountNumber: '',
    balance: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchAccounts()
  }, [isAuthenticated, router])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch('/api/accounts', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        setAccounts(result.data)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = getToken()
      const url = editingAccount 
        ? `/api/accounts/${editingAccount._id}`
        : '/api/accounts'
      
      const response = await fetch(url, {
        method: editingAccount ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountName: formData.accountName,
          accountType: formData.accountType,
          bankName: formData.bankName || undefined,
          accountNumber: formData.accountNumber || undefined,
          balance: parseFloat(formData.balance) || 0,
        }),
      })

      if (response.ok) {
        await fetchAccounts()
        setShowAddForm(false)
        setEditingAccount(null)
        setFormData({
          accountName: '',
          accountType: 'SAVINGS',
          bankName: '',
          accountNumber: '',
          balance: '',
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save account')
      }
    } catch (error) {
      console.error('Error saving account:', error)
      alert('Failed to save account')
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      accountName: account.accountName,
      accountType: account.accountType,
      bankName: account.bankName || '',
      accountNumber: account.accountNumber || '',
      balance: account.balance.toString(),
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return

    try {
      const token = getToken()
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        await fetchAccounts()
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

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
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="text-sm text-gray-600">Manage your bank accounts and wallets</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm)
                setEditingAccount(null)
                setFormData({
                  accountName: '',
                  accountType: 'SAVINGS',
                  bankName: '',
                  accountNumber: '',
                  balance: '',
                })
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              {showAddForm ? 'Cancel' : '+ Add Account'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Total Balance Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <p className="text-blue-100 text-sm mb-2">Total Balance</p>
          <p className="text-4xl font-bold">₹{totalBalance.toLocaleString('en-IN')}</p>
          <p className="text-blue-100 text-sm mt-4">Across {accounts.length} accounts</p>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingAccount ? 'Edit Account' : 'Add New Account'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., HDFC Savings, Paytm Wallet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ACCOUNT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, accountType: type.value as any })}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.accountType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl mr-2">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {(['SAVINGS', 'CURRENT'].includes(formData.accountType)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., HDFC Bank, ICICI Bank"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number (Last 4 digits)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600"
                >
                  {editingAccount ? 'Update Account' : 'Add Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingAccount(null)
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Accounts List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">🏦</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-gray-600 mb-6">Add your first bank account or wallet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600"
            >
              Add Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => {
              const typeInfo = ACCOUNT_TYPES.find(t => t.value === account.accountType)
              return (
                <div key={account._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                        {typeInfo?.icon || '🏦'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{account.accountName}</h3>
                        <p className="text-xs text-gray-500">{typeInfo?.label}</p>
                      </div>
                    </div>
                  </div>

                  {account.bankName && (
                    <p className="text-sm text-gray-600 mb-2">🏦 {account.bankName}</p>
                  )}
                  {account.accountNumber && (
                    <p className="text-sm text-gray-600 mb-4">****{account.accountNumber}</p>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{account.balance.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(account)}
                      className="flex-1 py-2 text-sm font-medium text-blue-600 border border-blue-500 rounded-lg hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(account._id)}
                      className="flex-1 py-2 text-sm font-medium text-red-600 border border-red-500 rounded-lg hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
