"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import {
  CalendarIcon,
  X,
  Plus,
  Trash2,
  RepeatIcon,
  DollarSign,
  Tag,
  CheckCircle2,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBudgetStore, type Transaction, type RecurrenceType } from "@/hooks/use-budget-store"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
}

export function TransactionDialog({ open, onOpenChange, transaction }: TransactionDialogProps) {
  const { categories, accounts, tags, addTransaction, updateTransaction, deleteTransaction, duplicateTransaction } =
    useBudgetStore()
  const { toast } = useToast()

  const [date, setDate] = useState<Date>(transaction ? parseISO(transaction.date) : new Date())
  const [description, setDescription] = useState(transaction?.description || "")
  const [amount, setAmount] = useState(transaction ? Math.abs(transaction.amount).toString() : "")
  const [isExpense, setIsExpense] = useState(transaction ? transaction.amount < 0 : true)
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || "")
  const [accountId, setAccountId] = useState(transaction?.accountId || accounts[0]?.id || "")
  const [notes, setNotes] = useState(transaction?.notes || "")
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring || false)
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(transaction?.recurrenceType || "monthly")
  const [selectedTags, setSelectedTags] = useState<string[]>(transaction?.tags || [])
  const [isReviewed, setIsReviewed] = useState(transaction?.isReviewed !== false)
  const [activeTab, setActiveTab] = useState("basic")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    isRecurring: transaction?.isRecurring || false,
    recurrenceType: transaction?.recurrenceType || "monthly",
    recurrenceCustomDays: transaction?.recurrenceCustomDays || 60,
  })

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setDate(parseISO(transaction.date))
      setDescription(transaction.description)
      setAmount(Math.abs(transaction.amount).toString())
      setIsExpense(transaction.amount < 0)
      setCategoryId(transaction.categoryId)
      setAccountId(transaction.accountId)
      setNotes(transaction.notes || "")
      setIsRecurring(transaction.isRecurring || false)
      setRecurrenceType(transaction.recurrenceType || "monthly")
      setSelectedTags(transaction.tags || [])
      setIsReviewed(transaction.isReviewed !== false)
      setActiveTab("basic")
      setErrors({})
      setFormData({
        isRecurring: transaction?.isRecurring || false,
        recurrenceType: transaction?.recurrenceType || "monthly",
        recurrenceCustomDays: transaction?.recurrenceCustomDays || 60,
      })
    } else if (open) {
      // Reset form for new transaction
      setDate(new Date())
      setDescription("")
      setAmount("")
      setIsExpense(true)
      setCategoryId("")
      setAccountId(accounts[0]?.id || "")
      setNotes("")
      setIsRecurring(false)
      setRecurrenceType("monthly")
      setSelectedTags([])
      setIsReviewed(true)
      setActiveTab("basic")
      setErrors({})
      setFormData({
        isRecurring: false,
        recurrenceType: "monthly",
        recurrenceCustomDays: 60,
      })
    }
  }, [transaction, open, accounts])

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount"
    }

    if (!categoryId) {
      newErrors.categoryId = "Please select a category"
    }

    if (!accountId) {
      newErrors.accountId = "Please select an account"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setActiveTab("basic")
      return
    }

    const finalAmount = Number.parseFloat(amount) * (isExpense ? -1 : 1)

    try {
      if (transaction) {
        updateTransaction(transaction.id, {
          date: format(date, "yyyy-MM-dd"),
          description,
          amount: finalAmount,
          categoryId,
          accountId,
          notes,
          isRecurring,
          recurrenceType: isRecurring ? recurrenceType : undefined,
          recurrenceCustomDays: formData.recurrenceType === "custom" ? formData.recurrenceCustomDays : undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          isReviewed,
        })

        toast({
          title: "Transaction updated",
          description: `${description} has been updated successfully.`,
        })
      } else {
        addTransaction({
          date: format(date, "yyyy-MM-dd"),
          description,
          amount: finalAmount,
          categoryId,
          accountId,
          notes,
          isRecurring,
          recurrenceType: isRecurring ? recurrenceType : undefined,
          recurrenceCustomDays: formData.recurrenceType === "custom" ? formData.recurrenceCustomDays : undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          isReviewed,
        })

        toast({
          title: "Transaction added",
          description: `${description} has been added successfully.`,
        })
      }

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing your transaction.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = () => {
    if (transaction) {
      if (window.confirm("Are you sure you want to delete this transaction?")) {
        deleteTransaction(transaction.id)
        toast({
          title: "Transaction deleted",
          description: `${transaction.description} has been deleted.`,
        })
        onOpenChange(false)
      }
    }
  }

  const handleDuplicate = () => {
    if (transaction) {
      duplicateTransaction(transaction.id)
      toast({
        title: "Transaction duplicated",
        description: `A copy of ${transaction.description} has been created.`,
      })
      onOpenChange(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId)
      } else {
        return [...prev, tagId]
      }
    })
  }

  const getSelectedCategory = () => {
    return categories.find((c) => c.id === categoryId)
  }

  const getSelectedAccount = () => {
    return accounts.find((a) => a.id === accountId)
  }

  // Render the appropriate content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div className="space-y-4">
            {/* Transaction Type Selector */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={isExpense ? "default" : "outline"}
                className={cn(
                  "h-20 flex flex-col items-center justify-center gap-2 rounded-lg",
                  isExpense ? "bg-red-500/90 hover:bg-red-600 text-white" : "",
                )}
                onClick={() => setIsExpense(true)}
              >
                <ArrowDownCircle className={cn("h-6 w-6", isExpense ? "text-white" : "text-red-500")} />
                <span>Expense</span>
              </Button>

              <Button
                type="button"
                variant={!isExpense ? "default" : "outline"}
                className={cn(
                  "h-20 flex flex-col items-center justify-center gap-2 rounded-lg",
                  !isExpense ? "bg-green-500/90 hover:bg-green-600 text-white" : "",
                )}
                onClick={() => setIsExpense(false)}
              >
                <ArrowUpCircle className={cn("h-6 w-6", !isExpense ? "text-white" : "text-green-500")} />
                <span>Income</span>
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="pl-9 bg-background border-border/40"
                  placeholder="What was this transaction for?"
                />
              </div>
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9 bg-background border-border/40 text-lg font-medium"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background border-border/40",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "EEEE, MMMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-background border-border/40">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(groupedCategories)
                    .filter((group) => group.category.type === (isExpense ? "expense" : "income"))
                    .map((group) => (
                      <SelectGroup key={group.category.id}>
                        <SelectLabel>{group.category.name}</SelectLabel>
                        {group.children
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId}</p>}
            </div>

            {/* Account */}
            <div className="space-y-2">
              <Label htmlFor="account" className="text-sm font-medium">
                Account
              </Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="bg-background border-border/40">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" style={{ color: account.color }} />
                        {account.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountId && <p className="text-sm text-red-500">{errors.accountId}</p>}
            </div>
          </div>
        )
      case "details":
        return (
          <div className="space-y-4">
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="bg-background border-border/40 resize-none"
                placeholder="Add any additional details about this transaction..."
              />
            </div>

            {/* Recurring Transaction */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => {
                    setIsRecurring(checked === true)
                    setFormData({ ...formData, isRecurring: checked === true })
                  }}
                />
                <Label htmlFor="isRecurring" className="cursor-pointer flex items-center">
                  <RepeatIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  This is a recurring transaction
                </Label>
              </div>

              {isRecurring && (
                <div className="pl-6 space-y-2">
                  <Label htmlFor="recurrenceType" className="text-sm font-medium">
                    Recurrence Pattern
                  </Label>
                  <Select
                    value={recurrenceType}
                    onValueChange={(value: RecurrenceType) => {
                      setRecurrenceType(value)
                      setFormData({ ...formData, recurrenceType: value })
                    }}
                  >
                    <SelectTrigger className="bg-background border-border/40 w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {formData.isRecurring && formData.recurrenceType === "custom" && (
                <div className="pl-6 space-y-2">
                  <Label htmlFor="recurrenceCustomDays">Custom Period (days)</Label>
                  <select
                    id="recurrenceCustomDays"
                    className="w-full p-2 rounded-md border bg-background border-border/40"
                    value={formData.recurrenceCustomDays || 60}
                    onChange={(e) =>
                      setFormData({ ...formData, recurrenceCustomDays: Number.parseInt(e.target.value) })
                    }
                  >
                    <option value="60">60 days</option>
                    <option value="180">180 days (Semi-annually)</option>
                    <option value="45">45 days</option>
                    <option value="120">120 days</option>
                  </select>
                </div>
              )}

              {/* Review Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isReviewed"
                  checked={isReviewed}
                  onCheckedChange={(checked) => setIsReviewed(checked === true)}
                />
                <Label htmlFor="isReviewed" className="cursor-pointer flex items-center">
                  {isReviewed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Marked as reviewed
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                      Needs review
                    </>
                  )}
                </Label>
              </div>
            </div>
          </div>
        )
      case "tags":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tags" className="text-sm font-medium flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                  Tags
                </Label>
                <div className="text-xs text-muted-foreground">{selectedTags.length} selected</div>
              </div>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-background border-border/40 min-h-[150px]">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer text-xs py-0.5 px-2 h-6 inline-flex whitespace-nowrap"
                      style={
                        selectedTags.includes(tag.id)
                          ? { backgroundColor: tag.color, color: "#fff" }
                          : { borderColor: tag.color, color: tag.color }
                      }
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
                    <p>No tags available</p>
                    <p className="text-xs mt-1">Create tags in the settings</p>
                  </div>
                )}
              </div>
            </div>

            {selectedTags.length > 0 && (
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Selected Tags:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId)
                    return tag ? (
                      <Badge
                        key={tag.id}
                        className="inline-flex items-center gap-1 text-xs py-0.5 px-2 h-6 whitespace-nowrap"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTag(tag.id)
                          }}
                        />
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[600px] bg-background border-border/40 p-0 overflow-hidden flex flex-col"
        style={{ height: "min(90vh, 700px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 bg-background sticky top-0 z-10 border-b border-border/10">
          <h2 className="text-xl font-semibold">{transaction ? "Edit Transaction" : "Add Transaction"}</h2>
        </div>

        {/* Custom Tab Navigation */}
        <div className="px-6 bg-background pb-2 sticky top-[60px] z-10">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Button
              type="button"
              variant={activeTab === "basic" ? "default" : "outline"}
              className={cn("rounded-md", activeTab === "basic" ? "bg-primary text-primary-foreground" : "")}
              onClick={() => setActiveTab("basic")}
            >
              Basic Info
            </Button>
            <Button
              type="button"
              variant={activeTab === "details" ? "default" : "outline"}
              className={cn("rounded-md", activeTab === "details" ? "bg-primary text-primary-foreground" : "")}
              onClick={() => setActiveTab("details")}
            >
              Details
            </Button>
            <Button
              type="button"
              variant={activeTab === "tags" ? "default" : "outline"}
              className={cn("rounded-md", activeTab === "tags" ? "bg-primary text-primary-foreground" : "")}
              onClick={() => setActiveTab("tags")}
            >
              Tags
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 space-y-6">{renderTabContent()}</div>
          </ScrollArea>

          {/* Transaction Summary / Footer */}
          <div className="bg-muted/30 p-4 border-t border-border/40 sticky bottom-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="mr-3">
                  {isExpense ? (
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <ArrowUpCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{description || "New Transaction"}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    {getSelectedCategory()?.name || "No category"} • {format(date, "MMM d, yyyy")}
                  </div>
                </div>
              </div>
              <div className={cn("text-xl font-bold", isExpense ? "text-red-500" : "text-green-500")}>
                {isExpense ? "-" : "+"}${amount || "0.00"}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between">
              {transaction && (
                <div className="flex gap-2">
                  <Button type="button" variant="destructive" size="sm" onClick={handleDelete} className="h-9">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicate}
                    className="border-border/40 h-9"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="border-border/40 h-9"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white h-9 px-4">
                  {transaction ? "Save Changes" : "Add Transaction"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

