"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, ChevronLeft, Eye, Settings, Edit, Plus, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function BudgetPage() {
  const [activeTab, setActiveTab] = useState("budget")
  const [currentMonth, setCurrentMonth] = useState("March 2025")
  const [expandedSections, setExpandedSections] = useState({
    income: true,
    expenses: true,
    contributions: false,
    forecastIncome: true,
    forecastExpenses: true,
    forecastFixed: false,
    forecastFlexible: false,
    forecastNonMonthly: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Extended months array to show more months
  const months = [
    "Jan 2025",
    "Feb 2025",
    "Mar 2025",
    "Apr 2025",
    "May 2025",
    "Jun 2025",
    "Jul 2025",
    "Aug 2025",
    "Sep 2025",
    "Oct 2025",
    "Nov 2025",
    "Dec 2025",
    "YTD",
  ]

  const incomeCategories = [
    { name: "ECE", icon: "💼", budget: 3018, actual: 2754, remaining: 264 },
    { name: "Cash", icon: "💰", budget: 240, actual: 0, remaining: 240 },
  ]

  const expenseCategories = [
    { name: "Fixed", budget: 2542, actual: 278, remaining: 2264 },
    { name: "Flexible", budget: 0, actual: 3166, remaining: -3166 },
    { name: "Non-Monthly", budget: 0, actual: 0, remaining: 0 },
  ]

  // Extended forecast data to include all months
  const forecastData = {
    income: {
      "Jan 2025": 3636,
      "Feb 2025": 3636,
      "Mar 2025": 3258,
      "Apr 2025": 3210,
      "May 2025": 3210,
      "Jun 2025": 3210,
      "Jul 2025": 3210,
      "Aug 2025": 3210,
      "Sep 2025": 3210,
      "Oct 2025": 3210,
      "Nov 2025": 3210,
      "Dec 2025": 3210,
      YTD: 38520,
    },
    categories: {
      ECE: {
        "Jan 2025": 3636,
        "Feb 2025": 3636,
        "Mar 2025": 3018,
        "Apr 2025": 3035,
        "May 2025": 3035,
        "Jun 2025": 3035,
        "Jul 2025": 3035,
        "Aug 2025": 3035,
        "Sep 2025": 3035,
        "Oct 2025": 3035,
        "Nov 2025": 3035,
        "Dec 2025": 3035,
        YTD: 36605,
      },
      Cash: {
        "Jan 2025": 0,
        "Feb 2025": 0,
        "Mar 2025": 240,
        "Apr 2025": 175,
        "May 2025": 175,
        "Jun 2025": 175,
        "Jul 2025": 175,
        "Aug 2025": 175,
        "Sep 2025": 175,
        "Oct 2025": 175,
        "Nov 2025": 175,
        "Dec 2025": 175,
        YTD: 1915,
      },
    },
    expenses: {
      Fixed: {
        "Jan 2025": 2353,
        "Feb 2025": 2353,
        "Mar 2025": 2542,
        "Apr 2025": 2031,
        "May 2025": 1403,
        "Jun 2025": 1403,
        "Jul 2025": 1403,
        "Aug 2025": 1403,
        "Sep 2025": 1403,
        "Oct 2025": 1403,
        "Nov 2025": 1403,
        "Dec 2025": 1403,
        YTD: 20503,
      },
      Flexible: {
        "Jan 2025": 1317,
        "Feb 2025": 1317,
        "Mar 2025": 0,
        "Apr 2025": 330,
        "May 2025": 330,
        "Jun 2025": 330,
        "Jul 2025": 330,
        "Aug 2025": 330,
        "Sep 2025": 330,
        "Oct 2025": 330,
        "Nov 2025": 330,
        "Dec 2025": 330,
        YTD: 5604,
      },
      "Non-Monthly": {
        "Jan 2025": "-",
        "Feb 2025": "-",
        "Mar 2025": "-",
        "Apr 2025": "-",
        "May 2025": "-",
        "Jun 2025": "-",
        "Jul 2025": "-",
        "Aug 2025": "-",
        "Sep 2025": "-",
        "Oct 2025": "-",
        "Nov 2025": "-",
        "Dec 2025": "-",
        YTD: "-",
      },
    },
    totals: {
      income: {
        "Jan 2025": 3636,
        "Feb 2025": 3636,
        "Mar 2025": 3258,
        "Apr 2025": 3210,
        "May 2025": 3210,
        "Jun 2025": 3210,
        "Jul 2025": 3210,
        "Aug 2025": 3210,
        "Sep 2025": 3210,
        "Oct 2025": 3210,
        "Nov 2025": 3210,
        "Dec 2025": 3210,
        YTD: 38520,
      },
      expenses: {
        "Jan 2025": 3670,
        "Feb 2025": 3670,
        "Mar 2025": 2542,
        "Apr 2025": 2361,
        "May 2025": 1733,
        "Jun 2025": 1733,
        "Jul 2025": 1733,
        "Aug 2025": 1733,
        "Sep 2025": 1733,
        "Oct 2025": 1733,
        "Nov 2025": 1733,
        "Dec 2025": 1733,
        YTD: 26107,
      },
      net: {
        "Jan 2025": -34,
        "Feb 2025": -34,
        "Mar 2025": 716,
        "Apr 2025": 849,
        "May 2025": 1477,
        "Jun 2025": 1477,
        "Jul 2025": 1477,
        "Aug 2025": 1477,
        "Sep 2025": 1477,
        "Oct 2025": 1477,
        "Nov 2025": 1477,
        "Dec 2025": 1477,
        YTD: 12413,
      },
    },
  }

  // Helper function to safely format numbers
  const formatCurrency = (value: any): string => {
    if (value === undefined || value === null) return "$0"
    if (value === "-") return "-"
    return `$${Number(value).toLocaleString()}`
  }

  // Calculate summary data
  const totalBudget = incomeCategories.reduce((sum, cat) => sum + cat.budget, 0)
  const totalActual = incomeCategories.reduce((sum, cat) => sum + cat.actual, 0)
  const totalRemaining = totalBudget - totalActual

  const totalExpenseBudget = expenseCategories.reduce((sum, cat) => sum + cat.budget, 0)
  const totalExpenseActual = expenseCategories.reduce((sum, cat) => sum + cat.actual, 0)
  const totalExpenseRemaining = totalExpenseBudget - totalExpenseActual

  const netRemaining = totalRemaining - Math.abs(totalExpenseRemaining)

  // Render the Budget view content
  const renderBudgetView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3">
        {/* Income Section */}
        <div className="mb-4 bg-card rounded-md overflow-hidden">
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50"
            onClick={() => toggleSection("income")}
          >
            <div className="flex items-center gap-2">
              {expandedSections.income ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="text-muted-foreground">Income</span>
            </div>
            <div className="grid grid-cols-3 gap-4 w-1/2">
              <span className="text-center text-muted-foreground">Budget</span>
              <span className="text-center text-muted-foreground">Actual</span>
              <span className="text-center text-muted-foreground">Remaining</span>
            </div>
          </div>

          {expandedSections.income && (
            <>
              {incomeCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-accent/50 border-t border-border"
                >
                  <div className="flex items-center gap-2">
                    <span className="ml-6">
                      {category.icon} {category.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 w-1/2">
                    <div className="text-center group relative">
                      <span className="group-hover:invisible">${category.budget.toLocaleString()}</span>
                      <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                        <input
                          type="text"
                          defaultValue={category.budget.toLocaleString()}
                          className="w-20 text-center border-b border-primary bg-transparent outline-none"
                        />
                      </div>
                    </div>
                    <span className="text-center">${category.actual.toLocaleString()}</span>
                    <span className={cn("text-center", category.remaining >= 0 ? "text-green-500" : "text-red-500")}>
                      ${category.remaining.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 p-3 hover:bg-accent/50 border-t border-border">
                <Eye className="h-4 w-4 ml-6" />
                <span className="text-muted-foreground">Show 3 unbudgeted</span>
              </div>

              <div className="flex items-center gap-2 p-3 hover:bg-accent/50 border-t border-border cursor-pointer">
                <Plus className="h-4 w-4 ml-6 text-primary" />
                <span className="text-primary">Add Income Category</span>
              </div>
            </>
          )}

          <div className="flex items-center justify-between p-3 font-medium border-t border-border">
            <span>Total Income</span>
            <div className="grid grid-cols-3 gap-4 w-1/2">
              <span className="text-center">${totalBudget.toLocaleString()}</span>
              <span className="text-center">${totalActual.toLocaleString()}</span>
              <span className={cn("text-center", totalRemaining >= 0 ? "text-green-500" : "text-red-500")}>
                ${totalRemaining.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="mb-4 bg-card rounded-md overflow-hidden">
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50"
            onClick={() => toggleSection("expenses")}
          >
            <div className="flex items-center gap-2">
              {expandedSections.expenses ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="text-muted-foreground">Expenses</span>
            </div>
            <div className="grid grid-cols-3 gap-4 w-1/2">
              <span className="text-center text-muted-foreground">Budget</span>
              <span className="text-center text-muted-foreground">Actual</span>
              <span className="text-center text-muted-foreground">Remaining</span>
            </div>
          </div>

          {expandedSections.expenses && (
            <>
              {expenseCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-accent/50 border-t border-border"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight
                      className="h-4 w-4 ml-6 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSection(`forecast${category.name.replace(/\s+/g, "")}`)
                      }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 w-1/2">
                    <div className="text-center group relative">
                      <span className="group-hover:invisible">${category.budget.toLocaleString()}</span>
                      <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                        <input
                          type="text"
                          defaultValue={category.budget.toLocaleString()}
                          className="w-20 text-center border-b border-primary bg-transparent outline-none"
                        />
                      </div>
                    </div>
                    <span className="text-center">${category.actual.toLocaleString()}</span>
                    <span className={cn("text-center", category.remaining >= 0 ? "text-green-500" : "text-red-500")}>
                      {category.name === "Non-Monthly" ? "-" : `$${category.remaining.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 p-3 hover:bg-accent/50 border-t border-border cursor-pointer">
                <Plus className="h-4 w-4 ml-6 text-primary" />
                <span className="text-primary">Add Expense Category</span>
              </div>
            </>
          )}

          <div className="flex items-center justify-between p-3 font-medium border-t border-border">
            <span>Total Expenses</span>
            <div className="grid grid-cols-3 gap-4 w-1/2">
              <span className="text-center">${totalExpenseBudget.toLocaleString()}</span>
              <span className="text-center">${totalExpenseActual.toLocaleString()}</span>
              <span className={cn("text-center", totalExpenseRemaining >= 0 ? "text-green-500" : "text-red-500")}>
                ${totalExpenseRemaining.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Contributions Section */}
        <div className="mb-4 bg-card rounded-md overflow-hidden">
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50"
            onClick={() => toggleSection("contributions")}
          >
            <div className="flex items-center gap-2">
              {expandedSections.contributions ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="text-muted-foreground">Contributions</span>
            </div>
            <div className="grid grid-cols-3 gap-4 w-1/2">
              <span className="text-center text-muted-foreground">Budget</span>
              <span className="text-center text-muted-foreground">Actual</span>
              <span className="text-center text-muted-foreground">Remaining</span>
            </div>
          </div>

          {expandedSections.contributions && (
            <div className="flex items-center gap-2 p-3 hover:bg-accent/50 border-t border-border cursor-pointer">
              <Plus className="h-4 w-4 ml-6 text-primary" />
              <span className="text-primary">Add Contribution</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Panel - Redesigned without tabs */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardContent className="p-6 flex flex-col h-full">
            {/* Budget Amount */}
            <div className="text-center mb-6">
              <div className={cn("text-4xl font-bold", netRemaining >= 0 ? "text-green-500" : "text-red-500")}>
                ${netRemaining.toLocaleString()}
              </div>
              <div className="text-muted-foreground mt-2 flex items-center justify-center">
                Left to budget
                <Info className="h-4 w-4 ml-1 text-muted-foreground" />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border w-full mb-6"></div>

            {/* Summary Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Summary</h3>

              {/* Fixed Category */}
              <div className="mb-5">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Fixed</span>
                  <span>${expenseCategories[0].budget.toLocaleString()} budget</span>
                </div>
                <Progress
                  value={
                    expenseCategories[0].budget > 0
                      ? (expenseCategories[0].actual / expenseCategories[0].budget) * 100
                      : 0
                  }
                  className="h-2 bg-muted"
                />
                <div className="flex justify-between mt-2 text-sm">
                  <span>${expenseCategories[0].actual.toLocaleString()} spent</span>
                  <span className="text-green-500">${expenseCategories[0].remaining.toLocaleString()} remaining</span>
                </div>
              </div>

              {/* Flexible Category */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Flexible</span>
                  <span>${expenseCategories[1].budget.toLocaleString()} budget</span>
                </div>
                <Progress value={100} className="h-2 bg-muted" indicatorClassName="bg-red-500" />
                <div className="flex justify-between mt-2 text-sm">
                  <span>${expenseCategories[1].actual.toLocaleString()} spent</span>
                  <span className="text-red-500">
                    -${Math.abs(expenseCategories[1].remaining).toLocaleString()} remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border w-full mb-6"></div>

            {/* Income Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Income</h3>

              <div className="space-y-5">
                {incomeCategories.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{category.name}</span>
                      <span>${category.budget.toLocaleString()}</span>
                    </div>
                    <Progress
                      value={category.budget > 0 ? (category.actual / category.budget) * 100 : 0}
                      className="h-2 bg-muted"
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>${category.actual.toLocaleString()} received</span>
                      <span className="text-green-500">${category.remaining.toLocaleString()} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Section */}
            <div className="mt-auto pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Budget</span>
                <span className={cn("font-bold", netRemaining >= 0 ? "text-green-500" : "text-red-500")}>
                  ${netRemaining.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Render the Forecast view content
  const renderForecastView = () => (
    <div className="relative overflow-x-auto border border-border rounded-md">
      <div className="min-w-[1200px]">
        <table className="w-full">
          <thead>
            <tr className="bg-card">
              <th className="p-4 text-left w-[220px] sticky left-0 z-10 bg-card border-r border-border">
                <div className="w-[220px]"></div>
              </th>
              {months.map((month, index) => (
                <th key={index} className="p-4 text-center min-w-[120px]">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Income Header */}
            <tr className="bg-card">
              <td
                className="p-4 sticky left-0 z-10 bg-card border-r border-border cursor-pointer hover:bg-accent/50"
                onClick={() => toggleSection("forecastIncome")}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.forecastIncome ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  <span className="text-muted-foreground font-medium">Income</span>
                </div>
              </td>
              {months.map((month, index) => (
                <td key={index} className="p-4 text-center text-muted-foreground">
                  {month}
                </td>
              ))}
            </tr>

            {expandedSections.forecastIncome && (
              <>
                {/* Income Row */}
                <tr className="bg-card border-t border-border">
                  <td className="p-4 sticky left-0 z-10 bg-card border-r border-border">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-5 w-5 ml-6" />
                      <span>Income</span>
                    </div>
                  </td>
                  {months.map((month, index) => (
                    <td key={index} className="p-4 text-center group relative">
                      <span className="group-hover:invisible">{formatCurrency(forecastData.income[month])}</span>
                      <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                        <input
                          type="text"
                          defaultValue={
                            forecastData.income[month] === "-" ? "" : forecastData.income[month].toLocaleString()
                          }
                          className="w-24 text-center border-b border-primary bg-transparent outline-none"
                        />
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Income Categories */}
                {Object.entries(forecastData.categories).map(([category, values], index) => (
                  <tr key={index} className="bg-card border-t border-border hover:bg-accent/20">
                    <td className="p-4 sticky left-0 z-10 bg-card border-r border-border hover:bg-accent/50">
                      <div className="flex items-center gap-2 ml-6">
                        <span>
                          {category === "ECE" ? "💼" : "💰"} {category}
                        </span>
                        <Edit className="h-3.5 w-3.5 text-muted-foreground opacity-0 hover:opacity-100 cursor-pointer" />
                      </div>
                    </td>
                    {months.map((month, i) => (
                      <td key={i} className="p-4 text-center group relative">
                        <span className="group-hover:invisible">{formatCurrency(values[month])}</span>
                        <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                          <input
                            type="text"
                            defaultValue={values[month] === "-" ? "" : values[month].toLocaleString()}
                            className="w-24 text-center border-b border-primary bg-transparent outline-none"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Show Unbudgeted */}
                <tr className="bg-card border-t border-border">
                  <td
                    className="p-4 sticky left-0 z-10 bg-card border-r border-border hover:bg-accent/50 cursor-pointer"
                    colSpan={1}
                  >
                    <div className="flex items-center gap-2 ml-6">
                      <Eye className="h-4 w-4" />
                      <span className="text-muted-foreground">Show 3 unbudgeted</span>
                    </div>
                  </td>
                  <td colSpan={months.length}></td>
                </tr>

                {/* Add Income Category */}
                <tr className="bg-card border-t border-border">
                  <td
                    className="p-4 sticky left-0 z-10 bg-card border-r border-border hover:bg-accent/50 cursor-pointer"
                    colSpan={1}
                  >
                    <div className="flex items-center gap-2 ml-6">
                      <Plus className="h-4 w-4 text-primary" />
                      <span className="text-primary">Add Income Category</span>
                    </div>
                  </td>
                  <td colSpan={months.length}></td>
                </tr>
              </>
            )}

            {/* Total Income */}
            <tr className="bg-card border-t border-border font-medium">
              <td className="p-4 sticky left-0 z-10 bg-card border-r border-border">Total Income</td>
              {months.map((month, index) => (
                <td key={index} className="p-4 text-center font-bold">
                  {formatCurrency(forecastData.totals.income[month])}
                </td>
              ))}
            </tr>

            {/* Expenses Header */}
            <tr className="bg-card border-t border-border mt-4">
              <td
                className="p-4 sticky left-0 z-10 bg-card border-r border-border cursor-pointer hover:bg-accent/50"
                onClick={() => toggleSection("forecastExpenses")}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.forecastExpenses ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  <span className="text-muted-foreground font-medium">Expenses</span>
                </div>
              </td>
              {months.map((month, index) => (
                <td key={index} className="p-4 text-center text-muted-foreground">
                  {month}
                </td>
              ))}
            </tr>

            {expandedSections.forecastExpenses && (
              <>
                {/* Expense Categories */}
                {Object.entries(forecastData.expenses).map(([category, values], index) => (
                  <tr key={index} className="bg-card border-t border-border hover:bg-accent/20">
                    <td
                      className="p-4 sticky left-0 z-10 bg-card border-r border-border hover:bg-accent/50"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSection(`forecast${category.replace(/\s+/g, "")}`)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          className="h-5 w-5 ml-6 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSection(`forecast${category.replace(/\s+/g, "")}`)
                          }}
                        />
                        <span>{category}</span>
                        <Edit className="h-3.5 w-3.5 text-muted-foreground opacity-0 hover:opacity-100 cursor-pointer" />
                      </div>
                    </td>
                    {months.map((month, i) => (
                      <td key={i} className="p-4 text-center group relative">
                        <span className="group-hover:invisible">
                          {values[month] === "-" ? "-" : formatCurrency(values[month])}
                        </span>
                        <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                          <input
                            type="text"
                            defaultValue={values[month] === "-" ? "" : values[month].toLocaleString()}
                            className="w-24 text-center border-b border-primary bg-transparent outline-none"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Add Expense Category */}
                <tr className="bg-card border-t border-border">
                  <td
                    className="p-4 sticky left-0 z-10 bg-card border-r border-border hover:bg-accent/50 cursor-pointer"
                    colSpan={1}
                  >
                    <div className="flex items-center gap-2 ml-6">
                      <Plus className="h-4 w-4 text-primary" />
                      <span className="text-primary">Add Expense Category</span>
                    </div>
                  </td>
                  <td colSpan={months.length}></td>
                </tr>
              </>
            )}

            {/* Total Expenses */}
            <tr className="bg-card border-t border-border font-medium">
              <td className="p-4 sticky left-0 z-10 bg-card border-r border-border">Total Expenses</td>
              {months.map((month, index) => (
                <td key={index} className="p-4 text-center font-bold">
                  {formatCurrency(forecastData.totals.expenses[month])}
                </td>
              ))}
            </tr>

            {/* Net Income */}
            <tr className="bg-card border-t border-border font-medium">
              <td className="p-4 sticky left-0 z-10 bg-card border-r border-border">Net Income</td>
              {months.map((month, index) => {
                const netValue = forecastData.totals.net[month]
                const isPositive = netValue > 0
                return (
                  <td
                    key={index}
                    className={cn("p-4 text-center font-bold", isPositive ? "text-green-500" : "text-red-500")}
                  >
                    {isPositive ? "+" : ""}
                    {formatCurrency(netValue)}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{activeTab === "budget" ? currentMonth : "2025"}</h1>
          <div className="ml-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("budget")}
                className={cn(
                  "px-3 py-1 border-b-2 border-transparent",
                  activeTab === "budget" ? "text-orange-500 border-orange-500" : "text-muted-foreground",
                )}
              >
                Budget
              </button>
              <button
                onClick={() => setActiveTab("forecast")}
                className={cn(
                  "px-3 py-1 border-b-2 border-transparent",
                  activeTab === "forecast" ? "text-orange-500 border-orange-500" : "text-muted-foreground",
                )}
              >
                Forecast
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="border-l h-6 mx-2 border-border"></div>
          <Button variant="outline" className="rounded-md">
            Today
          </Button>
          {activeTab === "forecast" && (
            <>
              <Button variant="outline" className="rounded-md">
                Monthly
              </Button>
              <Button variant="outline" className="rounded-md">
                Yearly
              </Button>
            </>
          )}
          <div className="border-l h-6 mx-2 border-border"></div>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Render content based on active tab */}
      {activeTab === "budget" ? renderBudgetView() : renderForecastView()}
    </div>
  )
}

