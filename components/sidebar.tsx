"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSidebarContext } from "@/hooks/use-sidebar-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import {
  BarChart3,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  PanelLeft,
  PiggyBank,
  Settings,
  User,
  Bell,
  Wallet,
} from "lucide-react"
import { TinCanLogo } from "@/components/tin-can-logo"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { isMobile } = useIsMobile()
  const { isCollapsed, toggleCollapsed } = useSidebarContext()
  const { user, isDemoMode } = useAuth()
  const [open, setOpen] = useState(false)

  // Close the mobile sidebar when navigating
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const sidebarContent = (
    <div className={cn("flex h-full flex-col gap-2 overflow-hidden", className)}>
      <div className="flex h-14 items-center px-4 justify-between relative">
        {/* Logo container with hover effect when collapsed */}
        <div className="flex items-center gap-2 font-semibold relative">
          {/* Logo that hides on hover when collapsed */}
          <div className={cn("transition-opacity", isCollapsed ? "group-hover:opacity-0" : "")}>
            <TinCanLogo className="h-6 w-6 text-primary ml-2" />
          </div>

          {/* Toggle button that shows on hover when collapsed - positioned over logo */}
          {isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className={cn(
                "absolute left-0 ml-2 flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100",
              )}
              aria-label="Toggle sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}

          {!isCollapsed && <span>TinTin</span>}
        </div>

        {/* Toggle button - visible on far right when open */}
        {!isCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 hide-scrollbar group">
        <div className={cn("flex flex-col gap-1 py-2", isCollapsed ? "items-center" : "")}>
          <p className={cn("mb-1 text-xs font-semibold", isCollapsed ? "sr-only" : "")}>OVERVIEW</p>
          <NavItem
            href="/app"
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Dashboard"
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/transactions"
            icon={<CreditCard className="h-4 w-4" />}
            label="Transactions"
            isCollapsed={isCollapsed}
          />
          <NavItem href="/accounts" icon={<Wallet className="h-4 w-4" />} label="Accounts" isCollapsed={isCollapsed} />
          <NavItem href="/budget" icon={<PiggyBank className="h-4 w-4" />} label="Budget" isCollapsed={isCollapsed} />
          <NavItem href="/alerts" icon={<Bell className="h-4 w-4" />} label="Alerts" isCollapsed={isCollapsed} />

          <p className={cn("mb-1 mt-4 text-xs font-semibold", isCollapsed ? "sr-only" : "")}>ANALYSIS</p>
          <NavItem
            href="/investments"
            icon={<LineChart className="h-4 w-4" />}
            label="Investments"
            isCollapsed={isCollapsed}
          />
          <NavItem href="/reports" icon={<BarChart3 className="h-4 w-4" />} label="Reports" isCollapsed={isCollapsed} />

          <p className={cn("mb-1 mt-4 text-xs font-semibold", isCollapsed ? "sr-only" : "")}>SETTINGS</p>
          <NavItem href="/profile" icon={<User className="h-4 w-4" />} label="Profile" isCollapsed={isCollapsed} />
          <NavItem
            href="/settings"
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            isCollapsed={isCollapsed}
          />
          <NavItem href="/help" icon={<HelpCircle className="h-4 w-4" />} label="Help" isCollapsed={isCollapsed} />
        </div>
      </div>
      <div className="mt-auto p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {user ? user.name.charAt(0) : "D"}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <p className="text-sm font-medium leading-none">{user ? user.name : "Demo User"}</p>
              <p className="text-xs text-muted-foreground">{isDemoMode ? "Demo Mode" : user?.plan || "Free Plan"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Mobile sidebar (Sheet)
  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 absolute left-4 top-3 z-50">
              <PanelLeft className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "h-screen bg-background transition-all duration-300 ease-in-out group",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {sidebarContent}
    </aside>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isCollapsed: boolean
}

function NavItem({ href, icon, label, isCollapsed }: NavItemProps) {
  const pathname = usePathname()

  // Fix the active state detection logic
  const isActive =
    pathname === href || (href !== "/app" && pathname.startsWith(href)) || (href === "/app" && pathname === "/app")

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        isCollapsed ? "justify-center" : "",
      )}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  )
}

