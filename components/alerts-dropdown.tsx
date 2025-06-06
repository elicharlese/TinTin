"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, Info, CheckCircle, Bell } from "lucide-react"
import { useAlertsStore, type Alert, type AlertType } from "@/hooks/use-alerts-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function AlertsDropdown() {
  const { alerts, dismissAlert, markAsRead } = useAlertsStore()
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  // Calculate unread alerts count
  useEffect(() => {
    const count = alerts.filter((alert) => !alert.read && !alert.dismissed).length
    setUnreadCount(count)
  }, [alerts])

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "bill":
      case "budget":
        return <AlertTriangle className="h-5 w-5" />
      case "system":
        return <Info className="h-5 w-5" />
      case "goal":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getAlertStyles = (priority: Alert["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20"
      case "medium":
        return "border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20"
      case "low":
      default:
        return "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
    }
  }

  const handleAction = (alert: Alert) => {
    markAsRead(alert.id)
    if (alert.actionUrl) {
      router.push(alert.actionUrl)
    }
  }

  const activeAlerts = alerts.filter((alert) => !alert.dismissed).slice(0, 5)
  const hasAlerts = activeAlerts.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3">
          <h3 className="font-medium">Notifications</h3>
          {hasAlerts && (
            <Button variant="ghost" size="sm" className="h-auto text-xs" onClick={() => router.push("/app/alerts")}>
              View all
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {hasAlerts ? (
            <div>
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "relative flex items-start p-3",
                    getAlertStyles(alert.priority),
                    !alert.read && "bg-muted/50",
                  )}
                >
                  <div className="flex-shrink-0 mr-2">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1 mr-2">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-xs mt-1 text-muted-foreground">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      {alert.actionText && (
                        <Button
                          variant="link"
                          className="p-0 h-auto text-xs font-medium"
                          onClick={() => handleAction(alert)}
                        >
                          {alert.actionText}
                        </Button>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      dismissAlert(alert.id)
                    }}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="Dismiss alert"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="rounded-full bg-muted p-3 mb-2">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-1">No new notifications</h4>
              <p className="text-sm text-muted-foreground">
                You're all caught up! We'll notify you when something new arrives.
              </p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

