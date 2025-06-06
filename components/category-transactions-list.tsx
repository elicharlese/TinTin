"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { useBudgetStore } from "@/hooks/use-budget-store"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategoryTransactionsListProps {
  categoryId: string
}

export function CategoryTransactionsList({ categoryId }: CategoryTransactionsListProps) {
  const { transactions, categories, accounts } = useBudgetStore()
  const [timeframe, setTimeframe] = useState("all")

  // Get the selected category
  const category = categories.find((c) => c.id === categoryId)

  // Get all subcategories recursively
  const getAllSubcategoryIds = (parentId: string): string[] => {
    const directSubcategories = categories.filter((c) => c.parentId === parentId)
    const directIds = directSubcategories.map((c) => c.id)

    const nestedIds = directSubcategories.flatMap((c) => getAllSubcategoryIds(c.id))

    return [parentId, ...directIds, ...nestedIds]
  }

  // Get all transactions for this category and its subcategories
  const categoryTransactions = useMemo(() => {
    if (!categoryId) return []

    const relevantCategoryIds = getAllSubcategoryIds(categoryId)

    let filteredTransactions = transactions.filter((t) => relevantCategoryIds.includes(t.categoryId))

    // Apply timeframe filter
    if (timeframe !== "all") {
      const now = new Date()
      const startDate = new Date()

      switch (timeframe) {
        case "7days":
          startDate.setDate(now.getDate() - 7)
          break
        case "30days":
          startDate.setDate(now.getDate() - 30)
          break
        case "90days":
          startDate.setDate(now.getDate() - 90)
          break
        case "year":
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) >= startDate)
    }

    // Sort by date (newest first)
    return filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [categoryId, transactions, timeframe, categories])

  // Calculate totals
  const totalAmount = useMemo(() => categoryTransactions.reduce((sum, t) => sum + t.amount, 0), [categoryTransactions])

  if (!category) {
    return <div>Category not found</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
          <h2 className="text-xl font-semibold">{category.name}</h2>
        </div>

        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Total Transactions</div>
              <div className="text-2xl font-bold">{categoryTransactions.length}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className={`text-2xl font-bold ${totalAmount >= 0 ? "text-green-500" : "text-red-500"}`}>
                {totalAmount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Average Transaction</div>
              <div className="text-2xl font-bold">
                {categoryTransactions.length > 0
                  ? (totalAmount / categoryTransactions.length).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })
                  : "$0.00"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No transactions found for this category</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryTransactions.map((transaction) => {
                  const account = accounts.find((a) => a.id === transaction.accountId)
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{account?.name || "Unknown Account"}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.amount.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

