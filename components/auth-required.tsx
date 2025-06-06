"use client"

import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import AuthModal from "./auth-modal"
import { Button } from "./ui/button"
import { useEffect } from "react"

export function AuthRequired({
  children,
  allowDemo = false,
}: {
  children: React.ReactNode
  allowDemo?: boolean
}) {
  const { isAuthenticated, isLoading, isDemoMode, enableDemoMode } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Always call useEffect, but conditionally execute logic inside
  useEffect(() => {
    // Only redirect if not on landing page and not authenticated
    if (pathname !== "/" && !isLoading && !isAuthenticated && !isDemoMode) {
      router.push("/")
    }
  }, [isAuthenticated, isDemoMode, isLoading, router, pathname])

  // If we're on the landing page, just render children
  if (pathname === "/") {
    return <>{children}</>
  }

  // If still loading auth state, show loading spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // If authenticated or in demo mode, show the protected content
  if (isAuthenticated || isDemoMode) {
    return <>{children}</>
  }

  // Otherwise, show the auth wall
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Access Required</h2>
          <p className="mt-2 text-muted-foreground">Please sign in or create an account to access this feature.</p>
        </div>

        <div className="flex flex-col gap-4">
          <AuthModal>
            <Button className="w-full">Sign In</Button>
          </AuthModal>

          {allowDemo && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                enableDemoMode()
                router.refresh()
              }}
            >
              Continue as Demo User
            </Button>
          )}

          <Button variant="link" className="w-full" onClick={() => router.push("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AuthRequired

