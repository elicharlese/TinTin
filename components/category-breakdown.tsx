"use client"

import { useState } from "react"
import { ChevronRight, FolderPlus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useBudgetStore, type Category } from "@/hooks/use-budget-store"
import { CategoryForm } from "@/components/category-form"

interface CategoryBreakdownProps {
  rootCategoryId?: string
  onCategorySelect?: (categoryId: string) => void
}

export function CategoryBreakdown({ rootCategoryId, onCategorySelect }: CategoryBreakdownProps) {
  const { categories, transactions, deleteCategory } = useBudgetStore()
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    income: true,
    expenses: true,
  })

  // Build category tree
  const categoryTree = categories.reduce(
    (acc, category) => {
      if (!category.parentId) {
        if (!acc[category.id]) {
          acc[category.id] = {
            ...category,
            children: [],
          }
        } else {
          acc[category.id] = {
            ...category,
            children: acc[category.id].children,
          }
        }
        return acc
      }

      if (!acc[category.parentId]) {
        acc[category.parentId] = {
          children: [category],
        } as any
      } else {
        acc[category.parentId].children.push(category)
      }

      return acc
    },
    {} as Record<string, Category & { children: Category[] }>,
  )

  // Count transactions per category (including subcategories)
  const getCategoryTransactionCount = (categoryId: string): number => {
    const directCount = transactions.filter((t) => t.categoryId === categoryId).length

    // Get all subcategories
    const subcategories = categories.filter((c) => c.parentId === categoryId)
    const subcategoryCount = subcategories.reduce((sum, subcat) => sum + getCategoryTransactionCount(subcat.id), 0)

    return directCount + subcategoryCount
  }

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Check if category can be deleted (no transactions)
  const canDeleteCategory = (categoryId: string): boolean => {
    return getCategoryTransactionCount(categoryId) === 0
  }

  // Render category tree
  const renderCategoryTree = (categoryId: string, level = 0) => {
    const category = categoryTree[categoryId]
    if (!category) return null

    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories[categoryId]
    const transactionCount = getCategoryTransactionCount(categoryId)
    const canDelete = canDeleteCategory(categoryId)

    return (
      <div key={categoryId} className="category-tree">
        <div
          className={`flex items-center py-2 px-2 rounded-md hover:bg-muted/50 ${level > 0 ? "ml-6" : ""} ${onCategorySelect ? "cursor-pointer" : ""}`}
          style={{ marginLeft: `${level * 1.5}rem` }}
          onClick={() => onCategorySelect && onCategorySelect(categoryId)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation()
                toggleCategory(categoryId)
              }}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </Button>
          )}

          {!hasChildren && <div className="w-7" />}

          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />

          <span className="flex-1 font-medium">{category.name}</span>

          <span className="text-sm text-muted-foreground mr-2">
            {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              setEditingCategory(category)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {canDelete && categoryId !== "income" && categoryId !== "expenses" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                deleteCategory(categoryId)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="category-children">
            {category.children
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((child) => renderCategoryTree(child.id, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // If rootCategoryId is provided, only render that category tree
  if (rootCategoryId) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {rootCategoryId === "income" ? "Income Categories" : "Expense Categories"}
          </h2>
          <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
              </DialogHeader>
              <CategoryForm
                defaultParentId={rootCategoryId}
                onSubmit={() => setIsAddingCategory(false)}
                onCancel={() => setIsAddingCategory(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">{renderCategoryTree(rootCategoryId)}</CardContent>
        </Card>

        {editingCategory && (
          <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <CategoryForm
                category={editingCategory}
                onSubmit={() => setEditingCategory(null)}
                onCancel={() => setEditingCategory(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories</h2>
        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="mr-2 h-4 w-4" />
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

      <div className="flex gap-4">
        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Income Categories</CardTitle>
              <CardDescription>Categories for tracking your income sources</CardDescription>
            </CardHeader>
            <CardContent>{renderCategoryTree("income")}</CardContent>
          </Card>
        </div>

        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Categories for tracking your spending</CardDescription>
            </CardHeader>
            <CardContent>{renderCategoryTree("expenses")}</CardContent>
          </Card>
        </div>
      </div>

      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              onSubmit={() => setEditingCategory(null)}
              onCancel={() => setEditingCategory(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

