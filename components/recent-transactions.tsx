"use client"

import { useMemo } from "react"
import { format, parseISO } from "date-fns"
import { useBudgetStore } from "@/hooks/use-budget-store"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface RecentTransactionsProps {
  limit?: number
}

export function RecentTransactions({ limit = 5 }: RecentTransactionsProps) {
  const { transactions, categories, accounts } = useBudgetStore()

  // Get recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
  }, [transactions, limit])

  if (recentTransactions.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No transactions found</div>
  }

  return (
    <div className="space-y-4">
      {recentTransactions.map((transaction) => {
        const category = categories.find((c) => c.id === transaction.categoryId)
        const account = accounts.find((a) => a.id === transaction.accountId)

        return (
          <div key={transaction.id} className="flex items-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: category?.color || "#888888" }}
            >
              {transaction.amount >= 0 ? (
                <ArrowUpRight className="h-5 w-5 text-white" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{transaction.description}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <span>{format(parseISO(transaction.date), "MMM d, yyyy")}</span>
                <span className="mx-1">•</span>
                <span>{category?.name || "Uncategorized"}</span>
                <span className="mx-1">•</span>
                <span>{account?.name || "Unknown Account"}</span>
              </div>
            </div>
            <div className={`font-medium ${transaction.amount >= 0 ? "text-green-500" : ""}`}>
              {transaction.amount >= 0 ? "+" : ""}
              {transaction.amount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

