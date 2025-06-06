"use client"

import { usePathname, useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { AlertsDropdown } from "@/components/alerts-dropdown"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { useSearchStore } from "@/hooks/use-search-store"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile } = useIsMobile()
  const [isSearching, setIsSearching] = useState(false)
  const { query, results, setQuery, clearSearch } = useSearchStore()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Don't show header on landing page
  if (pathname === "/") return null

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsSearching(true)
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 0)
      }

      // Escape to clear search
      if (e.key === "Escape" && isSearching) {
        setIsSearching(false)
        clearSearch()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isSearching, clearSearch])

  // Handle search result selection
  const handleResultClick = (url: string) => {
    router.push(url)
    setIsSearching(false)
    clearSearch()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">{/* Empty space where logo used to be */}</div>

      <div className="flex-1 mx-4 max-w-md relative">
        {isSearching ? (
          <div className="relative">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search transactions, accounts, categories..."
              className="w-full pl-9 pr-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  clearSearch()
                  searchInputRef.current?.focus()
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}

            {/* Search results dropdown */}
            {query.length > 1 && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleResultClick(result.url)}
                  >
                    <div>
                      <div className="font-medium">{result.title}</div>
                      <div className="text-xs text-muted-foreground">{result.description}</div>
                    </div>
                    {result.amount !== undefined && (
                      <div className={result.amount < 0 ? "text-red-500" : "text-green-500"}>
                        {result.amount < 0 ? "-" : "+"}${Math.abs(result.amount).toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setIsSearching(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <AlertsDropdown />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}

