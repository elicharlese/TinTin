"use client"

import type React from "react"

import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAlertsStore } from "@/hooks/use-alerts-store"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const router = useRouter()
  const { alerts, unreadCount, markAsRead, markAllAsRead, dismissAlert } = useAlertsStore()

  // Get alerts for the popover
  const unreadAlerts = alerts.filter((alert) => !alert.read && !alert.dismissed)
  const readAlerts = alerts.filter((alert) => alert.read && !alert.dismissed)

  const handleAlertClick = (alertId: string, actionUrl?: string) => {
    markAsRead(alertId)
    if (actionUrl) {
      router.push(actionUrl)
    }
  }

  const handleDismiss = (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation()
    dismissAlert(alertId)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full h-8 w-8">
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <Separator />

        <Tabs defaultValue="unread" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="unread" className="flex-1">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="unread" className="mt-0">
            <ScrollArea className="h-[400px]">
              {unreadAlerts.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {unreadAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors relative"
                      onClick={() => handleAlertClick(alert.id, alert.actionUrl)}
                    >
                      <div className="space-y-1 pr-8">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{alert.title}</p>
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full",
                              alert.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : alert.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800",
                            )}
                          >
                            {alert.priority === "high" ? "High" : alert.priority === "medium" ? "Medium" : "Low"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(alert.date).toLocaleDateString()} • {alert.type}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 absolute top-3 right-3 opacity-50 hover:opacity-100"
                        onClick={(e) => handleDismiss(e, alert.id)}
                      >
                        <span className="sr-only">Dismiss</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-x"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[400px]">
              {alerts.filter((a) => !a.dismissed).length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {[...unreadAlerts, ...readAlerts].map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors relative",
                        alert.read ? "opacity-70" : "",
                      )}
                      onClick={() => handleAlertClick(alert.id, alert.actionUrl)}
                    >
                      <div className="space-y-1 pr-8">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{alert.title}</p>
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full",
                              alert.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : alert.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800",
                            )}
                          >
                            {alert.priority === "high" ? "High" : alert.priority === "medium" ? "Medium" : "Low"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(alert.date).toLocaleDateString()} • {alert.type}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 absolute top-3 right-3 opacity-50 hover:opacity-100"
                        onClick={(e) => handleDismiss(e, alert.id)}
                      >
                        <span className="sr-only">Dismiss</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-x"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

