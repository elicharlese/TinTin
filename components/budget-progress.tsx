"use client"

import { useMemo } from "react"
import { parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns"
import { useBudgetStore } from "@/hooks/use-budget-store"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle } from "lucide-react"

export function BudgetProgress() {
  const { transactions, categories, budgets, budgetPeriods } = useBudgetStore()

  // Get active budget period
  const activePeriod = useMemo(() => {
    return (
      budgetPeriods.find((period) => period.isActive) || {
        id: "current-month",
        name: "Current Month",
        startDate: startOfMonth(new Date()).toISOString(),
        endDate: endOfMonth(new Date()).toISOString(),
        isActive: true,
      }
    )
  }, [budgetPeriods])

  // Get transactions for the active period
  const periodTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = parseISO(transaction.date)
      return isWithinInterval(transactionDate, {
        start: parseISO(activePeriod.startDate),
        end: parseISO(activePeriod.endDate),
      })
    })
  }, [transactions, activePeriod])

  // Calculate budget progress
  const budgetProgress = useMemo(() => {
    return budgets
      .map((budget) => {
        const category = categories.find((c) => c.id === budget.categoryId)
        if (!category) return null

        // Get all transactions for this category and its subcategories
        const categoryTransactions = periodTransactions.filter((transaction) => {
          if (transaction.categoryId === category.id) return true

          // Check if transaction belongs to a subcategory
          const transactionCategory = categories.find((c) => c.id === transaction.categoryId)
          if (!transactionCategory) return false

          // Check if this is a subcategory of the budget category
          let parent = transactionCategory.parentId
          while (parent) {
            if (parent === category.id) return true
            const parentCategory = categories.find((c) => c.id === parent)
            if (!parentCategory) break
            parent = parentCategory.parentId
          }

          return false
        })

        // Calculate spent amount (only expenses)
        const spent = categoryTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)

        // Calculate progress percentage
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

        return {
          id: budget.id,
          categoryId: budget.categoryId,
          categoryName: category.name,
          categoryColor: category.color,
          budgetAmount: budget.amount,
          spent,
          remaining: budget.amount - spent,
          percentage,
          isOverBudget: spent > budget.amount,
        }
      })
      .filter(Boolean)
  }, [budgets, categories, periodTransactions])

  if (budgetProgress.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No budgets found for the current period</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgetProgress.map((budget) => (
          <Card key={budget!.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: budget!.categoryColor }} />
                  <div className="font-medium">{budget!.categoryName}</div>
                </div>
                {budget!.isOverBudget && <AlertCircle className="h-4 w-4 text-red-500" />}
              </div>

              <div className="flex justify-between mb-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Spent: </span>
                  <span className="font-medium">
                    {budget!.spent.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget: </span>
                  <span className="font-medium">
                    {budget!.budgetAmount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </span>
                </div>
              </div>

              <Progress
                value={Math.min(budget!.percentage, 100)}
                className={`h-2 mb-1 ${budget!.isOverBudget ? "bg-red-200" : ""}`}
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <div>{budget!.percentage.toFixed(0)}% used</div>
                <div className={budget!.remaining < 0 ? "text-red-500" : ""}>
                  {budget!.remaining.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}{" "}
                  remaining
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

