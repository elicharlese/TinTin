"use client"

import { useMemo } from "react"
import { useBudgetStore } from "@/hooks/use-budget-store"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Wallet, Landmark, TrendingUp } from "lucide-react"

export function AccountsSummary() {
  const { accounts } = useBudgetStore()

  // Group accounts by type
  const accountsByType = useMemo(() => {
    const grouped = accounts.reduce(
      (acc, account) => {
        if (!acc[account.type]) {
          acc[account.type] = []
        }
        acc[account.type].push(account)
        return acc
      },
      {} as Record<string, typeof accounts>,
    )

    return grouped
  }, [accounts])

  // Calculate total balance
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => sum + account.balance, 0)
  }, [accounts])

  // Get icon for account type
  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <Wallet className="h-4 w-4" />
      case "savings":
        return <Landmark className="h-4 w-4" />
      case "credit":
        return <CreditCard className="h-4 w-4" />
      case "investment":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  // Format account type label
  const formatAccountType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (accounts.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No accounts found</div>
  }

  return (
    <div className="space-y-3">
      {Object.entries(accountsByType).map(([type, typeAccounts]) => (
        <div key={type}>
          <div className="flex items-center mb-1.5">
            {getAccountTypeIcon(type)}
            <h3 className="text-sm font-medium ml-1.5">{formatAccountType(type)} Accounts</h3>
          </div>

          <div className="grid gap-2">
            {typeAccounts.map((account) => {
              // Calculate percentage of total (for positive balances)
              const percentage = totalBalance > 0 && account.balance > 0 ? (account.balance / totalBalance) * 100 : 0

              return (
                <Card key={account.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm truncate">{account.name}</div>
                      <div className="text-xs text-muted-foreground truncate ml-2">{account.institution}</div>
                    </div>

                    <div className={`text-base font-bold mb-1 ${account.balance >= 0 ? "" : "text-red-500"}`}>
                      {account.balance.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </div>

                    {account.balance > 0 && (
                      <>
                        <Progress value={percentage} className="h-1.5 mb-0.5" />
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total</div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

