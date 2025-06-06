import type React from "react"
import type { Metadata } from "next"
import Sidebar from "@/components/sidebar"
import { SidebarProvider } from "@/hooks/use-sidebar-context"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "TinTin",
  description: "Manage your finances with TinTin",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

