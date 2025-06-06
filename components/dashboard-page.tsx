"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentTransactions } from "@/components/recent-transactions"
import { AccountsSummary } from "@/components/accounts-summary"
import { BudgetProgress } from "@/components/budget-progress"
import { GoalsSummary } from "@/components/goals-summary"
import { useAuth } from "@/hooks/use-auth"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bell,
  CheckCircle,
  Download,
  FileText,
  Info,
  Printer,
  Share2,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, subDays } from "date-fns"

export function DashboardPage() {
  const { user, isDemoMode } = useAuth()

  // Sample data for analytics charts
  const spendingData = [
    { name: "Jan", amount: 1200 },
    { name: "Feb", amount: 1900 },
    { name: "Mar", amount: 1500 },
    { name: "Apr", amount: 1700 },
    { name: "May", amount: 1400 },
    { name: "Jun", amount: 2100 },
    { name: "Jul", amount: 1800 },
    { name: "Aug", amount: 2300 },
    { name: "Sep", amount: 1900 },
    { name: "Oct", amount: 2100 },
    { name: "Nov", amount: 2500 },
    { name: "Dec", amount: 2800 },
  ]

  const incomeVsExpenseData = [
    { name: "Jan", income: 4500, expenses: 1200 },
    { name: "Feb", income: 4500, expenses: 1900 },
    { name: "Mar", income: 4500, expenses: 1500 },
    { name: "Apr", income: 5000, expenses: 1700 },
    { name: "May", income: 5000, expenses: 1400 },
    { name: "Jun", income: 5000, expenses: 2100 },
    { name: "Jul", income: 5500, expenses: 1800 },
    { name: "Aug", income: 5500, expenses: 2300 },
    { name: "Sep", income: 5500, expenses: 1900 },
    { name: "Oct", income: 6000, expenses: 2100 },
    { name: "Nov", income: 6000, expenses: 2500 },
    { name: "Dec", income: 6000, expenses: 2800 },
  ]

  const categoryData = [
    { name: "Housing", value: 1200, color: "#8884d8" },
    { name: "Food", value: 800, color: "#82ca9d" },
    { name: "Transportation", value: 500, color: "#ffc658" },
    { name: "Entertainment", value: 300, color: "#ff8042" },
    { name: "Utilities", value: 400, color: "#0088fe" },
  ]

  // Sample data for reports
  const monthlyReports = [
    {
      id: "report-1",
      title: "Monthly Financial Summary",
      description: "Overview of income, expenses, and savings",
      date: "2023-11-01",
      type: "summary",
      status: "ready",
    },
    {
      id: "report-2",
      title: "Budget Analysis",
      description: "Detailed breakdown of budget vs. actual spending",
      date: "2023-11-01",
      type: "budget",
      status: "ready",
    },
    {
      id: "report-3",
      title: "Investment Performance",
      description: "Analysis of investment returns and portfolio allocation",
      date: "2023-11-01",
      type: "investment",
      status: "ready",
    },
    {
      id: "report-4",
      title: "Tax Summary",
      description: "Year-to-date tax implications and planning opportunities",
      date: "2023-11-01",
      type: "tax",
      status: "ready",
    },
  ]

  const quarterlyReports = [
    {
      id: "report-5",
      title: "Q3 Financial Review",
      description: "Comprehensive review of Q3 financial performance",
      date: "2023-10-01",
      type: "quarterly",
      status: "ready",
    },
    {
      id: "report-6",
      title: "Debt Reduction Progress",
      description: "Analysis of debt reduction strategies and progress",
      date: "2023-10-01",
      type: "debt",
      status: "ready",
    },
  ]

  // Sample data for notifications
  const notifications = [
    {
      id: "notif-1",
      title: "Unusual spending detected",
      message: "We noticed a large transaction of $523.45 at Electronics Store",
      date: subDays(new Date(), 0).toISOString(),
      type: "alert",
      priority: "high",
      read: false,
    },
    {
      id: "notif-2",
      title: "Bill due tomorrow",
      message: "Your electricity bill of $142.50 is due tomorrow",
      date: subDays(new Date(), 1).toISOString(),
      type: "bill",
      priority: "medium",
      read: false,
    },
    {
      id: "notif-3",
      title: "Budget alert",
      message: "You've reached 90% of your dining out budget for this month",
      date: subDays(new Date(), 2).toISOString(),
      type: "budget",
      priority: "medium",
      read: true,
    },
    {
      id: "notif-4",
      title: "New feature available",
      message: "Try our new investment tracking feature to monitor your portfolio",
      date: subDays(new Date(), 3).toISOString(),
      type: "system",
      priority: "low",
      read: false,
    },
    {
      id: "notif-5",
      title: "Account linked successfully",
      message: "Your Chase checking account has been successfully linked",
      date: subDays(new Date(), 5).toISOString(),
      type: "system",
      priority: "low",
      read: true,
    },
    {
      id: "notif-6",
      title: "Savings goal reached",
      message: "Congratulations! You've reached your emergency fund goal of $10,000",
      date: subDays(new Date(), 7).toISOString(),
      type: "goal",
      priority: "medium",
      read: true,
    },
  ]

  // Helper function to get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "bill":
        return <FileText className="h-5 w-5 text-amber-500" />
      case "budget":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "system":
        return <Info className="h-5 w-5 text-blue-500" />
      case "goal":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Helper function to get notification badge color
  const getNotificationBadgeColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "low":
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          {isDemoMode && (
            <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Demo Mode
            </div>
          )}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$5,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Income</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+$3,452.00</div>
                <p className="text-xs text-muted-foreground">+4.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-$1,234.56</div>
                <p className="text-xs text-muted-foreground">-2.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">35.2%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Restructured grid layout with Budget Progress spanning 2 rows */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Transactions - 4 columns */}
            <Card className="col-span-4 row-span-1">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>You had 12 transactions this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions />
              </CardContent>
            </Card>

            {/* Accounts Summary - 3 columns */}
            <Card className="col-span-3 row-span-1">
              <CardHeader>
                <CardTitle>Accounts Summary</CardTitle>
                <CardDescription>Your financial accounts overview.</CardDescription>
              </CardHeader>
              <CardContent>
                <AccountsSummary />
              </CardContent>
            </Card>

            {/* Budget Progress - 7 columns, spanning 2 rows */}
            <Card className="col-span-7 row-span-2">
              <CardHeader>
                <CardTitle>Budget Progress</CardTitle>
                <CardDescription>Your monthly budget progress.</CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetProgress />
              </CardContent>
            </Card>

            {/* Financial Goals - 7 columns, spanning 2 rows */}
            <Card className="col-span-7 row-span-2">
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Track your progress towards your goals.</CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsSummary />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Spending</CardTitle>
                <CardDescription>Your spending trends over the past year</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div>Average: $1,933</div>
                <div className="flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  <span>+16.2% YoY</span>
                </div>
              </CardFooter>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Income vs. Expenses</CardTitle>
                <CardDescription>Monthly comparison of income and expenses</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incomeVsExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div>Average Savings: $3,067 per month</div>
                <div className="flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  <span>+8.5% YoY</span>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Breakdown of your monthly expenses</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div>Total Expenses: $3,200</div>
                <div className="flex items-center">
                  <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
                  <span>-3.2% MoM</span>
                </div>
              </CardFooter>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Financial Insights</CardTitle>
                <CardDescription>Key metrics and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg p-3">
                      <div className="text-sm font-medium text-muted-foreground">Debt-to-Income Ratio</div>
                      <div className="mt-1 flex items-center">
                        <span className="text-2xl font-bold">18%</span>
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Healthy</Badge>
                      </div>
                    </div>
                    <div className="rounded-lg p-3">
                      <div className="text-sm font-medium text-muted-foreground">Emergency Fund</div>
                      <div className="mt-1 flex items-center">
                        <span className="text-2xl font-bold">4.2 months</span>
                        <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-200">Almost There</Badge>
                      </div>
                    </div>
                    <div className="rounded-lg p-3">
                      <div className="text-sm font-medium text-muted-foreground">Savings Rate</div>
                      <div className="mt-1 flex items-center">
                        <span className="text-2xl font-bold">24%</span>
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Excellent</Badge>
                      </div>
                    </div>
                    <div className="rounded-lg p-3">
                      <div className="text-sm font-medium text-muted-foreground">Investment Returns</div>
                      <div className="mt-1 flex items-center">
                        <span className="text-2xl font-bold">8.4%</span>
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Above Average</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg p-4">
                    <h4 className="font-medium">Recommendations</h4>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-start">
                        <ArrowUp className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          Increase your emergency fund by $2,400 to reach the recommended 6 months of expenses.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <ArrowDown className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>Consider refinancing your mortgage to take advantage of lower interest rates.</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUp className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Increase your retirement contributions by 2% to maximize employer match.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Available Reports</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print All
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Reports</CardTitle>
                <CardDescription>November 2023</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyReports.map((report) => (
                    <div key={report.id} className="flex items-start justify-between rounded-lg p-3">
                      <div>
                        <h4 className="font-medium">{report.title}</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <FileText className="mr-1 h-3 w-3" />
                          <span>Generated on {format(new Date(report.date), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Monthly Reports
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quarterly Reports</CardTitle>
                <CardDescription>Q3 2023</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quarterlyReports.map((report) => (
                    <div key={report.id} className="flex items-start justify-between rounded-lg p-3">
                      <div>
                        <h4 className="font-medium">{report.title}</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <FileText className="mr-1 h-3 w-3" />
                          <span>Generated on {format(new Date(report.date), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Quarterly Reports
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report Scheduler</CardTitle>
              <CardDescription>Set up automatic report generation and delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg p-3">
                  <h4 className="font-medium">Monthly Summary</h4>
                  <p className="text-sm text-muted-foreground">Delivered on the 1st of each month</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="rounded-lg p-3">
                  <h4 className="font-medium">Weekly Transactions</h4>
                  <p className="text-sm text-muted-foreground">Delivered every Monday</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="rounded-lg p-3">
                  <h4 className="font-medium">Tax Documents</h4>
                  <p className="text-sm text-muted-foreground">Delivered quarterly</p>
                  <Badge className="mt-2 bg-amber-100 text-amber-800">Pending</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Manage Report Schedule
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Recent Notifications</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Mark All as Read
              </Button>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>
                You have {notifications.filter((n) => !n.read).length} unread notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start p-3 rounded-lg ${notification.read ? "bg-background" : "bg-muted/30"}`}
                    >
                      <div className="flex-shrink-0 mr-3 mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`font-medium ${notification.read ? "" : "font-semibold"}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground ml-2">
                            {format(new Date(notification.date), "MMM d")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex items-center mt-2">
                          <Badge className={`mr-2 ${getNotificationBadgeColor(notification.priority)}`}>
                            {notification.priority}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            {notification.read ? "Mark as unread" : "Mark as read"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View All</Button>
              <Button variant="outline">Notification Settings</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Categories</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                        <span>Security Alerts</span>
                      </div>
                      <Badge>Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Bill Reminders</span>
                      </div>
                      <Badge>Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                        <span>Budget Alerts</span>
                      </div>
                      <Badge>Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Info className="h-4 w-4 text-blue-500 mr-2" />
                        <span>System Updates</span>
                      </div>
                      <Badge>Enabled</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Delivery Methods</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>In-app Notifications</span>
                      <Badge>Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email Notifications</span>
                      <Badge>Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Push Notifications</span>
                      <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SMS Notifications</span>
                      <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Update Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

