'use client'

/**
 * SMS Parser Component
 * Paste bank SMS to auto-extract transaction details
 */

import { useState } from 'react'

interface ParsedTransaction {
  amount: number
  type: 'EXPENSE' | 'INCOME'
  merchantName?: string
  description: string
  category?: string
  date?: string
  confidence: number
}

interface SMSParserProps {
  onParsed: (transaction: ParsedTransaction) => void
  onClose?: () => void
}

export default function SMSParser({ onParsed, onClose }: SMSParserProps) {
  const [smsText, setSmsText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')

  const handleParse = async () => {
    if (!smsText.trim()) {
      setError('Please paste an SMS message')
      return
    }

    setParsing(true)
    setError('')

    try {
      const response = await fetch('/api/ai/parse-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ smsText }),
      })

      if (!response.ok) {
        throw new Error('Failed to parse SMS')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        onParsed(result.data)
        setSmsText('')
      } else {
        setError('Could not parse SMS. Please check the format.')
      }
    } catch (err) {
      console.error('SMS parsing error:', err)
      setError('Failed to parse SMS. Please try again.')
    } finally {
      setParsing(false)
    }
  }

  const exampleSMS = `Dear Customer, Rs.2,450.00 debited from A/c **1234 on 02-Mar-26 at SWIGGY*BANGALORE. Avbl Bal: Rs.45,230.50. UPI Ref No 123456789012.`

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Parse Bank SMS</h3>
          <p className="text-sm text-gray-600">Paste your bank transaction SMS below</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* SMS Input */}
      <textarea
        value={smsText}
        onChange={(e) => setSmsText(e.target.value)}
        placeholder={`Paste SMS here...\n\nExample:\n${exampleSMS}`}
        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
      />

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Supported Banks */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Supported banks:</p>
        <div className="flex flex-wrap gap-2">
          {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'PNB', 'BOB', 'Paytm', 'PhonePe', 'GPay'].map((bank) => (
            <span
              key={bank}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {bank}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleParse}
          disabled={parsing || !smsText.trim()}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            parsing || !smsText.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {parsing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Parsing...
            </span>
          ) : (
            '✨ Parse SMS'
          )}
        </button>
        <button
          onClick={() => setSmsText(exampleSMS)}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Try Example
        </button>
      </div>

      {/* How it works */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">🔒 Privacy First</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Your SMS is processed using AI, not stored</li>
          <li>• Only transaction details are saved</li>
          <li>• Bank account numbers are masked</li>
          <li>• SMS text is never logged or shared</li>
        </ul>
      </div>
    </div>
  )
}
