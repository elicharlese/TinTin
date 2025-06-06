"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { RecentTransactions } from "@/components/recent-transactions"
import { AccountsSummary } from "@/components/accounts-summary"
import { BudgetProgress } from "@/components/budget-progress"
import { GoalsSummary } from "@/components/goals-summary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, DollarSign, LineChart, PiggyBank } from "lucide-react"

export default function AppDashboard() {
  const { isAuthenticated, isDemoMode, isLoading } = useAuth()
  const router = useRouter()

  // Redirect unauthenticated users to welcome page
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isDemoMode) {
      router.push("/")
    }
  }, [isAuthenticated, isDemoMode, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated and not in demo mode, don't render anything (will redirect)
  if (!isAuthenticated && !isDemoMode) {
    return null
  }

  // If authenticated or in demo mode, show the dashboard
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last updated: Today at 9:41 AM</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$3,352.14</div>
                <p className="text-xs text-muted-foreground">-4% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investments</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,234.59</div>
                <p className="text-xs text-muted-foreground">+2.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,247.86</div>
                <p className="text-xs text-muted-foreground">42% of monthly budget</p>
              </CardContent>
            </Card>
          </div>

          {/* Restructured grid layout with Budget Progress spanning 2 rows */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Transactions - 4 columns */}
            <Card className="col-span-4 row-span-1">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions />
              </CardContent>
            </Card>

            {/* Accounts Summary - 3 columns */}
            <Card className="col-span-3 row-span-1">
              <CardHeader>
                <CardTitle>Accounts Summary</CardTitle>
                <CardDescription>Your financial accounts overview</CardDescription>
              </CardHeader>
              <CardContent>
                <AccountsSummary />
              </CardContent>
            </Card>

            {/* Budget Progress - 7 columns, spanning 2 rows */}
            <Card className="col-span-7 row-span-2">
              <CardHeader>
                <CardTitle>Budget Progress</CardTitle>
                <CardDescription>Your spending against budget categories</CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetProgress />
              </CardContent>
            </Card>

            {/* Financial Goals - 7 columns, spanning 2 rows */}
            <Card className="col-span-7 row-span-2">
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Track your progress towards goals</CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsSummary />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Content</CardTitle>
              <CardDescription>Detailed analysis of your financial data</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Analytics charts and data will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports Content</CardTitle>
              <CardDescription>Generated financial reports</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Financial reports will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications Content</CardTitle>
              <CardDescription>Your financial alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Notifications will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

