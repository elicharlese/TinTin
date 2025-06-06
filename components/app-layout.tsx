"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { SidebarProvider } from "@/hooks/use-sidebar-context"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/use-auth"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isDemoMode, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Don't redirect on the welcome page
  const shouldRedirect = pathname !== "/"

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isDemoMode && shouldRedirect) {
      router.push("/")
    }
  }, [isAuthenticated, isDemoMode, isLoading, router, shouldRedirect])

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}

