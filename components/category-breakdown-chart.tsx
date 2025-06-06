"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBudgetStore } from "@/hooks/use-budget-store"

interface CategoryBreakdownChartProps {
  rootCategoryId?: string
}

export function CategoryBreakdownChart({ rootCategoryId }: CategoryBreakdownChartProps) {
  const { transactions, categories } = useBudgetStore()

  // Chart color palette - focused on blues and oranges
  const CHART_COLORS = [
    "#1e40af", // Blue-800
    "#2563eb", // Blue-600
    "#3b82f6", // Blue-500
    "#60a5fa", // Blue-400
    "#93c5fd", // Blue-300
    "#bfdbfe", // Blue-200
    "#ea580c", // Orange-600
    "#f97316", // Orange-500
    "#fb923c", // Orange-400
    "#fdba74", // Orange-300
    "#fed7aa", // Orange-200
  ]

  // Get all subcategories of a category
  const getSubcategories = (parentId: string): string[] => {
    const directSubcats = categories.filter((c) => c.parentId === parentId).map((c) => c.id)
    const nestedSubcats = directSubcats.flatMap((subcatId) => getSubcategories(subcatId))
    return [...directSubcats, ...nestedSubcats]
  }

  // Calculate category totals
  const categoryData = useMemo(() => {
    // Filter transactions if rootCategoryId is provided
    let filteredTransactions = transactions
    let relevantCategories = categories

    if (rootCategoryId) {
      const allCategoryIds = [rootCategoryId, ...getSubcategories(rootCategoryId)]
      filteredTransactions = transactions.filter((t) => allCategoryIds.includes(t.categoryId))
      relevantCategories = categories.filter((c) => allCategoryIds.includes(c.id))
    }

    // Group transactions by category
    const categoryTotals: Record<string, number> = {}

    filteredTransactions.forEach((transaction) => {
      if (!categoryTotals[transaction.categoryId]) {
        categoryTotals[transaction.categoryId] = 0
      }
      categoryTotals[transaction.categoryId] += Math.abs(transaction.amount)
    })

    // Convert to chart data format
    return Object.entries(categoryTotals)
      .map(([categoryId, amount], index) => {
        const category = relevantCategories.find((c) => c.id === categoryId)
        // Use our blue/orange color palette instead of the category color
        return {
          name: category?.name || "Unknown",
          value: amount,
          // Use the predefined color palette instead of category colors
          color: CHART_COLORS[index % CHART_COLORS.length],
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Show top 10 categories
  }, [transactions, categories, rootCategoryId])

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No transaction data available</p>
        </CardContent>
      </Card>
    )
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background p-3 border border-border/30 rounded-md shadow-md">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            ${data.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => (percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : "")}
                strokeWidth={0.5}
                stroke="var(--background)"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: "12px", paddingLeft: "20px" }}
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

