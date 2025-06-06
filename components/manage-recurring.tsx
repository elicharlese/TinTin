"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecurringTransactionDialog } from "@/components/recurring-transaction-dialog"
import { useRecurringStore } from "@/hooks/use-recurring-store"

export function ManageRecurring() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { recurringTransactions } = useRecurringStore()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const filteredTransactions = recurringTransactions.filter((t) => {
    if (activeTab === "all") return true
    return t.type === activeTab
  })

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manage Recurring</h1>
        <Button onClick={() => setDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Recurring
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-auto" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="credit">Credit Cards</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{transaction.name}</div>
                  <div className="text-sm text-gray-500">
                    {transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="text-sm text-gray-500">Next: {transaction.nextDate.toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <RecurringTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

