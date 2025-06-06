"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, AlertTriangle, CreditCard, PiggyBank, Target, Info, Check, X, ChevronRight, Filter } from "lucide-react"
import { format } from "date-fns"
import { useAlertsStore, type Alert, type AlertType } from "@/hooks/use-alerts-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { AlertGenerator } from "@/components/alert-generator"

export function AlertsPage() {
  const router = useRouter()
  const { alerts, markAsRead, markAllAsRead, dismissAlert, dismissAllAlerts, deleteAlert, clearAlerts, unreadCount } =
    useAlertsStore()

  const [filter, setFilter] = useState<AlertType | "all">("all")
  const [showDismissed, setShowDismissed] = useState(false)

  // Generate sample alerts for demo purposes
  useEffect(() => {
    if (alerts.length === 0) {
      import("@/hooks/use-alerts-store").then((module) => {
        module.generateSampleAlerts()
      })
    }
  }, [alerts.length])

  const filteredAlerts = alerts.filter((alert) => {
    if (!showDismissed && alert.dismissed) return false
    if (filter === "all") return true
    return alert.type === filter
  })

  const activeAlerts = alerts.filter((alert) => !alert.dismissed)
  const dismissedAlerts = alerts.filter((alert) => alert.dismissed)

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "bill":
        return <CreditCard className="h-5 w-5" />
      case "budget":
        return <PiggyBank className="h-5 w-5" />
      case "account":
        return <AlertTriangle className="h-5 w-5" />
      case "goal":
        return <Target className="h-5 w-5" />
      case "system":
        return <Info className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: Alert["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-300"
      case "medium":
        return "text-amber-500 bg-amber-50 dark:bg-amber-950 dark:text-amber-300"
      case "low":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950 dark:text-blue-300"
    }
  }

  const handleAction = (alert: Alert) => {
    if (alert.actionUrl) {
      markAsRead(alert.id)
      router.push(alert.actionUrl)
    }
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all alerts? This cannot be undone.")) {
      clearAlerts()
      toast({
        title: "Alerts cleared",
        description: "All alerts have been deleted",
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Alerts & Notifications
          </h1>
          <p className="text-muted-foreground">Stay informed about important updates and events</p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>All Types</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("bill")}>Bills</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("budget")}>Budget</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("account")}>Accounts</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("goal")}>Goals</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={() => setShowDismissed(!showDismissed)}>
            {showDismissed ? "Hide Dismissed" : "Show Dismissed"}
          </Button>

          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark All Read
          </Button>

          <Button variant="ghost" size="sm" onClick={handleClearAll} disabled={alerts.length === 0}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">
                Active
                {activeAlerts.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeAlerts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="dismissed">
                Dismissed
                {dismissedAlerts.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {dismissedAlerts.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Active Alerts</CardTitle>
                  <CardDescription>Alerts that require your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    {activeAlerts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No active alerts</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeAlerts
                          .filter((alert) => filter === "all" || alert.type === filter)
                          .map((alert) => (
                            <div
                              key={alert.id}
                              className={`p-4 rounded-lg shadow-sm ${!alert.read ? "bg-secondary/30" : ""}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-full ${getPriorityColor(alert.priority)}`}>
                                    {getAlertIcon(alert.type)}
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{alert.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(alert.date), "MMM d, yyyy • h:mm a")}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                                      </Badge>
                                      {!alert.read && <Badge className="bg-blue-500 text-white text-xs">New</Badge>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {!alert.read && (
                                    <Button variant="ghost" size="icon" onClick={() => markAsRead(alert.id)}>
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" onClick={() => dismissAlert(alert.id)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {alert.actionUrl && (
                                <div className="mt-3 pt-3 border-t">
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-sm flex items-center gap-1"
                                    onClick={() => handleAction(alert)}
                                  >
                                    {alert.actionText || "View Details"}
                                    <ChevronRight className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dismissed">
              <Card>
                <CardHeader>
                  <CardTitle>Dismissed Alerts</CardTitle>
                  <CardDescription>Alerts you've previously dismissed</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    {dismissedAlerts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Check className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No dismissed alerts</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dismissedAlerts
                          .filter((alert) => filter === "all" || alert.type === filter)
                          .map((alert) => (
                            <div
                              key={alert.id}
                              className="p-4 rounded-lg shadow-sm opacity-60 hover:opacity-100 transition-opacity"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-full ${getPriorityColor(alert.priority)}`}>
                                    {getAlertIcon(alert.type)}
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{alert.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(alert.date), "MMM d, yyyy • h:mm a")}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteAlert(alert.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
                {dismissedAlerts.length > 0 && (
                  <CardFooter>
                    <Button variant="outline" size="sm" className="ml-auto" onClick={dismissAllAlerts}>
                      Clear Dismissed
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <AlertGenerator />
        </div>
      </div>
    </div>
  )
}

