"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Info, Calendar, List } from "lucide-react"
import { format, addMonths, subMonths } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecurringTransactionDialog } from "@/components/recurring-transaction-dialog"
import { RecurringTransactionItem } from "@/components/recurring-transaction-item"
import { RecurringCalendar } from "@/components/recurring-calendar"
import { type RecurringTransaction, useRecurringStore, useRecurringSummary } from "@/hooks/use-recurring-store"

export function RecurringPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 2, 1)) // March 2025
  const [activeTab, setActiveTab] = useState("recurring")
  const [viewMode, setViewMode] = useState("list")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | undefined>(undefined)
  const { recurringTransactions } = useRecurringStore()
  const summary = useRecurringSummary()

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleEditTransaction = (transaction: RecurringTransaction) => {
    setSelectedTransaction(transaction)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedTransaction(undefined)
  }

  const upcomingTransactions = recurringTransactions
    .filter((t) => t.isActive)
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Top Navigation */}
      <div className="flex justify-between items-center">
        <Tabs defaultValue="recurring" className="w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all">All recurring</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-sm">
            Filters
          </Button>
          <Button
            variant="default"
            size="sm"
            className="text-sm bg-orange-500 hover:bg-orange-600"
            onClick={() => {
              setSelectedTransaction(undefined)
              setDialogOpen(true)
            }}
          >
            Manage recurring
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            Today
          </Button>
          <div className="border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendar
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Income</h3>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <span className="text-gray-500">{formatCurrency(summary.income)} total</span>
            </div>
            <div className="text-sm text-blue-500 mb-2">Add recurring income</div>
            <Progress value={0} className="h-2 mb-2" />
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(summary.incomePaid)} paid</span>
              <span>{formatCurrency(summary.incomeRemaining)} remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Expenses</h3>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <span className="text-gray-500">{formatCurrency(summary.expenses)} total</span>
            </div>
            <Progress value={0} className="h-2 mb-2" />
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(summary.expensesPaid)} paid</span>
              <span>{formatCurrency(summary.expensesRemaining)} remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Credit Cards Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Credit cards</h3>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <span className="text-gray-500">{formatCurrency(summary.creditCards)} total</span>
            </div>
            <Progress value={0} className="h-2 mb-2" />
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(summary.creditCardsPaid)} paid</span>
              <span>{formatCurrency(summary.creditCardsRemaining)} remaining</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === "list" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <ChevronDown className="h-5 w-5" />
              Upcoming
            </h2>
            <div className="grid grid-cols-4 gap-4 text-sm text-gray-500 w-3/4">
              <div>Date</div>
              <div>Payment Account</div>
              <div>Category</div>
              <div className="text-right">Amount</div>
            </div>
          </div>

          {upcomingTransactions.map((transaction) => (
            <RecurringTransactionItem key={transaction.id} transaction={transaction} onEdit={handleEditTransaction} />
          ))}
        </div>
      ) : (
        <RecurringCalendar transactions={recurringTransactions} currentMonth={currentMonth} />
      )}

      {/* Summary Section */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm text-gray-500">Upcoming</div>
              <div className="font-medium">Total</div>
            </div>
            <div className="grid grid-cols-3 gap-8 text-right">
              <div>
                <div className="text-sm text-gray-500">Income</div>
                <div className="font-medium">{formatCurrency(summary.income)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Credit cards</div>
                <div className="font-medium">{formatCurrency(summary.creditCards)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Expenses</div>
                <div className="font-medium">{formatCurrency(summary.expenses)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <RecurringTransactionDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        transaction={selectedTransaction}
      />
    </div>
  )
}

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

