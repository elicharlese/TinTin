"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Calendar, Edit, Trash2, Target, TrendingUp, PiggyBank } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, parseISO, addMonths, differenceInMonths } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// This would normally come from the store, but we'll mock it for now
interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  icon: "target" | "trending-up" | "piggy-bank"
  notes?: string
  imageUrl?: string
}

const mockGoals: Goal[] = [
  {
    id: "emergency-fund",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 5000,
    targetDate: new Date(2023, 11, 31).toISOString(),
    category: "Savings",
    icon: "target",
    notes: "Build up 3 months of living expenses",
    imageUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: "vacation",
    name: "Summer Vacation",
    targetAmount: 3000,
    currentAmount: 1200,
    targetDate: new Date(2023, 5, 15).toISOString(),
    category: "Travel",
    icon: "target",
    notes: "Trip to Hawaii",
    imageUrl: "/placeholder.svg?height=100&width=200&text=Hawaii",
  },
  {
    id: "investment",
    name: "Investment Portfolio",
    targetAmount: 50000,
    currentAmount: 15000,
    targetDate: new Date(2025, 0, 1).toISOString(),
    category: "Investment",
    icon: "trending-up",
    imageUrl: "/placeholder.svg?height=100&width=200&text=Investments",
  },
]

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [targetDate, setTargetDate] = useState<Date>(addMonths(new Date(), 6))
  const [category, setCategory] = useState("Savings")
  const [icon, setIcon] = useState<"target" | "trending-up" | "piggy-bank">("target")
  const [notes, setNotes] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Reset form
  const resetForm = () => {
    setName("")
    setTargetAmount("")
    setCurrentAmount("")
    setTargetDate(addMonths(new Date(), 6))
    setCategory("Savings")
    setIcon("target")
    setNotes("")
    setImageUrl("")
  }

  // Load goal data for editing
  const loadGoalForEditing = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    setName(goal.name)
    setTargetAmount(goal.targetAmount.toString())
    setCurrentAmount(goal.currentAmount.toString())
    setTargetDate(parseISO(goal.targetDate))
    setCategory(goal.category)
    setIcon(goal.icon)
    setNotes(goal.notes || "")
    setImageUrl(goal.imageUrl || "")
    setEditingGoal(goalId)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const targetAmountValue = Number.parseFloat(targetAmount)
      const currentAmountValue = Number.parseFloat(currentAmount)

      if (isNaN(targetAmountValue) || targetAmountValue <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid target amount",
          description: "Please enter a valid positive number for the target amount",
        })
        return
      }

      if (isNaN(currentAmountValue) || currentAmountValue < 0) {
        toast({
          variant: "destructive",
          title: "Invalid current amount",
          description: "Please enter a valid non-negative number for the current amount",
        })
        return
      }

      const newGoal: Goal = {
        id: editingGoal || crypto.randomUUID(),
        name,
        targetAmount: targetAmountValue,
        currentAmount: currentAmountValue,
        targetDate: targetDate.toISOString(),
        category,
        icon,
        notes: notes || undefined,
        imageUrl: imageUrl || undefined,
      }

      if (editingGoal) {
        setGoals(goals.map((g) => (g.id === editingGoal ? newGoal : g)))
        toast({
          title: "Goal updated",
          description: "Your financial goal has been updated successfully",
        })
      } else {
        setGoals([...goals, newGoal])
        toast({
          title: "Goal added",
          description: "Your new financial goal has been added successfully",
        })
      }

      resetForm()
      setIsAddingGoal(false)
      setEditingGoal(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save goal",
      })
    }
  }

  // Handle goal deletion
  const handleDeleteGoal = (goalId: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      setGoals(goals.filter((g) => g.id !== goalId))
      toast({
        title: "Goal deleted",
        description: "Your financial goal has been deleted successfully",
      })
    }
  }

  // Get icon component
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "target":
        return <Target className="h-5 w-5" />
      case "trending-up":
        return <TrendingUp className="h-5 w-5" />
      case "piggy-bank":
        return <PiggyBank className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Goals</h1>
          <p className="text-muted-foreground">Track progress towards your financial goals</p>
        </div>

        <Button
          onClick={() => {
            resetForm()
            setIsAddingGoal(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Financial Goals Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Set financial goals to help you stay on track with your savings and investments.
            </p>
            <Button
              onClick={() => {
                resetForm()
                setIsAddingGoal(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-6">
          {goals.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100
            const remaining = goal.targetAmount - goal.currentAmount

            // Calculate months remaining
            const today = new Date()
            const targetDate = parseISO(goal.targetDate)
            const monthsRemaining = differenceInMonths(targetDate, today)

            // Calculate monthly contribution needed
            const monthlyContribution = monthsRemaining > 0 ? remaining / monthsRemaining : remaining

            return (
              <div className="w-1/2" key={goal.id}>
                <Card>
                  {goal.imageUrl && (
                    <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={goal.imageUrl || "/placeholder.svg"}
                        alt={goal.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        {getIcon(goal.icon)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{goal.name}</CardTitle>
                        <CardDescription>{goal.category}</CardDescription>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => loadGoalForEditing(goal.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Goal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Goal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="text-sm font-medium">{percentage.toFixed(0)}%</div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <div className="text-muted-foreground">Current</div>
                        <div className="font-medium">
                          {goal.currentAmount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Target</div>
                        <div className="font-medium">
                          {goal.targetAmount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Monthly Need</div>
                        <div className="font-medium">
                          {monthlyContribution.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Target Date</div>
                        <div className="font-medium">{format(parseISO(goal.targetDate), "MMM d, yyyy")}</div>
                      </div>
                    </div>

                    {goal.notes && <div className="text-xs text-muted-foreground border-t pt-2">{goal.notes}</div>}
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Goal Dialog */}
      <Dialog
        open={isAddingGoal || editingGoal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingGoal(false)
            setEditingGoal(null)
            resetForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Add Goal"}</DialogTitle>
            <DialogDescription>
              {editingGoal ? "Update your financial goal" : "Set a new financial goal to track your progress"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Emergency Fund"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-muted-foreground">$</span>
                    </div>
                    <Input
                      id="targetAmount"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAmount">Current Amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-muted-foreground">$</span>
                    </div>
                    <Input
                      id="currentAmount"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(targetDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={targetDate}
                      onSelect={(date) => {
                        if (date) {
                          setTargetDate(date)
                          setIsDatePickerOpen(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Savings">Savings</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                      <SelectItem value="Retirement">Retirement</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Vehicle">Vehicle</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={icon}
                    onValueChange={(value: "target" | "trending-up" | "piggy-bank") => setIcon(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="target">Target</SelectItem>
                      <SelectItem value="trending-up">Growth</SelectItem>
                      <SelectItem value="piggy-bank">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional details about this goal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">Enter a URL for an image that represents your goal</p>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingGoal(false)
                  setEditingGoal(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingGoal ? "Save Changes" : "Add Goal"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

