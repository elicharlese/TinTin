"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
  isCollapsed: boolean
  toggleCollapsed: () => void
  open: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleCollapsed: () => {},
  open: () => {},
  close: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Use localStorage to persist sidebar state between page refreshes
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Initialize from localStorage on component mount
  useEffect(() => {
    const storedState = localStorage.getItem("sidebarCollapsed")
    if (storedState) {
      setIsCollapsed(storedState === "true")
    }
  }, [])

  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  const open = () => {
    setIsCollapsed(false)
    localStorage.setItem("sidebarCollapsed", "false")
  }

  const close = () => {
    setIsCollapsed(true)
    localStorage.setItem("sidebarCollapsed", "true")
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapsed, open, close }}>{children}</SidebarContext.Provider>
  )
}

export const useSidebarContext = () => useContext(SidebarContext)

