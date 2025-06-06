"use client"

import { MoreHorizontal } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { RecurringTransaction } from "@/hooks/use-recurring-store"

type RecurringTransactionItemProps = {
  transaction: RecurringTransaction
  onEdit?: (transaction: RecurringTransaction) => void
}

export function RecurringTransactionItem({ transaction, onEdit }: RecurringTransactionItemProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center p-4">
          <div className="flex items-center gap-4 w-1/4">
            <Avatar className="h-10 w-10 rounded-full bg-blue-100">
              <div className="text-xs font-medium text-blue-600">{transaction.name.substring(0, 2).toUpperCase()}</div>
            </Avatar>
            <div>
              <div className="font-medium">{transaction.name}</div>
              <div className="text-sm text-gray-500">
                {transaction.syncedVia ? `Synced via ${transaction.syncedVia}` : ""}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 w-3/4">
            <div>
              Mar {transaction.nextDate.getDate()}
              {transaction.daysUntilNext && (
                <span className="text-gray-500 text-sm ml-1">({transaction.daysUntilNext} days)</span>
              )}
            </div>
            <div className="text-gray-500">{transaction.account || "Not selected"}</div>
            <div className="text-gray-500">{transaction.category || "Not selected"}</div>
            <div className="flex justify-between items-center">
              <div className="font-medium text-right flex-1">{formatCurrency(transaction.amount)}</div>
              <Button variant="ghost" size="icon" onClick={() => onEdit?.(transaction)}>
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

