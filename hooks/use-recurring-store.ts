import { create } from "zustand"
import { persist } from "zustand/middleware"

export type RecurringTransaction = {
  id: string
  name: string
  amount: number
  type: "income" | "expense" | "credit"
  category?: string
  account?: string
  nextDate: Date
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  isActive: boolean
  syncedVia?: string
  daysUntilNext?: number
}

type RecurringStore = {
  recurringTransactions: RecurringTransaction[]
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, "id">) => void
  updateRecurringTransaction: (id: string, transaction: Partial<RecurringTransaction>) => void
  deleteRecurringTransaction: (id: string) => void
}

export const useRecurringStore = create<RecurringStore>()(
  persist(
    (set) => ({
      recurringTransactions: [
        {
          id: "1",
          name: "QuicksilverOne",
          amount: 121,
          type: "expense",
          nextDate: new Date(2025, 2, 23),
          frequency: "monthly",
          isActive: true,
          syncedVia: "credit report",
          daysUntilNext: 4,
        },
        {
          id: "2",
          name: "Salary",
          amount: 3660,
          type: "income",
          category: "Income",
          account: "Checking",
          nextDate: new Date(2025, 2, 30),
          frequency: "monthly",
          isActive: true,
          daysUntilNext: 11,
        },
        {
          id: "3",
          name: "Rent",
          amount: 1500,
          type: "expense",
          category: "Housing",
          account: "Checking",
          nextDate: new Date(2025, 3, 1),
          frequency: "monthly",
          isActive: true,
          daysUntilNext: 13,
        },
        {
          id: "4",
          name: "Netflix",
          amount: 15.99,
          type: "expense",
          category: "Entertainment",
          account: "Credit Card",
          nextDate: new Date(2025, 2, 25),
          frequency: "monthly",
          isActive: true,
          daysUntilNext: 6,
        },
        {
          id: "5",
          name: "Internet",
          amount: 79.99,
          type: "expense",
          category: "Utilities",
          account: "Checking",
          nextDate: new Date(2025, 2, 28),
          frequency: "monthly",
          isActive: true,
          daysUntilNext: 9,
        },
      ],
      addRecurringTransaction: (transaction) =>
        set((state) => ({
          recurringTransactions: [
            ...state.recurringTransactions,
            { ...transaction, id: Math.random().toString(36).substring(2, 9) },
          ],
        })),
      updateRecurringTransaction: (id, transaction) =>
        set((state) => ({
          recurringTransactions: state.recurringTransactions.map((t) => (t.id === id ? { ...t, ...transaction } : t)),
        })),
      deleteRecurringTransaction: (id) =>
        set((state) => ({
          recurringTransactions: state.recurringTransactions.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "recurring-transactions",
    },
  ),
)

export const useRecurringSummary = () => {
  const { recurringTransactions } = useRecurringStore()

  const income = recurringTransactions
    .filter((t) => t.type === "income" && t.isActive)
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = recurringTransactions
    .filter((t) => t.type === "expense" && t.isActive)
    .reduce((sum, t) => sum + t.amount, 0)

  const creditCards = recurringTransactions
    .filter((t) => t.type === "credit" && t.isActive)
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    income,
    expenses,
    creditCards,
    incomePaid: 0,
    expensesPaid: 0,
    creditCardsPaid: 0,
    incomeRemaining: income,
    expensesRemaining: expenses,
    creditCardsRemaining: creditCards,
  }
}

