"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Plus, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useBudgetStore, type Transaction } from "@/hooks/use-budget-store"
import { TransactionForm } from "@/components/transaction-form"

export function TransactionSpreadsheet() {
  const { transactions, categories, deleteTransaction } = useBudgetStore()
  const [filter, setFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Transaction>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)

  // Get all categories in a flat list
  const allCategories = categories

  // Function to get the full category path
  const getCategoryPath = (categoryId: string): string => {
    const category = allCategories.find((c) => c.id === categoryId)
    if (!category) return "Uncategorized"

    const path: string[] = [category.name]
    let currentParentId = category.parentId

    while (currentParentId) {
      const parent = allCategories.find((c) => c.id === currentParentId)
      if (parent) {
        path.unshift(parent.name)
        currentParentId = parent.parentId
      } else {
        break
      }
    }

    return path.join(" > ")
  }

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearch =
        filter === "" ||
        transaction.description.toLowerCase().includes(filter.toLowerCase()) ||
        getCategoryPath(transaction.categoryId).toLowerCase().includes(filter.toLowerCase())

      const matchesCategory =
        !categoryFilter ||
        transaction.categoryId === categoryFilter ||
        categories.some((c) => c.id === transaction.categoryId && c.parentId === categoryFilter)

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortField === "amount") {
        return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount
      }

      if (sortField === "date") {
        return sortDirection === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      }

      return sortDirection === "asc"
        ? a[sortField].localeCompare(b[sortField])
        : b[sortField].localeCompare(a[sortField])
    })

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Filter transactions..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories
                .filter((category) => !category.parentId)
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm
              onSubmit={() => setIsAddingTransaction(false)}
              onCancel={() => setIsAddingTransaction(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">
                <Button variant="ghost" size="sm" onClick={() => handleSort("date")}>
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort("description")}>
                  Description
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleSort("amount")}>
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => {
                const category = categories.find((c) => c.id === transaction.categoryId)
                return (
                  <TableRow
                    key={transaction.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setEditingTransaction(transaction)}
                  >
                    <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {category && (
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                        )}
                        {getCategoryPath(transaction.categoryId)}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.amount >= 0 ? "+" : ""}
                      {transaction.amount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTransaction(transaction.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {editingTransaction && (
        <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={() => setEditingTransaction(null)}
              onCancel={() => setEditingTransaction(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

