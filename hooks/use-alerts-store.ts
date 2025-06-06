import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"

export type AlertPriority = "low" | "medium" | "high"
export type AlertType = "bill" | "budget" | "account" | "goal" | "system"

export interface Alert {
  id: string
  title: string
  message: string
  date: string
  read: boolean
  priority: AlertPriority
  type: AlertType
  actionUrl?: string
  actionText?: string
  dismissed: boolean
}

interface AlertsState {
  alerts: Alert[]
  unreadCount: number
  addAlert: (alert: Omit<Alert, "id" | "date" | "read" | "dismissed">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismissAlert: (id: string) => void
  dismissAllAlerts: () => void
  deleteAlert: (id: string) => void
  clearAlerts: () => void
}

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set, get) => ({
      alerts: [],
      unreadCount: 0,

      addAlert: (alert) => {
        const newAlert: Alert = {
          id: uuidv4(),
          date: new Date().toISOString(),
          read: false,
          dismissed: false,
          ...alert,
        }

        set((state) => ({
          alerts: [newAlert, ...state.alerts],
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (id) => {
        set((state) => {
          const updatedAlerts = state.alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert))

          const unreadCount = updatedAlerts.filter((alert) => !alert.read).length

          return {
            alerts: updatedAlerts,
            unreadCount,
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          alerts: state.alerts.map((alert) => ({ ...alert, read: true })),
          unreadCount: 0,
        }))
      },

      dismissAlert: (id) => {
        set((state) => {
          const updatedAlerts = state.alerts.map((alert) => (alert.id === id ? { ...alert, dismissed: true } : alert))

          const unreadCount = updatedAlerts.filter((alert) => !alert.read && !alert.dismissed).length

          return {
            alerts: updatedAlerts,
            unreadCount,
          }
        })
      },

      dismissAllAlerts: () => {
        set((state) => ({
          alerts: state.alerts.map((alert) => ({ ...alert, dismissed: true })),
          unreadCount: 0,
        }))
      },

      deleteAlert: (id) => {
        set((state) => {
          const alertToDelete = state.alerts.find((alert) => alert.id === id)
          const updatedAlerts = state.alerts.filter((alert) => alert.id !== id)

          return {
            alerts: updatedAlerts,
            unreadCount: alertToDelete && !alertToDelete.read ? state.unreadCount - 1 : state.unreadCount,
          }
        })
      },

      clearAlerts: () => {
        set({ alerts: [], unreadCount: 0 })
      },
    }),
    {
      name: "alerts-storage",
    },
  ),
)

// Helper function to generate sample alerts for testing
export function generateSampleAlerts() {
  const store = useAlertsStore.getState()

  // Clear existing alerts
  store.clearAlerts()

  // Add sample alerts
  store.addAlert({
    title: "Upcoming Bill",
    message: "Your electricity bill of $85.42 is due in 3 days",
    priority: "high",
    type: "bill",
    actionUrl: "/recurring",
    actionText: "View Bill",
  })

  store.addAlert({
    title: "Budget Alert",
    message: "You have exceeded your Dining budget by $45.20 this month",
    priority: "medium",
    type: "budget",
    actionUrl: "/budget",
    actionText: "View Budget",
  })

  store.addAlert({
    title: "Low Account Balance",
    message: "Your Checking account balance is below $500",
    priority: "high",
    type: "account",
    actionUrl: "/accounts",
    actionText: "View Account",
  })

  store.addAlert({
    title: "Goal Progress",
    message: "You are 75% of the way to your Vacation savings goal!",
    priority: "low",
    type: "goal",
    actionUrl: "/goals",
    actionText: "View Goal",
  })

  store.addAlert({
    title: "New Feature Available",
    message: "Try our new investment tracking tools",
    priority: "low",
    type: "system",
    actionUrl: "/investments",
    actionText: "Explore",
  })
}

