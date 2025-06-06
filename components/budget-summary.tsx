"use client"

import { useMemo } from "react"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBudgetStore } from "@/hooks/use-budget-store"
import { BudgetChart } from "@/components/budget-chart"

export function BudgetSummary() {
  const { transactions, categories } = useBudgetStore()

  // Get current month range
  const currentMonthStart = startOfMonth(new Date())
  const currentMonthEnd = endOfMonth(new Date())

  // Get previous month range
  const previousMonthStart = startOfMonth(subMonths(new Date(), 1))
  const previousMonthEnd = endOfMonth(subMonths(new Date(), 1))

  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date)
    return date >= currentMonthStart && date <= currentMonthEnd
  })

  // Filter transactions for previous month
  const previousMonthTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date)
    return date >= previousMonthStart && date <= previousMonthEnd
  })

  // Calculate totals
  const currentMonthIncome = currentMonthTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)

  const currentMonthExpenses = currentMonthTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const previousMonthIncome = previousMonthTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const previousMonthExpenses = previousMonthTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  // Calculate changes
  const incomeChange =
    previousMonthIncome > 0 ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100 : 100

  const expenseChange =
    previousMonthExpenses > 0 ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 : 100

  // Calculate balance
  const currentBalance = currentMonthIncome - currentMonthExpenses
  const previousBalance = previousMonthIncome - previousMonthExpenses
  const balanceChange =
    previousBalance !== 0
      ? ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100
      : currentBalance > 0
        ? 100
        : -100

  // Prepare chart data
  const chartData = useMemo(() => {
    // Group expenses by top-level category
    const expensesByCategory = currentMonthTransactions
      .filter((t) => t.amount < 0)
      .reduce(
        (acc, transaction) => {
          const category = categories.find((c) => c.id === transaction.categoryId)
          if (!category) return acc

          // Find top-level parent
          let topParent = category
          while (topParent.parentId && topParent.parentId !== "expenses") {
            const parent = categories.find((c) => c.id === topParent.parentId)
            if (!parent) break
            topParent = parent
          }

          if (!acc[topParent.id]) {
            acc[topParent.id] = {
              id: topParent.id,
              name: topParent.name,
              color: topParent.color || "#888888",
              value: 0,
            }
          }

          acc[topParent.id].value += Math.abs(transaction.amount)
          return acc
        },
        {} as Record<string, { id: string; name: string; color: string; value: number }>,
      )

    return Object.values(expensesByCategory)
  }, [currentMonthTransactions, categories])

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="w-1/3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMonthIncome.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                {incomeChange > 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500">+{incomeChange.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    <span className="text-red-500">{incomeChange.toFixed(1)}%</span>
                  </>
                )}
                <span className="ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-1/3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMonthExpenses.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                {expenseChange < 0 ? (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500">{Math.abs(expenseChange).toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
                    <span className="text-red-500">+{expenseChange.toFixed(1)}%</span>
                  </>
                )}
                <span className="ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-1/3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
                {currentBalance.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                {balanceChange > 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500">+{balanceChange.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    <span className="text-red-500">{balanceChange.toFixed(1)}%</span>
                  </>
                )}
                <span className="ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense Breakdown</CardTitle>
          <CardDescription>{format(currentMonthStart, "MMMM yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  )
}

