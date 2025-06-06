"use client"

import { useMemo } from "react"
import {
  format,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
  parseISO,
  isSameMonth,
  isSameWeek,
  isSameDay,
} from "date-fns"
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts"
import type { Transaction } from "@/hooks/use-budget-store"

interface IncomeExpenseChartProps {
  transactions: Transaction[]
  dateRange: [Date, Date]
}

export function IncomeExpenseChart({ transactions, dateRange }: IncomeExpenseChartProps) {
  // Chart colors
  const INCOME_COLOR = "#4ade80" // Green-400
  const EXPENSE_COLOR = "#f87171" // Red-400

  // Determine the interval type based on date range
  const intervalType = useMemo(() => {
    const diffInDays = Math.ceil((dateRange[1].getTime() - dateRange[0].getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays <= 31) return "day"
    if (diffInDays <= 90) return "week"
    return "month"
  }, [dateRange])

  // Generate data for the chart
  const chartData = useMemo(() => {
    let intervals: Date[] = []

    // Generate intervals based on the type
    if (intervalType === "day") {
      intervals = eachDayOfInterval({ start: dateRange[0], end: dateRange[1] })
    } else if (intervalType === "week") {
      intervals = eachWeekOfInterval({ start: dateRange[0], end: dateRange[1] })
    } else {
      intervals = eachMonthOfInterval({ start: dateRange[0], end: dateRange[1] })
    }

    // Create data points for each interval
    return intervals.map((intervalDate) => {
      // Filter transactions for this interval
      const intervalTransactions = transactions.filter((transaction) => {
        const transactionDate = parseISO(transaction.date)

        if (intervalType === "day") {
          return isSameDay(transactionDate, intervalDate)
        } else if (intervalType === "week") {
          return isSameWeek(transactionDate, intervalDate)
        } else {
          return isSameMonth(transactionDate, intervalDate)
        }
      })

      // Calculate income and expenses
      const income = intervalTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)

      const expenses = intervalTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)

      // Format the date label based on interval type
      let dateLabel
      if (intervalType === "day") {
        dateLabel = format(intervalDate, "MMM d")
      } else if (intervalType === "week") {
        dateLabel = `${format(intervalDate, "MMM d")}`
      } else {
        dateLabel = format(intervalDate, "MMM yyyy")
      }

      return {
        date: dateLabel,
        income,
        expenses,
        net: income - expenses,
      }
    })
  }, [transactions, dateRange, intervalType])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for the selected period
      </div>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border/30 rounded-md shadow-md">
          <p className="font-medium text-sm mb-1">Date: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-xs flex items-center" style={{ color: entry.color }}>
              <span className="w-2 h-2 inline-block mr-1 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: ${Number(entry.value).toFixed(2)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={INCOME_COLOR} stopOpacity={0.8} />
              <stop offset="95%" stopColor={INCOME_COLOR} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={EXPENSE_COLOR} stopOpacity={0.8} />
              <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)", strokeWidth: 0.5 }}
          />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "var(--border)", strokeWidth: 0.5 }} />
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke={INCOME_COLOR}
            fillOpacity={1}
            fill="url(#colorIncome)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke={EXPENSE_COLOR}
            fillOpacity={1}
            fill="url(#colorExpenses)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

