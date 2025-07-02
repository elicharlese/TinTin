import { z } from 'zod'

// Transaction schemas
export const TransactionSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().min(1).max(255),
  amount: z.number(),
  date: z.string().datetime(),
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  tags: z.array(z.string().uuid()).optional(),
  notes: z.string().max(1000).optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(['none', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom']).default('none'),
  recurrenceCustomDays: z.number().optional(),
  recurrenceEndDate: z.string().datetime().optional(),
  isReviewed: z.boolean().default(true),
  userId: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const CreateTransactionSchema = TransactionSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const UpdateTransactionSchema = TransactionSchema.partial().omit({ id: true, userId: true })

// Account schemas
export const AccountSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  type: z.enum(['checking', 'savings', 'credit', 'investment', 'crypto']),
  balance: z.number().default(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  isActive: z.boolean().default(true),
  userId: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const CreateAccountSchema = AccountSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const UpdateAccountSchema = AccountSchema.partial().omit({ id: true, userId: true })

// Category schemas
export const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  parentId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const CreateCategorySchema = CategorySchema.omit({ id: true, createdAt: true, updatedAt: true })
export const UpdateCategorySchema = CategorySchema.partial().omit({ id: true, userId: true })

// Tag schemas
export const TagSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  userId: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const CreateTagSchema = TagSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const UpdateTagSchema = TagSchema.partial().omit({ id: true, userId: true })

// Budget schemas
export const BudgetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  period: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  categoryIds: z.array(z.string().uuid()),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  userId: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const CreateBudgetSchema = BudgetSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const UpdateBudgetSchema = BudgetSchema.partial().omit({ id: true, userId: true })

// Goal schemas
export const GoalSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  targetAmount: z.number().positive(),
  currentAmount: z.number().default(0),
  targetDate: z.string().datetime(),
  isCompleted: z.boolean().default(false),
  userId: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const CreateGoalSchema = GoalSchema.omit({ id: true, createdAt: true, updatedAt: true, currentAmount: true, isCompleted: true })
export const UpdateGoalSchema = GoalSchema.partial().omit({ id: true, userId: true })

// Alert schemas
export const AlertSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(['budget_exceeded', 'low_balance', 'goal_reached', 'unusual_spending', 'bill_reminder']),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  severity: z.enum(['info', 'warning', 'error']),
  isRead: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const CreateAlertSchema = AlertSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const UpdateAlertSchema = AlertSchema.partial().omit({ id: true, userId: true })

// Crypto Asset schemas
export const CryptoAssetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(10),
  marketType: z.enum(['cefi', 'defi']),
  amount: z.number().positive(),
  usdValue: z.number(),
  priceUsd: z.number(),
  network: z.string().min(1).max(50),
  walletId: z.string().min(1).max(100),
  protocol: z.string().max(50).optional(),
  isStaked: z.boolean().default(false),
  stakingApy: z.number().optional(),
  lastUpdated: z.string().datetime(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const CreateCryptoAssetSchema = CryptoAssetSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const UpdateCryptoAssetSchema = CryptoAssetSchema.partial().omit({ id: true, userId: true })

// Query schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const TransactionQuerySchema = PaginationSchema.extend({
  search: z.string().optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isRecurring: z.coerce.boolean().optional(),
  isReviewed: z.coerce.boolean().optional(),
  sortBy: z.enum(['date', 'amount', 'description']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Response schemas
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
})

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.any().optional(),
  }),
})

export const PaginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// Type exports
export type Transaction = z.infer<typeof TransactionSchema>
export type CreateTransaction = z.infer<typeof CreateTransactionSchema>
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>

export type Account = z.infer<typeof AccountSchema>
export type CreateAccount = z.infer<typeof CreateAccountSchema>
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>

export type Category = z.infer<typeof CategorySchema>
export type CreateCategory = z.infer<typeof CreateCategorySchema>
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>

export type Tag = z.infer<typeof TagSchema>
export type CreateTag = z.infer<typeof CreateTagSchema>
export type UpdateTag = z.infer<typeof UpdateTagSchema>

export type Budget = z.infer<typeof BudgetSchema>
export type CreateBudget = z.infer<typeof CreateBudgetSchema>
export type UpdateBudget = z.infer<typeof UpdateBudgetSchema>

export type Goal = z.infer<typeof GoalSchema>
export type CreateGoal = z.infer<typeof CreateGoalSchema>
export type UpdateGoal = z.infer<typeof UpdateGoalSchema>

export type Alert = z.infer<typeof AlertSchema>
export type CreateAlert = z.infer<typeof CreateAlertSchema>
export type UpdateAlert = z.infer<typeof UpdateAlertSchema>

export type CryptoAsset = z.infer<typeof CryptoAssetSchema>
export type CreateCryptoAsset = z.infer<typeof CreateCryptoAssetSchema>
export type UpdateCryptoAsset = z.infer<typeof UpdateCryptoAssetSchema>

export type TransactionQuery = z.infer<typeof TransactionQuerySchema>
export type Pagination = z.infer<typeof PaginationSchema>

export type SuccessResponse<T = any> = {
  success: true
  data: T
  message?: string
}

export type ErrorResponse = {
  success: false
  error: {
    message: string
    code?: string
    details?: any
  }
}

export type PaginatedResponse<T = any> = {
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
