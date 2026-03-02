/**
 * Category Model
 * Transaction categories (system + user custom)
 */

import mongoose, { Schema, Model } from 'mongoose'

export interface ICategory {
  _id: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId // null for system categories
  
  // Category Details
  name: string
  icon: string
  color: string
  
  // Hierarchy
  parentCategoryId?: mongoose.Types.ObjectId
  isSubcategory: boolean
  
  // Type
  isSystemCategory: boolean
  isCustomCategory: boolean
  
  // AI Learning
  keywords: string[]
  merchantPatterns: string[]
  
  // Usage Stats
  transactionCount: number
  totalAmount: number
  lastUsed?: Date
  
  // Metadata
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    
    name: {
      type: String,
      required: true,
      index: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    isSubcategory: {
      type: Boolean,
      default: false,
    },
    
    isSystemCategory: {
      type: Boolean,
      default: false,
    },
    isCustomCategory: {
      type: Boolean,
      default: false,
    },
    
    keywords: {
      type: [String],
      default: [],
    },
    merchantPatterns: {
      type: [String],
      default: [],
    },
    
    transactionCount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    lastUsed: Date,
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
CategorySchema.index({ userId: 1, isActive: 1 })
CategorySchema.index({ name: 1 })

export const Category: Model<ICategory> = 
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)

export default Category
