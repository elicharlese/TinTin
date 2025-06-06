"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Filter, ChevronDown, Plus, Clock, AlertCircle } from "lucide-react"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TransactionsList } from "@/components/transactions-list"
import { TransactionDialog } from "@/components/transaction-dialog"
import { useBudgetStore, type Transaction, type RecurrenceType } from "@/hooks/use-budget-store"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
// Add imports for the RecurringPage component and SegmentedControl
import { RecurringPage } from "@/components/recurring-page"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TransactionsPage() {
  const { categories, accounts, tags, transactions } = useBudgetStore()
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [accountFilter, setAccountFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [showUnreviewed, setShowUnreviewed] = useState(false)
  const [showRecurring, setShowRecurring] = useState(false)
  const [frequencyFilter, setFrequencyFilter] = useState<RecurrenceType | null>(null)
  const [sortField, setSortField] = useState<keyof Transaction>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isFrequencyFilterOpen, setIsFrequencyFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  // Add a state to track which view is active
  const [activeView, setActiveView] = useState<"transactions" | "recurring">("transactions")

  // Update active filters
  useEffect(() => {
    const filters: string[] = []

    if (dateRange[0] && dateRange[1]) {
      filters.push("Date")
    }

    if (categoryFilter) {
      const category = categories.find((c) => c.id === categoryFilter)
      if (category) {
        filters.push(`Category: ${category.name}`)
      }
    }

    if (accountFilter) {
      const account = accounts.find((a) => a.id === accountFilter)
      if (account) {
        filters.push(`Account: ${account.name}`)
      }
    }

    if (tagFilter) {
      const tag = tags.find((t) => t.id === tagFilter)
      if (tag) {
        filters.push(`Tag: ${tag.name}`)
      }
    }

    if (frequencyFilter) {
      const frequencyLabels: Record<RecurrenceType, string> = {
        none: "One-time",
        daily: "Daily",
        weekly: "7 days",
        biweekly: "14 days",
        monthly: "30 days",
        quarterly: "90 days",
        yearly: "Annually",
        custom: "Custom",
      }
      filters.push(`Frequency: ${frequencyLabels[frequencyFilter]}`)
    }

    if (showUnreviewed) {
      filters.push("Unreviewed")
    }

    if (showRecurring) {
      filters.push("Recurring")
    }

    setActiveFilters(filters)
  }, [
    dateRange,
    categoryFilter,
    accountFilter,
    tagFilter,
    frequencyFilter,
    showUnreviewed,
    showRecurring,
    categories,
    accounts,
    tags,
  ])

  // Get date range label
  const getDateRangeLabel = () => {
    if (dateRange[0] && dateRange[1]) {
      return `${format(dateRange[0], "MMM d")} - ${format(dateRange[1], "MMM d, yyyy")}`
    }
    return "Date"
  }

  // Set predefined date ranges
  const setThisMonth = () => {
    const start = startOfMonth(new Date())
    const end = endOfMonth(new Date())
    setDateRange([start, end])
  }

  const setLastMonth = () => {
    const start = startOfMonth(subMonths(new Date(), 1))
    const end = endOfMonth(subMonths(new Date(), 1))
    setDateRange([start, end])
  }

  const setLast3Months = () => {
    const start = startOfMonth(subMonths(new Date(), 2))
    const end = endOfMonth(new Date())
    setDateRange([start, end])
  }

  // Clear all filters
  const clearAllFilters = () => {
    setDateRange([null, null])
    setCategoryFilter(null)
    setAccountFilter(null)
    setTagFilter(null)
    setFrequencyFilter(null)
    setShowUnreviewed(false)
    setShowRecurring(false)
  }

  // Handle sort change
  const handleSortChange = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Update the return statement to include the toggle and conditionally render the appropriate view
  return (
    <div className="h-full flex flex-col">
      <header className="border-b border-border/40 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Transactions</h1>
          <Tabs
            value={activeView}
            onValueChange={(value) => setActiveView(value as "transactions" | "recurring")}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeView === "transactions" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search"
                  className="pl-9 w-60 bg-background border-border/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-border/40">
                    <Calendar className="h-4 w-4 mr-2" />
                    {getDateRangeLabel()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <div className="space-y-3">
                      <div className="font-medium">Date Range</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={setThisMonth}>
                          This Month
                        </Button>
                        <Button size="sm" variant="outline" onClick={setLastMonth}>
                          Last Month
                        </Button>
                        <Button size="sm" variant="outline" onClick={setLast3Months}>
                          Last 3 Months
                        </Button>
                      </div>
                      <CalendarComponent
                        mode="range"
                        selected={{
                          from: dateRange[0] || undefined,
                          to: dateRange[1] || undefined,
                        }}
                        onSelect={(range) => {
                          setDateRange([range?.from || null, range?.to || null])
                        }}
                        numberOfMonths={2}
                        className="rounded-md border"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDateRange([null, null])
                            setIsDateFilterOpen(false)
                          }}
                        >
                          Clear
                        </Button>
                        <Button size="sm" onClick={() => setIsDateFilterOpen(false)}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={isFrequencyFilterOpen} onOpenChange={setIsFrequencyFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-border/40">
                    <Clock className="h-4 w-4 mr-2" />
                    {frequencyFilter
                      ? frequencyFilter === "none"
                        ? "One-time"
                        : frequencyFilter === "weekly"
                          ? "7 days"
                          : frequencyFilter === "biweekly"
                            ? "14 days"
                            : frequencyFilter === "monthly"
                              ? "30 days"
                              : frequencyFilter === "quarterly"
                                ? "90 days"
                                : frequencyFilter === "yearly"
                                  ? "Annually"
                                  : "Frequency"
                      : "Frequency"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="start">
                  <div className="space-y-4">
                    <div className="font-medium">Frequency</div>
                    <div className="space-y-2">
                      <Button
                        variant={frequencyFilter === "none" ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setFrequencyFilter(frequencyFilter === "none" ? null : "none")
                          setIsFrequencyFilterOpen(false)
                        }}
                      >
                        One-time
                      </Button>
                      <Button
                        variant={frequencyFilter === "weekly" ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setFrequencyFilter(frequencyFilter === "weekly" ? null : "weekly")
                          setIsFrequencyFilterOpen(false)
                        }}
                      >
                        7 days
                      </Button>
                      <Button
                        variant={frequencyFilter === "biweekly" ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setFrequencyFilter(frequencyFilter === "biweekly" ? null : "biweekly")
                          setIsFrequencyFilterOpen(false)
                        }}
                      >
                        14 days
                      </Button>
                      <Button
                        variant={frequencyFilter === "monthly" ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setFrequencyFilter(frequencyFilter === "monthly" ? null : "monthly")
                          setIsFrequencyFilterOpen(false)
                        }}
                      >
                        30 days
                      </Button>
                      <Button
                        variant={
                          frequencyFilter === "custom" && transactions.some((t) => t.recurrenceCustomDays === 60)
                            ? "secondary"
                            : "ghost"
                        }
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setFrequencyFilter(frequencyFilter === "custom" ? null : "custom")
                          setIsFrequencyFilterOpen(false)
                        }}
                      >
                        60 days
                      </Button>
                      <Button
                        variant={frequencyFilter === "quarterly" ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setFrequencyFilter(frequencyFilter === "quarterly" ? null : "quarterly")
                          setIsFrequencyFilterOpen(false)
                        }}
                      >
                        90 days
                      </Button>
                      <Button
                        variant={
                          frequencyFilter === "custom" && transactions.some((t) => t.recurrenceCustomDays === 180)
                            ? "secondary"
                            : "ghost"
                        }
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setFrequencyFilter(frequencyFilter === "custom" ? null : "custom")
                          setIsFrequencyFilterOpen(false)
                        }}
                      >
                        Semi-annually
                      </Button>
                      <Button
                        variant={frequencyFilter === "yearly" ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setFrequencyFilter(frequencyFilter === "yearly" ? null : "yearly")
                          setIsFrequencyFilterOpen(false)
                        }}
                      >
                        Annually
                      </Button>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFrequencyFilter(null)
                          setIsFrequencyFilterOpen(false)
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-border/40">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilters.length > 0 && <Badge className="ml-2 bg-orange-500">{activeFilters.length}</Badge>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-4">
                    <div className="font-medium">Filters</div>

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select
                        className="w-full p-2 rounded-md bg-background border border-border/40"
                        value={categoryFilter || ""}
                        onChange={(e) => setCategoryFilter(e.target.value || null)}
                      >
                        <option value="">All Categories</option>
                        {categories
                          .filter((c) => !c.parentId)
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Account</Label>
                      <select
                        className="w-full p-2 rounded-md bg-background border border-border/40"
                        value={accountFilter || ""}
                        onChange={(e) => setAccountFilter(e.target.value || null)}
                      >
                        <option value="">All Accounts</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tag</Label>
                      <select
                        className="w-full p-2 rounded-md bg-background border border-border/40"
                        value={tagFilter || ""}
                        onChange={(e) => setTagFilter(e.target.value || null)}
                      >
                        <option value="">All Tags</option>
                        {tags.map((tag) => (
                          <option key={tag.id} value={tag.id}>
                            {tag.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showUnreviewed"
                          checked={showUnreviewed}
                          onCheckedChange={(checked) => setShowUnreviewed(checked === true)}
                        />
                        <Label htmlFor="showUnreviewed" className="cursor-pointer flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1 text-orange-500" />
                          Show only unreviewed
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showRecurring"
                          checked={showRecurring}
                          onCheckedChange={(checked) => setShowRecurring(checked === true)}
                        />
                        <Label htmlFor="showRecurring" className="cursor-pointer flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Show only recurring
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={clearAllFilters}>
                        Clear All
                      </Button>
                      <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={() => setIsAddingTransaction(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add transaction
            </Button>
          </div>
        )}
      </header>

      {activeView === "transactions" && (
        <>
          {activeFilters.length > 0 && (
            <div className="px-4 py-2 flex items-center flex-wrap gap-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {filter}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 ml-2" onClick={clearAllFilters}>
                Clear all
              </Button>
            </div>
          )}

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" className="text-base font-medium">
                All transactions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const transactionsList = document.querySelector(".transactions-list")
                  if (transactionsList) {
                    transactionsList.classList.toggle("select-mode")
                  }
                }}
              >
                Edit multiple
              </Button>
              <div className="h-4 border-r border-border/40"></div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Sort
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value={`${sortField}-${sortDirection}`}>
                    <DropdownMenuRadioItem value="date-desc" onClick={() => handleSortChange("date")}>
                      Date (Newest first)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="date-asc"
                      onClick={() => {
                        setSortField("date")
                        setSortDirection("asc")
                      }}
                    >
                      Date (Oldest first)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="amount-desc"
                      onClick={() => {
                        setSortField("amount")
                        setSortDirection("desc")
                      }}
                    >
                      Amount (Highest first)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="amount-asc"
                      onClick={() => {
                        setSortField("amount")
                        setSortDirection("asc")
                      }}
                    >
                      Amount (Lowest first)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="description-asc"
                      onClick={() => {
                        setSortField("description")
                        setSortDirection("asc")
                      }}
                    >
                      Description (A-Z)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="description-desc"
                      onClick={() => {
                        setSortField("description")
                        setSortDirection("desc")
                      }}
                    >
                      Description (Z-A)
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 overflow-auto transactions-list">
            <TransactionsList
              searchQuery={searchQuery}
              dateRange={dateRange}
              categoryFilter={categoryFilter}
              accountFilter={accountFilter}
              tagFilter={tagFilter}
              sortField={sortField}
              sortDirection={sortDirection}
              showUnreviewed={showUnreviewed}
              showRecurring={showRecurring}
              frequencyFilter={frequencyFilter}
            />
          </div>

          <TransactionDialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction} />
        </>
      )}

      {activeView === "recurring" && (
        <div className="flex-1 overflow-auto">
          <RecurringPage />
        </div>
      )}
    </div>
  )
}

