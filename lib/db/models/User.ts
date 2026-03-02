/**
 * User Model
 * Core user account and preferences
 */

import mongoose, { Schema, Model } from 'mongoose'

export interface IUser {
  _id: mongoose.Types.ObjectId
  email: string
  phone?: string
  passwordHash: string
  name: string
  profilePicture?: string
  
  // Preferences
  preferences: {
    currency: string
    dateFormat: string
    language: string
    theme: string
    notificationsEnabled: boolean
    biometricEnabled: boolean
  }
  
  // Security
  refreshToken?: string
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  lastLogin?: Date
  
  // Onboarding
  onboardingCompleted: boolean
  onboardingStep: number
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: String,
    
    preferences: {
      currency: {
        type: String,
        default: 'INR',
      },
      dateFormat: {
        type: String,
        default: 'DD/MM/YYYY',
      },
      language: {
        type: String,
        default: 'en',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      biometricEnabled: {
        type: Boolean,
        default: false,
      },
    },
    
    refreshToken: String,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    lastLogin: Date,
    
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 0,
    },
    
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ phone: 1 }, { unique: true, sparse: true })
UserSchema.index({ createdAt: -1 })
UserSchema.index({ deletedAt: 1 })

// Soft delete filter
UserSchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.where({ deletedAt: null })
  next()
})

// Export model
export const User: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
