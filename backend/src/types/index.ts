/**
 * Type definitions for the TinTin backend application
 * These types match the frontend types and extend them for backend-specific functionality
 */

// Base Types
export type CategoryType = 'income' | 'expense'
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

// Database Entities
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  preferences?: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  currency: string
  locale: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    shareData: boolean
    analytics: boolean
  }
}

export interface Category {
  id: string
  userId: string
  name: string
  type: CategoryType
  parentId?: string
  color?: string
  icon?: string
  isHidden?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  balance: number
  institution?: string
  accountNumber?: string
  routingNumber?: string
  isHidden?: boolean
  color?: string
  icon?: string
  plaidItemId?: string
  plaidAccountId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  userId: string
  date: Date
  description: string
  amount: number
  categoryId: string
  accountId: string
  notes?: string
  isRecurring?: boolean
  recurrenceType?: RecurrenceType
  recurrenceCustomDays?: number
  tags?: string[]
  isExcludedFromReports?: boolean
  isReviewed?: boolean
  attachments?: string[]
  plaidTransactionId?: string
  merchantName?: string
  merchantCategory?: string
  location?: {
    address?: string
    city?: string
    region?: string
    postalCode?: string
    country?: string
    lat?: number
    lon?: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  userId: string
  name: string
  color?: string
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  id: string
  userId: string
  name: string
  description?: string
  amount: number
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  categoryIds: string[]
  startDate: Date
  endDate?: Date
  isActive: boolean
  alertThreshold?: number
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  userId: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  targetDate?: Date
  categoryId?: string
  priority: 'low' | 'medium' | 'high'
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Alert {
  id: string
  userId: string
  type: 'budget_exceeded' | 'goal_reached' | 'unusual_spending' | 'low_balance' | 'bill_reminder' | 'custom'
  title: string
  message: string
  severity: 'info' | 'warning' | 'error'
  isRead: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Crypto Types
export interface CryptoWallet {
  id: string
  userId: string
  name: string
  type: 'hot' | 'cold' | 'exchange' | 'defi'
  address?: string
  network: string
  balance: number
  exchange?: string
  color?: string
  icon?: string
  createdAt: Date
  updatedAt: Date
}

export interface CryptoAsset {
  id: string
  userId: string
  name: string
  symbol: string
  amount: number
  usdValue: number
  priceUsd: number
  network: string
  walletId: string
  contractAddress?: string
  isStaked?: boolean
  stakingApy?: number
  protocol?: string
  marketData?: {
    change24h: number
    change7d: number
    high24h: number
    low24h: number
    marketCap: number
    volume24h: number
  }
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

// Request Types
export interface CreateTransactionRequest {
  date: string
  description: string
  amount: number
  category_id: string  // Match database schema
  account_id: string   // Match database schema
  notes?: string
  isRecurring?: boolean
  recurrenceType?: RecurrenceType
  recurrenceCustomDays?: number
  tag_ids?: string[]   // Match database schema
}

export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {
  isReviewed?: boolean
  attachments?: string[]
}

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  categoryId?: string
  accountId?: string
  tags?: string[]
  minAmount?: number
  maxAmount?: number
  isRecurring?: boolean
  isReviewed?: boolean
  search?: string
  type?: 'income' | 'expense'
}

export interface TransactionSummary {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  transactionCount: number
  averageTransaction: number
  categoryBreakdown: {
    categoryId: string
    categoryName: string
    amount: number
    percentage: number
  }[]
}

export interface CreateCategoryRequest {
  name: string
  type: CategoryType
  parentId?: string
  color?: string
  icon?: string
}

export interface CreateAccountRequest {
  name: string
  type: AccountType
  balance: number
  institution?: string
  color?: string
  icon?: string
}

// Solana Types
export interface SolanaTransaction {
  signature: string
  slot: number
  blockTime: number
  fee: number
  status: 'success' | 'failed'
  instructions: SolanaInstruction[]
}

export interface SolanaInstruction {
  programId: string
  accounts: string[]
  data: string
}

export interface SolanaAsset {
  mint: string
  amount: number
  decimals: number
  tokenAccount: string
}

// Job Types
export interface JobData {
  userId?: string
  type: string
  payload: Record<string, any>
}

export interface SyncJobData extends JobData {
  type: 'sync_crypto_prices' | 'sync_plaid_transactions' | 'generate_reports'
}

// Webhook Types
export interface PlaidWebhookData {
  webhook_type: string
  webhook_code: string
  item_id: string
  error?: any
  new_transactions?: number
  removed_transactions?: string[]
}

// Error Types
export interface AppError extends Error {
  statusCode: number
  isOperational: boolean
}

export class ValidationError extends Error {
  statusCode = 400
  isOperational = true
  
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  statusCode = 404
  isOperational = true
  
  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401
  isOperational = true
  
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  statusCode = 403
  isOperational = true
  
  constructor(message: string = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}
