"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBudgetStore, type Category } from "@/hooks/use-budget-store"

interface CategoryFormProps {
  category?: Category
  defaultParentId?: string
  onSubmit: () => void
  onCancel: () => void
}

export function CategoryForm({ category, defaultParentId, onSubmit, onCancel }: CategoryFormProps) {
  const { categories, addCategory, updateCategory } = useBudgetStore()
  const [name, setName] = useState(category?.name || "")
  const [color, setColor] = useState(category?.color || "#6366f1")
  const [parentId, setParentId] = useState(category?.parentId || defaultParentId || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    if (category) {
      updateCategory(category.id, {
        name,
        color,
        parentId: parentId || null,
      })
    } else {
      addCategory({
        name,
        color,
        parentId: parentId || null,
      })
    }

    onSubmit()
  }

  // Get parent categories for dropdown
  const parentCategories = categories.filter((c) => !c.parentId || c.id === "income" || c.id === "expenses")

  // Get subcategories for nested dropdown
  const getSubcategories = (parentId: string, level = 0): React.ReactNode[] => {
    const subcategories = categories.filter((c) => c.parentId === parentId && c.id !== category?.id)

    if (subcategories.length === 0) return []

    return subcategories.flatMap((subcat) => [
      <option key={subcat.id} value={subcat.id} disabled={subcat.id === category?.id}>
        {"  ".repeat(level)}
        {level > 0 ? "└ " : ""}
        {subcat.name}
      </option>,
      ...getSubcategories(subcat.id, level + 1),
    ])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Groceries, Rent, Salary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="flex items-center gap-2">
          <Input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-10 p-1"
          />
          <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#6366f1" className="flex-1" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Parent Category</Label>
        <select
          id="parentId"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full p-2 rounded-md bg-background border border-input"
        >
          <option value="">No Parent (Top Level)</option>
          <option value="income">Income</option>
          <option value="expenses">Expenses</option>
          {parentCategories
            .filter((c) => c.id !== "income" && c.id !== "expenses" && c.id !== category?.id)
            .map((parent) => (
              <option key={parent.id} value={parent.id} disabled={parent.id === category?.id}>
                {parent.name}
              </option>
            ))}
          {parentCategories
            .filter((c) => c.id !== "income" && c.id !== "expenses" && c.id !== category?.id)
            .flatMap((parent) => getSubcategories(parent.id, 1))}
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{category ? "Update" : "Create"}</Button>
      </div>
    </form>
  )
}

