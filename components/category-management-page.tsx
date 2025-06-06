"use client"

import { useState } from "react"
import { PlusCircle, Filter, ArrowDownUp, Download } from "lucide-react"
import { useBudgetStore, type Category } from "@/hooks/use-budget-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CategoryForm } from "@/components/category-form"
import { CategoryBreakdownChart } from "@/components/category-breakdown-chart"
import { CategoryTransactionsList } from "@/components/category-transactions-list"

export function CategoryManagementPage() {
  const { categories, transactions } = useBudgetStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [timeframe, setTimeframe] = useState("all")
  const [sortBy, setSortBy] = useState("amount")

  // Get top-level categories
  const topLevelCategories = categories.filter(
    (c) => !c.parentId || c.parentId === "income" || c.parentId === "expenses",
  )

  // Get all subcategories for a given parent
  const getSubcategories = (parentId: string): Category[] => {
    return categories.filter((c) => c.parentId === parentId)
  }

  // Calculate total amount for a category (including subcategories)
  const getCategoryTotal = (categoryId: string): number => {
    // Direct transactions in this category
    const directAmount = transactions.filter((t) => t.categoryId === categoryId).reduce((sum, t) => sum + t.amount, 0)

    // Transactions in subcategories
    const subcategories = getSubcategories(categoryId)
    const subcategoryAmount = subcategories.reduce((sum, subcat) => sum + getCategoryTotal(subcat.id), 0)

    return directAmount + subcategoryAmount
  }

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get transaction count for a category
  const getCategoryTransactionCount = (categoryId: string): number => {
    // Direct transactions
    const directCount = transactions.filter((t) => t.categoryId === categoryId).length

    // Transactions in subcategories
    const subcategories = getSubcategories(categoryId)
    const subcategoryCount = subcategories.reduce((sum, subcat) => sum + getCategoryTransactionCount(subcat.id), 0)

    return directCount + subcategoryCount
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onSubmit={() => setIsAddingCategory(false)} onCancel={() => setIsAddingCategory(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>View your spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <CategoryBreakdownChart />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Categories</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[200px]"
                  />
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ArrowDownUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                  {selectedCategory && <TabsTrigger value="details">Category Details</TabsTrigger>}
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topLevelCategories.map((category) => (
                      <div
                        key={category.id}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          <h3 className="font-medium">{category.name}</h3>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{getCategoryTransactionCount(category.id)} transactions</span>
                          <span className={category.type === "income" ? "text-green-500" : ""}>
                            {getCategoryTotal(category.id).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="income">
                  <div className="space-y-4">
                    {filteredCategories
                      .filter((c) => c.type === "income")
                      .map((category) => (
                        <div
                          key={category.id}
                          className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                            <h3 className="font-medium">{category.name}</h3>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{getCategoryTransactionCount(category.id)} transactions</span>
                            <span className="text-green-500">
                              {getCategoryTotal(category.id).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="expenses">
                  <div className="space-y-4">
                    {filteredCategories
                      .filter((c) => c.type === "expense")
                      .map((category) => (
                        <div
                          key={category.id}
                          className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                            <h3 className="font-medium">{category.name}</h3>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{getCategoryTransactionCount(category.id)} transactions</span>
                            <span>
                              {getCategoryTotal(category.id).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                {selectedCategory && (
                  <TabsContent value="details">
                    <CategoryTransactionsList categoryId={selectedCategory} />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

