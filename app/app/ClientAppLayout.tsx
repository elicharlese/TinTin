"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { SidebarProvider } from "@/hooks/use-sidebar-context"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"

export default function ClientAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isDemoMode, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isDemoMode) {
      router.push("/")
    }
  }, [isAuthenticated, isDemoMode, isLoading, router])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

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

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}

