"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
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

  // Only apply auth protection to /app routes
  const isAppRoute = pathname.startsWith("/app")

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isDemoMode && isAppRoute) {
      router.push("/")
    }
  }, [isAuthenticated, isDemoMode, isLoading, router, isAppRoute])

  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

