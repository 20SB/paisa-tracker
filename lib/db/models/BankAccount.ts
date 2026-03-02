/**
 * BankAccount Model
 * User's bank accounts and wallets
 */

import mongoose, { Schema, Model } from 'mongoose'

export interface IBankAccount {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  
  // Account Details
  bankName: string
  accountType: 'savings' | 'current' | 'credit_card' | 'wallet'
  accountNumber?: string // Encrypted
  ifscCode?: string
  branch?: string
  
  // Balance Tracking
  currentBalance: number
  lastUpdated: Date
  
  // Metadata
  nickname?: string
  color?: string
  icon?: string
  isActive: boolean
  isPrimary: boolean
  
  createdAt: Date
  updatedAt: Date
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    bankName: {
      type: String,
      required: true,
      index: true,
    },
    accountType: {
      type: String,
      enum: ['savings', 'current', 'credit_card', 'wallet'],
      required: true,
    },
    accountNumber: String,
    ifscCode: String,
    branch: String,
    
    currentBalance: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    
    nickname: String,
    color: String,
    icon: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
BankAccountSchema.index({ userId: 1, isActive: 1 })
BankAccountSchema.index({ bankName: 1 })

export const BankAccount: Model<IBankAccount> = 
  mongoose.models.BankAccount || mongoose.model<IBankAccount>('BankAccount', BankAccountSchema)

export default BankAccount
