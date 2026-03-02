/**
 * Transaction Model
 * All financial transactions (expenses, income, investments)
 */

import mongoose, { Schema, Model } from 'mongoose'

export interface ITransaction {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  bankAccountId?: mongoose.Types.ObjectId
  
  // Transaction Details
  amount: number
  type: 'debit' | 'credit'
  transactionType: 'upi' | 'card' | 'neft' | 'imps' | 'atm' | 'cash' | 'sip' | 'emi'
  
  // Merchant/Counterparty
  merchantName?: string
  merchantCleanName?: string
  merchantCategory?: string
  upiId?: string
  
  // Categorization
  category: string
  subcategory?: string
  categoryConfidence: number // 0-100
  isUserCorrected: boolean
  tags: string[]
  
  // Description
  description?: string
  note?: string
  
  // Source Detection
  source: 'sms' | 'email' | 'manual' | 'api'
  sourceRaw?: string // Encrypted SMS/email text
  
  // Recurring Detection
  isRecurring: boolean
  recurringPattern?: 'monthly' | 'weekly' | 'yearly'
  subscriptionId?: mongoose.Types.ObjectId
  
  // Investment/SIP
  isInvestment: boolean
  investmentId?: mongoose.Types.ObjectId
  
  // Dates
  transactionDate: Date
  detectedAt: Date
  
  // Cash Tracking
  isCashWithdrawal: boolean
  cashWalletId?: mongoose.Types.ObjectId
  
  // Split Transactions
  isSplit: boolean
  splitWith: mongoose.Types.ObjectId[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bankAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'BankAccount',
      index: true,
    },
    
    amount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    type: {
      type: String,
      enum: ['debit', 'credit'],
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['upi', 'card', 'neft', 'imps', 'atm', 'cash', 'sip', 'emi'],
      required: true,
    },
    
    merchantName: {
      type: String,
      index: true,
    },
    merchantCleanName: String,
    merchantCategory: String,
    upiId: String,
    
    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: String,
    categoryConfidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isUserCorrected: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    
    description: String,
    note: String,
    
    source: {
      type: String,
      enum: ['sms', 'email', 'manual', 'api'],
      required: true,
    },
    sourceRaw: String,
    
    isRecurring: {
      type: Boolean,
      default: false,
      index: true,
    },
    recurringPattern: {
      type: String,
      enum: ['monthly', 'weekly', 'yearly'],
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    
    isInvestment: {
      type: Boolean,
      default: false,
    },
    investmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Investment',
    },
    
    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    
    isCashWithdrawal: {
      type: Boolean,
      default: false,
    },
    cashWalletId: {
      type: Schema.Types.ObjectId,
      ref: 'CashWallet',
    },
    
    isSplit: {
      type: Boolean,
      default: false,
    },
    splitWith: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Compound Indexes for analytics queries
TransactionSchema.index({ userId: 1, transactionDate: -1 })
TransactionSchema.index({ userId: 1, category: 1 })
TransactionSchema.index({ userId: 1, merchantName: 1 })
TransactionSchema.index({ userId: 1, transactionDate: -1, category: 1 })
TransactionSchema.index({ transactionDate: -1 })
TransactionSchema.index({ isRecurring: 1, userId: 1 })

export const Transaction: Model<ITransaction> = 
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema)

export default Transaction
