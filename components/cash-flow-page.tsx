"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBudgetStore } from "@/hooks/use-budget-store"
import { CashFlowChart } from "@/components/cash-flow-chart"
import { subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"

export function CashFlowPage() {
  const { transactions } = useBudgetStore()
  const [timeRange, setTimeRange] = useState<"3m" | "6m" | "1y" | "all">("3m")

  // Calculate date range based on selected time range
  const getDateRange = (): [Date, Date] => {
    const now = new Date()

    switch (timeRange) {
      case "3m":
        return [startOfMonth(subMonths(now, 2)), endOfMonth(now)]
      case "6m":
        return [startOfMonth(subMonths(now, 5)), endOfMonth(now)]
      case "1y":
        return [startOfYear(now), endOfYear(now)]
      case "all":
        // For "all", we'll just use a large range
        return [new Date(2020, 0, 1), now]
    }
  }

  const dateRange = getDateRange()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold">Cash Flow</h2>
        <p className="text-muted-foreground">Track your income and expenses over time</p>
      </div>

      <div className="flex justify-end">
        <Tabs>
          <TabsList>
            <TabsTrigger value="3m" onClick={() => setTimeRange("3m")} data-state={timeRange === "3m" ? "active" : ""}>
              3 Months
            </TabsTrigger>
            <TabsTrigger value="6m" onClick={() => setTimeRange("6m")} data-state={timeRange === "6m" ? "active" : ""}>
              6 Months
            </TabsTrigger>
            <TabsTrigger value="1y" onClick={() => setTimeRange("1y")} data-state={timeRange === "1y" ? "active" : ""}>
              1 Year
            </TabsTrigger>
            <TabsTrigger
              value="all"
              onClick={() => setTimeRange("all")}
              data-state={timeRange === "all" ? "active" : ""}
            >
              All Time
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Overview</CardTitle>
          <CardDescription>Income (above) vs Expenses (below) with Net Flow Trend</CardDescription>
        </CardHeader>
        <CardContent>
          <CashFlowChart transactions={transactions} dateRange={dateRange} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Income Breakdown</CardTitle>
            <CardDescription>Top income sources</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {/* Income breakdown chart would go here */}
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Income breakdown visualization
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Top spending categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {/* Expense breakdown chart would go here */}
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Expense breakdown visualization
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

