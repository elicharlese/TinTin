import type React from "react"
import { create } from "zustand"
import { useBudgetStore } from "./use-budget-store"

export type SearchResultType = "transaction" | "account" | "category" | "budget" | "goal"

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  description: string
  amount?: number
  date?: string
  icon?: React.ReactNode
  url: string
}

interface SearchState {
  query: string
  results: SearchResult[]
  isSearching: boolean
  setQuery: (query: string) => void
  search: (query: string) => void
  clearSearch: () => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: [],
  isSearching: false,

  setQuery: (query: string) => {
    set({ query })
    if (query.trim().length > 1) {
      get().search(query)
    } else {
      set({ results: [] })
    }
  },

  search: (query: string) => {
    set({ isSearching: true })

    // Simulate search delay
    setTimeout(() => {
      const budgetStore = useBudgetStore.getState()
      const results: SearchResult[] = []

      const normalizedQuery = query.toLowerCase().trim()

      // Search transactions
      budgetStore.transactions.forEach((transaction) => {
        if (
          transaction.description.toLowerCase().includes(normalizedQuery) ||
          transaction.category.toLowerCase().includes(normalizedQuery) ||
          transaction.amount.toString().includes(normalizedQuery)
        ) {
          results.push({
            id: transaction.id,
            type: "transaction",
            title: transaction.description,
            description: `${transaction.category} • ${new Date(transaction.date).toLocaleDateString()}`,
            amount: transaction.amount,
            date: transaction.date,
            url: `/transactions?id=${transaction.id}`,
          })
        }
      })

      // Search categories
      budgetStore.categories.forEach((category) => {
        if (category.name.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: category.id,
            type: "category",
            title: category.name,
            description: `Category • ${category.type}`,
            url: `/transactions?category=${category.id}`,
          })
        }
      })

      // Search accounts
      const accounts = [
        { id: "checking", name: "Checking Account", balance: 2500 },
        { id: "savings", name: "Savings Account", balance: 12000 },
        { id: "credit", name: "Credit Card", balance: -450 },
      ]

      accounts.forEach((account) => {
        if (account.name.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: account.id,
            type: "account",
            title: account.name,
            description: `Account • Balance: $${account.balance.toFixed(2)}`,
            amount: account.balance,
            url: `/accounts?id=${account.id}`,
          })
        }
      })

      // Search budgets
      budgetStore.budgets.forEach((budget) => {
        if (budget.category.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: budget.id,
            type: "budget",
            title: budget.category,
            description: `Budget • $${budget.amount.toFixed(2)}`,
            amount: budget.amount,
            url: `/budget?id=${budget.id}`,
          })
        }
      })

      set({
        results: results.slice(0, 10), // Limit to 10 results
        isSearching: false,
      })
    }, 300)
  },

  clearSearch: () => {
    set({ query: "", results: [] })
  },
}))

