"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from "recharts"
import { useBudgetStore } from "@/hooks/use-budget-store"

interface BudgetBarChartProps {
  month?: number
  year?: number
}

export function BudgetBarChart({
  month = new Date().getMonth(),
  year = new Date().getFullYear(),
}: BudgetBarChartProps) {
  const { transactions, categories, budgets } = useBudgetStore()

  // Chart colors
  const BLUE_COLOR = "#3b82f6" // Blue-500
  const ORANGE_COLOR = "#f97316" // Orange-500
  const OVER_BUDGET_COLOR = "#f87171" // Red-400

  // Calculate budget data
  const budgetData = useMemo(() => {
    // Filter transactions for the selected month and year
    const filteredTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.date)
      return date.getMonth() === month && date.getFullYear() === year && transaction.amount < 0
    })

    // Group transactions by category
    const categorySpending: Record<string, number> = {}
    filteredTransactions.forEach((transaction) => {
      if (!categorySpending[transaction.categoryId]) {
        categorySpending[transaction.categoryId] = 0
      }
      categorySpending[transaction.categoryId] += Math.abs(transaction.amount)
    })

    // Get budget data for each category
    return Object.entries(categorySpending)
      .map(([categoryId, spent]) => {
        const category = categories.find((c) => c.id === categoryId)
        const budget = budgets.find((b) => b.categoryId === categoryId)
        const budgetAmount = budget?.amount || 0

        return {
          name: category?.name || "Unknown",
          spent,
          budget: budgetAmount,
          remaining: Math.max(0, budgetAmount - spent),
          overBudget: spent > budgetAmount && budgetAmount > 0,
        }
      })
      .filter((item) => item.budget > 0) // Only show categories with budgets
      .sort((a, b) => b.spent - a.spent) // Sort by highest spending
      .slice(0, 10) // Show top 10 categories
  }, [transactions, categories, budgets, month, year])

  if (budgetData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No budget data available for this period
      </div>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background p-3 border border-border/30 rounded-md shadow-md">
          <p className="font-medium text-sm mb-1">{label}</p>
          <p className="text-xs text-muted-foreground">
            Budget: ${data.budget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">
            Spent: ${data.spent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.overBudget
              ? `Over budget by: $${(data.spent - data.budget).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : `Remaining: $${data.remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={budgetData} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)", strokeWidth: 0.5 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)", strokeWidth: 0.5 }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          <Bar dataKey="budget" name="Budget" fill={BLUE_COLOR} opacity={0.3} radius={[0, 4, 4, 0]} />
          <Bar dataKey="spent" name="Spent" radius={[0, 4, 4, 0]}>
            {budgetData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.overBudget ? OVER_BUDGET_COLOR : ORANGE_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

