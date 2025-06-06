"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  email: string
  plan: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isDemoMode: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (name: string, email: string, password: string) => Promise<void>
  enableDemoMode: () => void
  disableDemoMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("tintin_user")
    const storedDemoMode = localStorage.getItem("tintin_demo_mode") === "true"

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    if (storedDemoMode) {
      setIsDemoMode(true)
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data
      const userData = {
        id: "1",
        name: "Elias Estrada",
        email,
        plan: "Free Plan",
      }

      setUser(userData)
      localStorage.setItem("tintin_user", JSON.stringify(userData))

      // If we were in demo mode, disable it
      if (isDemoMode) {
        disableDemoMode()
      }

      // Redirect to the app
      router.push("/app")
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data
      const userData = {
        id: "1",
        name,
        email,
        plan: "Free Plan",
      }

      setUser(userData)
      localStorage.setItem("tintin_user", JSON.stringify(userData))

      // If we were in demo mode, disable it
      if (isDemoMode) {
        disableDemoMode()
      }

      // Redirect to the app
      router.push("/app")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("tintin_user")

    // Also disable demo mode if active
    if (isDemoMode) {
      disableDemoMode()
    }

    // Redirect to welcome page
    router.push("/")
  }

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true)
    localStorage.setItem("tintin_demo_mode", "true")

    // Redirect to the app immediately
    router.push("/app")
  }, [router])

  const disableDemoMode = () => {
    setIsDemoMode(false)
    localStorage.removeItem("tintin_demo_mode")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isDemoMode,
        login,
        logout,
        signup,
        enableDemoMode,
        disableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

