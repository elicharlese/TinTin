"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBudgetStore, type Transaction } from "@/hooks/use-budget-store"
import { cn } from "@/lib/utils"
import { Fragment } from "react"

interface TransactionFormProps {
  transaction?: Transaction
  onSubmit: () => void
  onCancel: () => void
}

export function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const { categories, addTransaction, updateTransaction } = useBudgetStore()

  const [date, setDate] = useState<Date>(transaction ? new Date(transaction.date) : new Date())
  const [description, setDescription] = useState(transaction?.description || "")
  const [amount, setAmount] = useState(transaction ? Math.abs(transaction.amount).toString() : "")
  const [isExpense, setIsExpense] = useState(transaction ? transaction.amount < 0 : true)
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || "")
  const [notes, setNotes] = useState(transaction?.notes || "")

  // Group categories by parent
  const groupedCategories = categories.reduce(
    (acc, category) => {
      if (!category.parentId) {
        return {
          ...acc,
          [category.id]: {
            category,
            children: [],
          },
        }
      }

      if (!acc[category.parentId]) {
        acc[category.parentId] = {
          category: categories.find((c) => c.id === category.parentId)!,
          children: [],
        }
      }

      acc[category.parentId].children.push(category)
      return acc
    },
    {} as Record<string, { category: (typeof categories)[0]; children: typeof categories }>,
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalAmount = Number.parseFloat(amount) * (isExpense ? -1 : 1)

    if (transaction) {
      updateTransaction(transaction.id, {
        date: format(date, "yyyy-MM-dd"),
        description,
        amount: finalAmount,
        categoryId,
        notes,
      })
    } else {
      addTransaction({
        date: format(date, "yyyy-MM-dd"),
        description,
        amount: finalAmount,
        categoryId,
        notes,
      })
    }

    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <div className="w-1/2 space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-1/2 space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={isExpense ? "expense" : "income"} onValueChange={(value) => setIsExpense(value === "expense")}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-category">Select a category</SelectItem>

            {/* Income categories */}
            <SelectItem value="income" disabled className="font-semibold">
              Income
            </SelectItem>
            {categories
              .filter((c) => c.parentId === "income")
              .map((category) => (
                <SelectItem key={category.id} value={category.id} className="pl-6">
                  {category.name}
                </SelectItem>
              ))}

            {/* Expense categories */}
            <SelectItem value="expenses" disabled className="font-semibold mt-2">
              Expenses
            </SelectItem>
            {categories
              .filter((c) => c.parentId === "expenses")
              .map((parentCategory) => (
                <Fragment key={parentCategory.id}>
                  <SelectItem value={parentCategory.id} className="pl-6 font-medium">
                    {parentCategory.name}
                  </SelectItem>
                  {categories
                    .filter((c) => c.parentId === parentCategory.id)
                    .map((subCategory) => (
                      <SelectItem key={subCategory.id} value={subCategory.id} className="pl-12">
                        {subCategory.name}
                      </SelectItem>
                    ))}
                </Fragment>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{transaction ? "Update" : "Add"} Transaction</Button>
      </div>
    </form>
  )
}

