"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BudgetSummary } from "@/components/budget-summary"
import { TransactionSpreadsheet } from "@/components/transaction-spreadsheet"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { useBudgetStore } from "@/hooks/use-budget-store"

export function BudgetDashboard() {
  const [activeTab, setActiveTab] = useState("spreadsheet")
  const { transactions, categories } = useBudgetStore()

  return (
    <div className="space-y-6">
      <Tabs defaultValue="spreadsheet" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="spreadsheet">Transactions</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="spreadsheet" className="pt-4">
          <TransactionSpreadsheet />
        </TabsContent>
        <TabsContent value="summary" className="pt-4">
          <BudgetSummary />
        </TabsContent>
        <TabsContent value="categories" className="pt-4">
          <CategoryBreakdown />
        </TabsContent>
      </Tabs>
    </div>
  )
}

