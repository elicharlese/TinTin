"use client"

import { useMemo } from "react"
import { format, parseISO, differenceInMonths } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, Calendar } from "lucide-react"

// This would normally come from the store, but we'll mock it for now
interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  icon: "target" | "trending-up" | "calendar"
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
    imageUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: "vacation",
    name: "Summer Vacation",
    targetAmount: 3000,
    currentAmount: 1200,
    targetDate: new Date(2023, 5, 15).toISOString(),
    category: "Travel",
    icon: "calendar",
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

export function GoalsSummary() {
  // In a real app, we would get goals from the store
  // const { goals } = useBudgetStore()
  const goals = mockGoals

  // Calculate goal progress
  const goalsWithProgress = useMemo(() => {
    return goals.map((goal) => {
      const percentage = (goal.currentAmount / goal.targetAmount) * 100
      const remaining = goal.targetAmount - goal.currentAmount

      // Calculate months remaining
      const today = new Date()
      const targetDate = parseISO(goal.targetDate)
      const monthsRemaining = differenceInMonths(targetDate, today)

      // Calculate monthly contribution needed
      const monthlyContribution = monthsRemaining > 0 ? remaining / monthsRemaining : remaining

      return {
        ...goal,
        percentage,
        remaining,
        monthsRemaining,
        monthlyContribution,
      }
    })
  }, [goals])

  // Get icon component
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "target":
        return <Target className="h-5 w-5" />
      case "trending-up":
        return <TrendingUp className="h-5 w-5" />
      case "calendar":
        return <Calendar className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  if (goalsWithProgress.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No financial goals found</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2">
        {goalsWithProgress.map((goal) => (
          <Card key={goal.id}>
            {goal.imageUrl && (
              <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                <img src={goal.imageUrl || "/placeholder.svg"} alt={goal.name} className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    {getIcon(goal.icon)}
                  </div>
                  <div>
                    <div className="font-medium text-lg">{goal.name}</div>
                    <div className="text-xs text-muted-foreground">{goal.category}</div>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <div className="text-sm font-medium">{goal.percentage.toFixed(0)}%</div>
                </div>
                <Progress value={goal.percentage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
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
                    {goal.monthlyContribution.toLocaleString("en-US", {
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

