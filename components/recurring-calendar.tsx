"use client"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import type { RecurringTransaction } from "@/hooks/use-recurring-store"

type RecurringCalendarProps = {
  transactions: RecurringTransaction[]
  currentMonth: Date
}

export function RecurringCalendar({ transactions, currentMonth }: RecurringCalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTransactionsForDay = (day: Date) => {
    return transactions.filter((t) => t.isActive && isSameDay(t.nextDate, day))
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className="text-center font-medium p-2">
          {day}
        </div>
      ))}

      {days.map((day) => {
        const dayTransactions = getTransactionsForDay(day)
        const hasTransactions = dayTransactions.length > 0

        return (
          <Card
            key={day.toString()}
            className={`min-h-[100px] ${hasTransactions ? "border-blue-200/50" : "border-border/40"}`}
          >
            <CardContent className="p-2">
              <div className="text-right text-xs font-medium text-muted-foreground">{format(day, "d")}</div>
              <div className="mt-1 space-y-1">
                {dayTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`text-xs p-1 rounded ${
                      transaction.type === "income"
                        ? "bg-green-100/50 text-green-800"
                        : transaction.type === "expense"
                          ? "bg-red-100/50 text-red-800"
                          : "bg-blue-100/50 text-blue-800"
                    }`}
                  >
                    <div className="font-medium truncate">{transaction.name}</div>
                    <div>{formatCurrency(transaction.amount)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

