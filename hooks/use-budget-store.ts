"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "@/components/ui/use-toast"

export type CategoryType = "income" | "expense"
export type AccountType = "checking" | "savings" | "credit" | "investment" | "cash" | "other"
export type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly" | "custom"

export interface Category {
  id: string
  name: string
  type: CategoryType
  parentId: string | null
  color?: string
  icon?: string
  isHidden?: boolean
}

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  institution?: string
  lastUpdated?: string
  isHidden?: boolean
  color?: string
  icon?: string
}

export interface Transaction {
  id: string
  date: string
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
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  color?: string
}

export interface BudgetPeriod {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

export interface Budget {
  id: string
  categoryId: string
  periodId: string
  amount: number
}

export interface UserSettings {
  currency: string
  dateFormat: string
  theme: "light" | "dark" | "system"
  defaultAccount: string | null
  defaultView: "transactions" | "dashboard" | "reports"
  hideZeroTransactions: boolean
  showRunningBalance: boolean
}

interface BudgetStore {
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
  tags: Tag[]
  budgetPeriods: BudgetPeriod[]
  budgets: Budget[]
  settings: UserSettings
  isLoading: boolean
  error: string | null

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => string
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>) => boolean
  deleteTransaction: (id: string) => boolean
  bulkDeleteTransactions: (ids: string[]) => boolean
  duplicateTransaction: (id: string) => string | null

  // Category actions
  addCategory: (category: Omit<Category, "id">) => string
  updateCategory: (id: string, category: Partial<Omit<Category, "id">>) => boolean
  deleteCategory: (id: string) => boolean
  mergeCategories: (sourceId: string, targetId: string) => boolean

  // Account actions
  addAccount: (account: Omit<Account, "id">) => string
  updateAccount: (id: string, account: Partial<Omit<Account, "id">>) => boolean
  deleteAccount: (id: string) => boolean

  // Tag actions
  addTag: (tag: Omit<Tag, "id">) => string
  updateTag: (id: string, tag: Partial<Omit<Tag, "id">>) => boolean
  deleteTag: (id: string) => boolean

  // Budget actions
  addBudget: (budget: Omit<Budget, "id">) => string
  updateBudget: (id: string, budget: Partial<Omit<Budget, "id">>) => boolean
  deleteBudget: (id: string) => boolean

  // Budget period actions
  addBudgetPeriod: (period: Omit<BudgetPeriod, "id">) => string
  updateBudgetPeriod: (id: string, period: Partial<Omit<BudgetPeriod, "id">>) => boolean
  deleteBudgetPeriod: (id: string) => boolean

  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void

  // Data actions
  exportData: () => string
  importData: (data: string) => boolean
  resetData: () => void
}

// Default categories
const defaultCategories: Category[] = [
  { id: "income", name: "Income", type: "income", parentId: null, color: "#4ade80" },
  { id: "salary", name: "Salary", type: "income", parentId: "income", color: "#22c55e" },
  { id: "freelance", name: "Freelance", type: "income", parentId: "income", color: "#16a34a" },
  { id: "other-income", name: "Other Income", type: "income", parentId: "income", color: "#15803d" },

  { id: "expenses", name: "Expenses", type: "expense", parentId: null, color: "#f87171" },
  { id: "housing", name: "Housing", type: "expense", parentId: "expenses", color: "#ef4444" },
  { id: "rent", name: "Rent", type: "expense", parentId: "housing", color: "#dc2626" },
  { id: "utilities", name: "Utilities", type: "expense", parentId: "housing", color: "#b91c1c" },

  { id: "food", name: "Food", type: "expense", parentId: "expenses", color: "#fb923c" },
  { id: "groceries", name: "Groceries", type: "expense", parentId: "food", color: "#f97316" },
  { id: "dining", name: "Dining Out", type: "expense", parentId: "food", color: "#ea580c" },

  { id: "transportation", name: "Transportation", type: "expense", parentId: "expenses", color: "#60a5fa" },
  { id: "car", name: "Car", type: "expense", parentId: "transportation", color: "#3b82f6" },
  { id: "public", name: "Public Transit", type: "expense", parentId: "transportation", color: "#2563eb" },

  { id: "entertainment", name: "Entertainment", type: "expense", parentId: "expenses", color: "#c084fc" },
  { id: "subscriptions", name: "Subscriptions", type: "expense", parentId: "entertainment", color: "#a855f7" },

  { id: "health", name: "Health", type: "expense", parentId: "expenses", color: "#4ade80" },
  { id: "medical", name: "Medical", type: "expense", parentId: "health", color: "#22c55e" },

  { id: "personal", name: "Personal", type: "expense", parentId: "expenses", color: "#facc15" },
  { id: "clothing", name: "Clothing", type: "expense", parentId: "personal", color: "#eab308" },
]

// Default accounts
const defaultAccounts: Account[] = [
  {
    id: "checking",
    name: "Checking Account",
    type: "checking",
    balance: 2500,
    institution: "Bank of America",
    color: "#3b82f6",
  },
  {
    id: "savings",
    name: "Savings Account",
    type: "savings",
    balance: 10000,
    institution: "Bank of America",
    color: "#22c55e",
  },
  { id: "credit", name: "Credit Card", type: "credit", balance: -500, institution: "Chase", color: "#f43f5e" },
]

// Default tags
const defaultTags: Tag[] = [
  { id: "tax-deductible", name: "Tax Deductible", color: "#22c55e" },
  { id: "reimbursable", name: "Reimbursable", color: "#3b82f6" },
  { id: "vacation", name: "Vacation", color: "#f59e0b" },
]

// Default budget periods
const defaultBudgetPeriods: BudgetPeriod[] = [
  {
    id: "current-month",
    name: "Current Month",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
    isActive: true,
  },
]

// Default budgets
const defaultBudgets: Budget[] = [
  { id: "rent-budget", categoryId: "rent", periodId: "current-month", amount: 1500 },
  { id: "groceries-budget", categoryId: "groceries", periodId: "current-month", amount: 400 },
  { id: "dining-budget", categoryId: "dining", periodId: "current-month", amount: 200 },
]

// Default settings
const defaultSettings: UserSettings = {
  currency: "USD",
  dateFormat: "MM/dd/yyyy",
  theme: "dark",
  defaultAccount: "checking",
  defaultView: "transactions",
  hideZeroTransactions: false,
  showRunningBalance: true,
}

// Sample transactions
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    date: "2023-05-01",
    description: "Monthly Salary",
    amount: 5000,
    categoryId: "salary",
    accountId: "checking",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReviewed: true,
  },
  {
    id: "2",
    date: "2023-05-02",
    description: "Rent Payment",
    amount: -1500,
    categoryId: "rent",
    accountId: "checking",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReviewed: true,
    isRecurring: true,
    recurrenceType: "monthly",
  },
  {
    id: "3",
    date: "2023-05-03",
    description: "Grocery Shopping",
    amount: -120,
    categoryId: "groceries",
    accountId: "credit",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReviewed: true,
  },
  {
    id: "4",
    date: "2023-05-03",
    description: "Freelance Project",
    amount: 800,
    categoryId: "freelance",
    accountId: "checking",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReviewed: true,
    tags: ["tax-deductible"],
  },
  {
    id: "5",
    date: "2023-05-03",
    description: "Dinner with Friends",
    amount: -75,
    categoryId: "dining",
    accountId: "credit",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReviewed: false,
  },
  {
    id: "6",
    date: "2023-05-10",
    description: "Gas",
    amount: -45,
    categoryId: "car",
    accountId: "credit",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReviewed: true,
  },
  {
    id: "7",
    date: "2023-05-15",
    description: "Netflix Subscription",
    amount: -15,
    categoryId: "subscriptions",
    accountId: "credit",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReviewed: true,
    isRecurring: true,
    recurrenceType: "monthly",
  },
  {
    id: "8",
    date: "2023-05-20",
    description: "Doctor Visit",
    amount: -100,
    categoryId: "medical",
    accountId: "checking",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReviewed: true,
    tags: ["reimbursable"],
  },
  {
    id: "9",
    date: "2023-05-25",
    description: "New Shoes",
    amount: -85,
    categoryId: "clothing",
    accountId: "credit",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReviewed: true,
  },
  {
    id: "10",
    date: "2023-05-28",
    description: "Electric Bill",
    amount: -120,
    categoryId: "utilities",
    accountId: "checking",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReviewed: true,
    isRecurring: true,
    recurrenceType: "monthly",
  },
]

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      transactions: sampleTransactions,
      categories: defaultCategories,
      accounts: defaultAccounts,
      tags: defaultTags,
      budgetPeriods: defaultBudgetPeriods,
      budgets: defaultBudgets,
      settings: defaultSettings,
      isLoading: false,
      error: null,

      // Transaction actions
      addTransaction: (transaction) => {
        try {
          const id = crypto.randomUUID()
          const now = new Date().toISOString()

          set((state) => ({
            transactions: [
              ...state.transactions,
              {
                ...transaction,
                id,
                createdAt: now,
                updatedAt: now,
              },
            ],
          }))

          toast({
            title: "Transaction added",
            description: "Transaction has been added successfully",
          })

          return id
        } catch (error) {
          set({ error: "Failed to add transaction" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add transaction",
          })
          return ""
        }
      },

      updateTransaction: (id, transaction) => {
        try {
          const now = new Date().toISOString()

          set((state) => ({
            transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...transaction, updatedAt: now } : t)),
          }))

          toast({
            title: "Transaction updated",
            description: "Transaction has been updated successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to update transaction" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update transaction",
          })
          return false
        }
      },

      deleteTransaction: (id) => {
        try {
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
          }))

          toast({
            title: "Transaction deleted",
            description: "Transaction has been deleted successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to delete transaction" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete transaction",
          })
          return false
        }
      },

      bulkDeleteTransactions: (ids) => {
        try {
          set((state) => ({
            transactions: state.transactions.filter((t) => !ids.includes(t.id)),
          }))

          toast({
            title: "Transactions deleted",
            description: `${ids.length} transactions have been deleted`,
          })

          return true
        } catch (error) {
          set({ error: "Failed to delete transactions" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete transactions",
          })
          return false
        }
      },

      duplicateTransaction: (id) => {
        try {
          const transaction = get().transactions.find((t) => t.id === id)
          if (!transaction) return null

          const newId = crypto.randomUUID()
          const now = new Date().toISOString()

          set((state) => ({
            transactions: [
              ...state.transactions,
              {
                ...transaction,
                id: newId,
                description: `Copy of ${transaction.description}`,
                createdAt: now,
                updatedAt: now,
              },
            ],
          }))

          toast({
            title: "Transaction duplicated",
            description: "Transaction has been duplicated successfully",
          })

          return newId
        } catch (error) {
          set({ error: "Failed to duplicate transaction" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to duplicate transaction",
          })
          return null
        }
      },

      // Category actions
      addCategory: (category) => {
        try {
          const id = crypto.randomUUID()

          set((state) => ({
            categories: [...state.categories, { ...category, id }],
          }))

          toast({
            title: "Category added",
            description: "Category has been added successfully",
          })

          return id
        } catch (error) {
          set({ error: "Failed to add category" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add category",
          })
          return ""
        }
      },

      updateCategory: (id, category) => {
        try {
          set((state) => ({
            categories: state.categories.map((c) => (c.id === id ? { ...c, ...category } : c)),
          }))

          toast({
            title: "Category updated",
            description: "Category has been updated successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to update category" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update category",
          })
          return false
        }
      },

      deleteCategory: (id) => {
        try {
          // Check if category is used in transactions
          const transactions = get().transactions
          const hasTransactions = transactions.some((t) => t.categoryId === id)

          if (hasTransactions) {
            toast({
              variant: "destructive",
              title: "Cannot delete category",
              description: "This category is used in transactions",
            })
            return false
          }

          // Check if category has children
          const categories = get().categories
          const hasChildren = categories.some((c) => c.parentId === id)

          if (hasChildren) {
            toast({
              variant: "destructive",
              title: "Cannot delete category",
              description: "This category has subcategories",
            })
            return false
          }

          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
          }))

          toast({
            title: "Category deleted",
            description: "Category has been deleted successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to delete category" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete category",
          })
          return false
        }
      },

      mergeCategories: (sourceId, targetId) => {
        try {
          // Update all transactions with sourceId to targetId
          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.categoryId === sourceId ? { ...t, categoryId: targetId } : t,
            ),
          }))

          // Delete source category
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== sourceId),
          }))

          toast({
            title: "Categories merged",
            description: "Categories have been merged successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to merge categories" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to merge categories",
          })
          return false
        }
      },

      // Account actions
      addAccount: (account) => {
        try {
          const id = crypto.randomUUID()

          set((state) => ({
            accounts: [...state.accounts, { ...account, id }],
          }))

          toast({
            title: "Account added",
            description: "Account has been added successfully",
          })

          return id
        } catch (error) {
          set({ error: "Failed to add account" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add account",
          })
          return ""
        }
      },

      updateAccount: (id, account) => {
        try {
          set((state) => ({
            accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...account } : a)),
          }))

          toast({
            title: "Account updated",
            description: "Account has been updated successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to update account" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update account",
          })
          return false
        }
      },

      deleteAccount: (id) => {
        try {
          // Check if account is used in transactions
          const transactions = get().transactions
          const hasTransactions = transactions.some((t) => t.accountId === id)

          if (hasTransactions) {
            toast({
              variant: "destructive",
              title: "Cannot delete account",
              description: "This account is used in transactions",
            })
            return false
          }

          set((state) => ({
            accounts: state.accounts.filter((a) => a.id !== id),
          }))

          toast({
            title: "Account deleted",
            description: "Account has been deleted successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to delete account" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete account",
          })
          return false
        }
      },

      // Tag actions
      addTag: (tag) => {
        try {
          const id = crypto.randomUUID()

          set((state) => ({
            tags: [...state.tags, { ...tag, id }],
          }))

          toast({
            title: "Tag added",
            description: "Tag has been added successfully",
          })

          return id
        } catch (error) {
          set({ error: "Failed to add tag" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add tag",
          })
          return ""
        }
      },

      updateTag: (id, tag) => {
        try {
          set((state) => ({
            tags: state.tags.map((t) => (t.id === id ? { ...t, ...tag } : t)),
          }))

          toast({
            title: "Tag updated",
            description: "Tag has been updated successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to update tag" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update tag",
          })
          return false
        }
      },

      deleteTag: (id) => {
        try {
          // Remove tag from all transactions
          set((state) => ({
            transactions: state.transactions.map((t) => {
              if (t.tags && t.tags.includes(id)) {
                return {
                  ...t,
                  tags: t.tags.filter((tagId) => tagId !== id),
                  updatedAt: new Date().toISOString(),
                }
              }
              return t
            }),
          }))

          // Delete tag
          set((state) => ({
            tags: state.tags.filter((t) => t.id !== id),
          }))

          toast({
            title: "Tag deleted",
            description: "Tag has been deleted successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to delete tag" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete tag",
          })
          return false
        }
      },

      // Budget actions
      addBudget: (budget) => {
        try {
          const id = crypto.randomUUID()

          set((state) => ({
            budgets: [...state.budgets, { ...budget, id }],
          }))

          toast({
            title: "Budget added",
            description: "Budget has been added successfully",
          })

          return id
        } catch (error) {
          set({ error: "Failed to add budget" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add budget",
          })
          return ""
        }
      },

      updateBudget: (id, budget) => {
        try {
          set((state) => ({
            budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...budget } : b)),
          }))

          toast({
            title: "Budget updated",
            description: "Budget has been updated successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to update budget" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update budget",
          })
          return false
        }
      },

      deleteBudget: (id) => {
        try {
          set((state) => ({
            budgets: state.budgets.filter((b) => b.id !== id),
          }))

          toast({
            title: "Budget deleted",
            description: "Budget has been deleted successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to delete budget" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete budget",
          })
          return false
        }
      },

      // Budget period actions
      addBudgetPeriod: (period) => {
        try {
          const id = crypto.randomUUID()

          set((state) => ({
            budgetPeriods: [...state.budgetPeriods, { ...period, id }],
          }))

          toast({
            title: "Budget period added",
            description: "Budget period has been added successfully",
          })

          return id
        } catch (error) {
          set({ error: "Failed to add budget period" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add budget period",
          })
          return ""
        }
      },

      updateBudgetPeriod: (id, period) => {
        try {
          set((state) => ({
            budgetPeriods: state.budgetPeriods.map((p) => (p.id === id ? { ...p, ...period } : p)),
          }))

          toast({
            title: "Budget period updated",
            description: "Budget period has been updated successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to update budget period" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update budget period",
          })
          return false
        }
      },

      deleteBudgetPeriod: (id) => {
        try {
          // Check if budget period is used in budgets
          const budgets = get().budgets
          const hasBudgets = budgets.some((b) => b.periodId === id)

          if (hasBudgets) {
            toast({
              variant: "destructive",
              title: "Cannot delete budget period",
              description: "This budget period is used in budgets",
            })
            return false
          }

          set((state) => ({
            budgetPeriods: state.budgetPeriods.filter((p) => p.id !== id),
          }))

          toast({
            title: "Budget period deleted",
            description: "Budget period has been deleted successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to delete budget period" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete budget period",
          })
          return false
        }
      },

      // Settings actions
      updateSettings: (settings) => {
        try {
          set((state) => ({
            settings: {
              ...state.settings,
              ...settings,
            },
          }))

          return true
        } catch (error) {
          set({ error: "Failed to update settings" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update settings",
          })
          return false
        }
      },

      // Data actions
      exportData: () => {
        try {
          const state = get()
          const data = {
            transactions: state.transactions,
            categories: state.categories,
            accounts: state.accounts,
            tags: state.tags,
            budgetPeriods: state.budgetPeriods,
            budgets: state.budgets,
            settings: state.settings,
            exportDate: new Date().toISOString(),
            version: "1.0.0",
          }

          return JSON.stringify(data)
        } catch (error) {
          set({ error: "Failed to export data" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to export data",
          })
          return ""
        }
      },

      importData: (data) => {
        try {
          const parsedData = JSON.parse(data)

          // Validate data structure
          if (!parsedData.transactions || !parsedData.categories || !parsedData.accounts) {
            toast({
              variant: "destructive",
              title: "Invalid data format",
              description: "The imported data is not in a valid format",
            })
            return false
          }

          set({
            transactions: parsedData.transactions || [],
            categories: parsedData.categories || [],
            accounts: parsedData.accounts || [],
            tags: parsedData.tags || [],
            budgetPeriods: parsedData.budgetPeriods || [],
            budgets: parsedData.budgets || [],
            settings: parsedData.settings || defaultSettings,
          })

          toast({
            title: "Data imported",
            description: "Data has been imported successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to import data" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to import data",
          })
          return false
        }
      },

      resetData: () => {
        try {
          set({
            transactions: sampleTransactions,
            categories: defaultCategories,
            accounts: defaultAccounts,
            tags: defaultTags,
            budgetPeriods: defaultBudgetPeriods,
            budgets: defaultBudgets,
            settings: defaultSettings,
            error: null,
          })

          toast({
            title: "Data reset",
            description: "All data has been reset to defaults",
          })

          return true
        } catch (error) {
          set({ error: "Failed to reset data" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to reset data",
          })
          return false
        }
      },
    }),
    {
      name: "budget-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        categories: state.categories,
        accounts: state.accounts,
        tags: state.tags,
        budgetPeriods: state.budgetPeriods,
        budgets: state.budgets,
        settings: state.settings,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state.isLoading = false
          }
        }
      },
    },
  ),
)

