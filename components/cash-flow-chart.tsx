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
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import type { Transaction } from "@/hooks/use-budget-store"

interface CashFlowChartProps {
  transactions: Transaction[]
  dateRange: [Date, Date]
}

export function CashFlowChart({ transactions, dateRange }: CashFlowChartProps) {
  // Chart colors
  const INCOME_COLOR = "#4ade80" // Green-400
  const EXPENSE_COLOR = "#f87171" // Red-400
  const TREND_COLOR = "#60a5fa" // Blue-400

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
    return intervals.map((intervalDate, index) => {
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

      // For the over/under chart, we'll keep income positive and make expenses negative
      const expensesNegative = -expenses

      // Calculate net for the trend line
      const net = income + expensesNegative

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
        expenses: expensesNegative, // Negative value for under axis display
        net,
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
          {payload.map((entry: any, index: number) => {
            // Handle the expenses case specially since we're displaying the absolute value
            const value =
              entry.name === "Expenses" ? Math.abs(Number(entry.value)).toFixed(2) : Number(entry.value).toFixed(2)

            return (
              <p key={`item-${index}`} className="text-xs flex items-center" style={{ color: entry.color }}>
                <span
                  className="w-2 h-2 inline-block mr-1 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></span>
                {entry.name}: ${value}
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[350px] w-full max-w-3xl mx-auto p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)", strokeWidth: 0.5 }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)", strokeWidth: 0.5 }}
            tickFormatter={(value) => `$${Math.abs(value)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1.5} />
          <Bar
            dataKey="income"
            name="Income"
            fill={INCOME_COLOR}
            radius={[4, 4, 0, 0]}
            barSize={intervalType === "day" ? 8 : 16}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill={EXPENSE_COLOR}
            radius={[0, 0, 4, 4]}
            barSize={intervalType === "day" ? 8 : 16}
          />
          <Line
            type="monotone"
            dataKey="net"
            name="Net Flow"
            stroke={TREND_COLOR}
            strokeWidth={2}
            dot={{ r: 3, fill: TREND_COLOR }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

