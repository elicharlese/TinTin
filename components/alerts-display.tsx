"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, Info, CheckCircle, Bell } from "lucide-react"
import { useAlertsStore, type Alert, type AlertType } from "@/hooks/use-alerts-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function AlertsDisplay() {
  const { alerts, dismissAlert, markAsRead } = useAlertsStore()
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([])
  const router = useRouter()

  // Filter for only non-dismissed alerts
  useEffect(() => {
    const activeAlerts = alerts.filter((alert) => !alert.dismissed).slice(0, 3) // Only show up to 3 alerts at once
    setVisibleAlerts(activeAlerts)
  }, [alerts])

  if (visibleAlerts.length === 0) {
    return null
  }

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
        return "bg-red-50 border-red-200 text-red-800"
      case "medium":
        return "bg-amber-50 border-amber-200 text-amber-800"
      case "low":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  const handleAction = (alert: Alert) => {
    markAsRead(alert.id)
    if (alert.actionUrl) {
      router.push(alert.actionUrl)
    }
  }

  return (
    <div className="fixed top-16 right-4 z-50 w-80 space-y-2">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={cn("relative flex items-start p-3 rounded-lg border shadow-sm", getAlertStyles(alert.priority))}
        >
          <div className="flex-shrink-0 mr-2">{getAlertIcon(alert.type)}</div>
          <div className="flex-1 mr-2">
            <h4 className="font-medium text-sm">{alert.title}</h4>
            <p className="text-xs mt-1">{alert.message}</p>
            {alert.actionText && (
              <Button
                variant="link"
                className="p-0 h-auto text-xs font-medium mt-1"
                onClick={() => handleAction(alert)}
              >
                {alert.actionText}
              </Button>
            )}
          </div>
          <button
            onClick={() => dismissAlert(alert.id)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

