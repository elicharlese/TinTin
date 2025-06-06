"use client"

import { useState, useMemo } from "react"
import { parseISO } from "date-fns"
import { ChevronRight, RepeatIcon, AlertCircle } from "lucide-react"
import { useBudgetStore, type Transaction, type RecurrenceType } from "@/hooks/use-budget-store"
import { TransactionDialog } from "@/components/transaction-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface TransactionsListProps {
  searchQuery: string
  dateRange?: [Date | null, Date | null]
  categoryFilter?: string | null
  accountFilter?: string | null
  tagFilter?: string | null
  sortField?: keyof Transaction
  sortDirection?: "asc" | "desc"
  showUnreviewed?: boolean
  showRecurring?: boolean
  frequencyFilter?: RecurrenceType | null
}

export function TransactionsList({
  searchQuery,
  dateRange,
  categoryFilter,
  accountFilter,
  tagFilter,
  sortField = "date",
  sortDirection = "desc",
  showUnreviewed = false,
  showRecurring = false,
  frequencyFilter = null,
}: TransactionsListProps) {
  const { transactions, categories, accounts, tags, bulkDeleteTransactions } = useBudgetStore()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [selectMode, setSelectMode] = useState(false)

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Search query filter
      if (searchQuery) {
        const category = categories.find((c) => c.id === transaction.categoryId)
        const account = accounts.find((a) => a.id === transaction.accountId)
        const transactionTags = transaction.tags
          ? transaction.tags.map((tagId) => tags.find((t) => t.id === tagId)?.name).filter(Boolean)
          : []

        const searchString =
          `${transaction.description} ${category?.name || ""} ${account?.name || ""} ${transactionTags.join(" ")}`.toLowerCase()
        if (!searchString.includes(searchQuery.toLowerCase())) {
          return false
        }
      }

      // Date range filter
      if (dateRange && dateRange[0] && dateRange[1]) {
        const transactionDate = parseISO(transaction.date)
        if (transactionDate < dateRange[0] || transactionDate > dateRange[1]) {
          return false
        }
      }

      // Category filter
      if (categoryFilter) {
        // Check if transaction category matches or is a child of the filter category
        const category = categories.find((c) => c.id === transaction.categoryId)
        if (!category) return false

        if (category.id !== categoryFilter && category.parentId !== categoryFilter) {
          // Check if any parent in the hierarchy matches
          let currentParentId = category.parentId
          let matchFound = false

          while (currentParentId) {
            const parent = categories.find((c) => c.id === currentParentId)
            if (!parent) break

            if (parent.id === categoryFilter) {
              matchFound = true
              break
            }

            currentParentId = parent.parentId
          }

          if (!matchFound) return false
        }
      }

      // Account filter
      if (accountFilter && transaction.accountId !== accountFilter) {
        return false
      }

      // Tag filter
      if (tagFilter && (!transaction.tags || !transaction.tags.includes(tagFilter))) {
        return false
      }

      // Unreviewed filter
      if (showUnreviewed && transaction.isReviewed !== false) {
        return false
      }

      // Recurring filter
      if (showRecurring && transaction.isRecurring !== true) {
        return false
      }

      // Frequency filter
      if (frequencyFilter) {
        if (frequencyFilter === "none") {
          if (transaction.isRecurring) return false
        } else {
          if (!transaction.isRecurring || transaction.recurrenceType !== frequencyFilter) return false
        }
      }

      return true
    })
  }, [
    transactions,
    categories,
    accounts,
    tags,
    searchQuery,
    dateRange,
    categoryFilter,
    accountFilter,
    tagFilter,
    showUnreviewed,
    showRecurring,
    frequencyFilter,
  ])

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortField === "amount") {
        return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount
      }

      if (sortField === "date") {
        return sortDirection === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      }

      if (typeof a[sortField] === "string" && typeof b[sortField] === "string") {
        return sortDirection === "asc"
          ? (a[sortField] as string).localeCompare(b[sortField] as string)
          : (b[sortField] as string).localeCompare(a[sortField] as string)
      }

      return 0
    })
  }, [filteredTransactions, sortField, sortDirection])

  // Helper function to get the human-readable frequency name
  const getFrequencyGroupName = (transaction: Transaction) => {
    if (transaction.recurrenceType === "none") return "One-time"
    if (transaction.recurrenceType === "weekly") return "7 days"
    if (transaction.recurrenceType === "biweekly") return "14 days"
    if (transaction.recurrenceType === "monthly") return "30 days"
    if (transaction.recurrenceType === "quarterly") return "90 days"
    if (transaction.recurrenceType === "yearly") return "Annual"

    // Handle custom recurrence
    if (transaction.recurrenceType === "custom") {
      if (transaction.recurrenceCustomDays === 60) return "60 days"
      if (transaction.recurrenceCustomDays === 180) return "Bi-annual"
      // For other custom days, just show the number of days
      return `${transaction.recurrenceCustomDays} days`
    }

    return "Other"
  }

  // Group transactions by frequency
  const groupedTransactions = filteredTransactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
    const frequencyGroup = getFrequencyGroupName(transaction)
    if (!acc[frequencyGroup]) {
      acc[frequencyGroup] = []
    }
    acc[frequencyGroup].push(transaction)
    return acc
  }, {})

  // Define the order of frequency groups
  const frequencyGroupOrder = [
    "One-time",
    "7 days",
    "14 days",
    "30 days",
    "60 days",
    "90 days",
    "Bi-annual",
    "Annual",
    "Other",
  ]

  // Sort the groups by the defined order
  const sortedGroups = Object.keys(groupedTransactions).sort(
    (a, b) => frequencyGroupOrder.indexOf(a) - frequencyGroupOrder.indexOf(b),
  )

  // Get merchant icon
  const getMerchantIcon = (transaction: Transaction) => {
    // This is a simplified version - in a real app, you'd have a more sophisticated way to get icons
    const firstLetter = transaction.description.charAt(0).toUpperCase()
    return (
      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium">
        {firstLetter}
      </div>
    )
  }

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) {
      return <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">?</div>
    }

    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
        style={{ backgroundColor: category.color }}
      >
        {category.name.charAt(0)}
      </div>
    )
  }

  // Get account name and icon
  const getAccountInfo = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    if (!account) {
      return {
        name: "Unknown Account",
        icon: <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">?</div>,
      }
    }

    return {
      name: account.name,
      icon: (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: account.color }}
        >
          {account.name.charAt(0)}
        </div>
      ),
    }
  }

  // Get frequency badge
  const getFrequencyBadge = (transaction: Transaction) => {
    if (!transaction.isRecurring) {
      return (
        <Badge variant="outline" className="text-xs py-0 h-5 bg-gray-100 dark:bg-gray-800">
          One-time
        </Badge>
      )
    }

    const frequencyMap: Record<RecurrenceType, { label: string; color: string }> = {
      none: { label: "One-time", color: "bg-gray-100 dark:bg-gray-800" },
      daily: { label: "Daily", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
      weekly: { label: "7 days", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
      biweekly: { label: "14 days", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
      monthly: { label: "30 days", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
      quarterly: { label: "90 days", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
      yearly: { label: "Annually", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
    }

    // Add custom frequencies
    if (transaction.recurrenceType === "custom" && transaction.recurrenceCustomDays) {
      if (transaction.recurrenceCustomDays === 60) {
        return (
          <Badge
            variant="outline"
            className={`text-xs py-0 h-5 bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300`}
          >
            60 days
          </Badge>
        )
      }
      if (transaction.recurrenceCustomDays === 180) {
        return (
          <Badge
            variant="outline"
            className={`text-xs py-0 h-5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300`}
          >
            Semi-annually
          </Badge>
        )
      }
      return (
        <Badge variant="outline" className={`text-xs py-0 h-5 bg-gray-100 dark:bg-gray-800`}>
          {transaction.recurrenceCustomDays} days
        </Badge>
      )
    }

    const frequency = transaction.recurrenceType || "none"
    const { label, color } = frequencyMap[frequency]

    return (
      <Badge variant="outline" className={`text-xs py-0 h-5 ${color}`}>
        {label}
      </Badge>
    )
  }

  // Handle transaction selection
  const toggleTransactionSelection = (id: string) => {
    setSelectedTransactions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((transactionId) => transactionId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Handle select all
  const selectAllTransactions = () => {
    if (selectedTransactions.length === sortedTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(sortedTransactions.map((t) => t.id))
    }
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedTransactions.length === 0) return

    if (confirm(`Are you sure you want to delete ${selectedTransactions.length} transactions?`)) {
      bulkDeleteTransactions(selectedTransactions)
      setSelectedTransactions([])
      setSelectMode(false)
    }
  }

  // Handle transaction click
  const handleTransactionClick = (transaction: Transaction) => {
    if (selectMode) {
      toggleTransactionSelection(transaction.id)
    } else {
      setEditingTransaction(transaction)
    }
  }

  const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    const { name: accountName, icon: accountIcon } = getAccountInfo(transaction.accountId)
    const category = categories.find((c) => c.id === transaction.categoryId)

    return (
      <div
        className={`px-4 py-3 flex items-center hover:bg-muted/30 cursor-pointer ${
          selectedTransactions.includes(transaction.id) ? "bg-muted/50" : ""
        }`}
        onClick={() => handleTransactionClick(transaction)}
      >
        {selectMode && (
          <Checkbox
            checked={selectedTransactions.includes(transaction.id)}
            onCheckedChange={() => toggleTransactionSelection(transaction.id)}
            className="mr-3"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        <div className="mr-3">{getMerchantIcon(transaction)}</div>

        <div className="flex-1 min-w-0">
          <div className="font-medium truncate flex items-center">
            {transaction.description}
            {transaction.isRecurring && <RepeatIcon className="ml-1 h-3 w-3 text-muted-foreground" />}
            {transaction.isReviewed === false && <AlertCircle className="ml-1 h-3 w-3 text-orange-500" />}
          </div>

          {transaction.notes && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">{transaction.notes}</div>
          )}

          <div className="flex items-center mt-1 space-x-1">
            {getFrequencyBadge(transaction)}

            {transaction.tags && transaction.tags.length > 0 && (
              <>
                {transaction.tags.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId)
                  if (!tag) return null

                  return (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-xs py-0 h-5"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  )
                })}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center mr-4">
          {getCategoryIcon(transaction.categoryId)}
          <span className="ml-2 text-sm text-muted-foreground truncate max-w-[120px]">
            {category?.name || "Uncategorized"}
          </span>
        </div>

        <div className="flex items-center text-sm text-muted-foreground w-48 truncate">
          {accountIcon}
          <span className="ml-2">{accountName}</span>
        </div>

        <div className={`w-24 text-right font-medium ${transaction.amount >= 0 ? "text-green-500" : ""}`}>
          {transaction.amount >= 0 ? "+" : ""}
          {transaction.amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </div>

        <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="text-lg mb-2">No transactions found</div>
        <div className="text-sm">Try adjusting your filters or search query</div>
      </div>
    )
  }

  return (
    <div>
      {selectMode && (
        <div className="sticky top-0 z-10 bg-background p-2 flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              checked={selectedTransactions.length === sortedTransactions.length && sortedTransactions.length > 0}
              onCheckedChange={selectAllTransactions}
              className="mr-2"
            />
            <span className="text-sm">
              {selectedTransactions.length} of {sortedTransactions.length} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={selectedTransactions.length === 0}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectMode(false)
                setSelectedTransactions([])
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {sortedGroups.map((group) => (
        <div key={group} className="mb-6">
          <div className="sticky top-0 bg-background z-10 px-4 py-2 border-b border-border/40 flex justify-between items-center">
            <h3 className="font-medium text-sm">{group}</h3>
            <div className="text-sm text-muted-foreground">
              {groupedTransactions[group].length} transaction{groupedTransactions[group].length !== 1 ? "s" : ""}
            </div>
          </div>
          <div>
            {groupedTransactions[group].map((transaction, idx) => (
              <div key={transaction.id}>
                <TransactionItem transaction={transaction} />
                {idx < groupedTransactions[group].length - 1 && <Separator className="my-1" />}
              </div>
            ))}
          </div>
        </div>
      ))}

      <TransactionDialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        transaction={editingTransaction}
      />
    </div>
  )
}

