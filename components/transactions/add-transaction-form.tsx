'use client'

/**
 * Add Transaction Form Component
 * Manual transaction entry form
 */

import { useState } from 'react'

interface TransactionFormData {
  amount: string
  type: 'EXPENSE' | 'INCOME'
  category: string
  description: string
  date: string
  merchantName: string
  paymentMethod: string
}

interface AddTransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<TransactionFormData>
}

const expenseCategories = [
  { value: 'food', label: 'Food & Dining', icon: '🍽️' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'bills', label: 'Bills & Utilities', icon: '📄' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'other', label: 'Other', icon: '📝' }
]

const incomeCategories = [
  { value: 'salary', label: 'Salary', icon: '💼' },
  { value: 'investment', label: 'Investment', icon: '📈' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'other', label: 'Other', icon: '💰' }
]

const paymentMethods = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Debit/Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'other', label: 'Other' }
]

export default function AddTransactionForm({
  onSubmit,
  onCancel,
  initialData
}: AddTransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [aiSuggesting, setAiSuggesting] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: initialData?.amount || '',
    type: initialData?.type || 'EXPENSE',
    category: initialData?.category || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    merchantName: initialData?.merchantName || '',
    paymentMethod: initialData?.paymentMethod || 'upi'
  })

  const categories = formData.type === 'EXPENSE' ? expenseCategories : incomeCategories

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    field: keyof TransactionFormData,
    value: string
  ) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Reset category when type changes
      if (field === 'type' && prev.type !== value) {
        updated.category = ''
        setAiSuggestion(null)
      }
      
      return updated
    })

    // Trigger AI suggestion when merchant or description changes
    if ((field === 'merchantName' || field === 'description') && value.length > 3) {
      getSuggestion(value, field === 'merchantName')
    }
  }

  const getSuggestion = async (text: string, isMerchant: boolean) => {
    if (!formData.amount || formData.type !== 'EXPENSE') return

    setAiSuggesting(true)
    try {
      const response = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: isMerchant ? text : formData.merchantName,
          description: !isMerchant ? text : formData.description,
          amount: parseFloat(formData.amount),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data.confidence > 60) {
          setAiSuggestion(result.data.category)
        }
      }
    } catch (error) {
      console.error('AI suggestion error:', error)
    } finally {
      setAiSuggesting(false)
    }
  }

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setFormData(prev => ({ ...prev, category: aiSuggestion }))
      setAiSuggestion(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleChange('type', 'EXPENSE')}
            className={`p-4 rounded-lg border-2 font-medium transition-all ${
              formData.type === 'EXPENSE'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl block mb-1">📤</span>
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleChange('type', 'INCOME')}
            className={`p-4 rounded-lg border-2 font-medium transition-all ${
              formData.type === 'INCOME'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl block mb-1">📥</span>
            Income
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            ₹
          </span>
          <input
            type="number"
            id="amount"
            required
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        
        {/* AI Suggestion */}
        {aiSuggestion && aiSuggestion !== formData.category && (
          <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-purple-600">✨</span>
              <span className="text-sm text-purple-700">
                AI suggests: <strong>{categories.find(c => c.value === aiSuggestion)?.label}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={applyAiSuggestion}
              className="px-3 py-1 text-xs font-medium text-purple-600 border border-purple-500 rounded hover:bg-purple-100"
            >
              Apply
            </button>
          </div>
        )}

        {aiSuggesting && (
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Getting AI suggestion...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                handleChange('category', cat.value)
                setAiSuggestion(null)
              }}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                formData.category === cat.value
                  ? 'border-blue-500 bg-blue-50'
                  : aiSuggestion === cat.value
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-xl mr-2">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="description"
          required
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Lunch at Domino's"
        />
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="date"
          required
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Merchant Name (Optional) */}
      <div>
        <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-2">
          Merchant/Payer Name
        </label>
        <input
          type="text"
          id="merchantName"
          value={formData.merchantName}
          onChange={(e) => handleChange('merchantName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Domino's Pizza"
        />
      </div>

      {/* Payment Method */}
      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <select
          id="paymentMethod"
          value={formData.paymentMethod}
          onChange={(e) => handleChange('paymentMethod', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {paymentMethods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || !formData.amount || !formData.category || !formData.description}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            loading || !formData.amount || !formData.category || !formData.description
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {loading ? 'Saving...' : initialData ? 'Update Transaction' : 'Add Transaction'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
