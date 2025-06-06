"use client"

import { useState } from "react"
import { Calendar, Download, BarChart2, PieChart, TrendingUp, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { useBudgetStore } from "@/hooks/use-budget-store"
import { IncomeExpenseChart } from "@/components/income-expense-chart"
import { CategoryBreakdownChart } from "@/components/category-breakdown-chart"
import { useRouter, useSearchParams } from "next/navigation"
import { CashFlowPage } from "@/components/cash-flow-page"

export function ReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") || "reports"

  const { transactions, categories, accounts } = useBudgetStore()
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    startOfMonth(subMonths(new Date(), 2)),
    endOfMonth(new Date()),
  ])
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("last-3-months")

  const handleViewChange = (value: string) => {
    router.push(`/reports?view=${value}`, { scroll: false })
  }

  // Handle period selection
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value)

    switch (value) {
      case "current-month":
        setDateRange([startOfMonth(new Date()), endOfMonth(new Date())])
        break
      case "previous-month":
        const prevMonth = subMonths(new Date(), 1)
        setDateRange([startOfMonth(prevMonth), endOfMonth(prevMonth)])
        break
      case "last-3-months":
        setDateRange([startOfMonth(subMonths(new Date(), 2)), endOfMonth(new Date())])
        break
      case "last-6-months":
        setDateRange([startOfMonth(subMonths(new Date(), 5)), endOfMonth(new Date())])
        break
      case "year-to-date":
        setDateRange([new Date(new Date().getFullYear(), 0, 1), new Date()])
        break
      case "custom":
        setIsDatePickerOpen(true)
        break
    }
  }

  if (view === "cash-flow") {
    return (
      <div className="space-y-4">
        <div className="border-b pb-3 px-4 sm:px-6">
          <Tabs value={view} onValueChange={handleViewChange} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CashFlowPage />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="border-b pb-3">
        <Tabs value={view} onValueChange={handleViewChange} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Analyze your financial data</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="previous-month">Previous Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="year-to-date">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Calendar className="mr-2 h-4 w-4" />
                {format(dateRange[0], "MMM d, yyyy")} - {format(dateRange[1], "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3">
                <div className="space-y-3">
                  <div className="font-medium">Date Range</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <div className="text-sm mb-1">Start Date</div>
                      <CalendarComponent
                        mode="single"
                        selected={dateRange[0]}
                        onSelect={(date) => date && setDateRange([date, dateRange[1]])}
                        initialFocus
                      />
                    </div>
                    <div>
                      <div className="text-sm mb-1">End Date</div>
                      <CalendarComponent
                        mode="single"
                        selected={dateRange[1]}
                        onSelect={(date) => date && setDateRange([dateRange[0], date])}
                        initialFocus
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsDatePickerOpen(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => setIsDatePickerOpen(false)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center">
            <PieChart className="mr-2 h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            Income
          </TabsTrigger>
          <TabsTrigger value="net-worth" className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            Net Worth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>
                  {format(dateRange[0], "MMMM d, yyyy")} - {format(dateRange[1], "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncomeExpenseChart transactions={transactions} dateRange={dateRange} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Where your money is going</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryBreakdownChart transactions={transactions} categories={categories} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                Expense analysis charts and tables will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your income sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                Income analysis charts and tables will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="net-worth" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Tracking</CardTitle>
              <CardDescription>Track your net worth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                Net worth charts and analysis will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

