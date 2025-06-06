"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

type Notification = {
  id: string
  title: string
  message: string
  date: Date
  read: boolean
  type: "info" | "warning" | "success" | "error"
}

// Sample notifications
const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "Budget Alert",
    message: "You've exceeded your dining budget by $50 this month.",
    date: new Date(2025, 2, 18),
    read: false,
    type: "warning",
  },
  {
    id: "2",
    title: "Bill Due Soon",
    message: "Your electric bill is due in 3 days.",
    date: new Date(2025, 2, 17),
    read: false,
    type: "info",
  },
  {
    id: "3",
    title: "Goal Achieved",
    message: "Congratulations! You've reached your emergency fund goal.",
    date: new Date(2025, 2, 15),
    read: true,
    type: "success",
  },
  {
    id: "4",
    title: "New Feature",
    message: "We've added investment tracking to help you monitor your portfolio.",
    date: new Date(2025, 2, 10),
    read: true,
    type: "info",
  },
]

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "warning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20"
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border p-3">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto text-xs px-2 py-1" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn("p-3 transition-colors hover:bg-muted/50", !notification.read && "bg-muted/30")}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 h-2 w-2 rounded-full",
                        !notification.read ? "bg-primary" : "bg-transparent",
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">{formatDate(notification.date)}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>
                      <div
                        className={cn(
                          "mt-2 inline-block rounded-full px-2 py-0.5 text-xs border",
                          getTypeStyles(notification.type),
                        )}
                      >
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <p className="text-center text-sm text-muted-foreground">No notifications</p>
            </div>
          )}
        </ScrollArea>
        <div className="border-t border-border p-2">
          <Button variant="outline" size="sm" className="w-full">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

