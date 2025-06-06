"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSearchStore } from "@/hooks/use-search-store"
import { Search, ArrowRight, CreditCard, Receipt, Tag, PiggyBank, Target, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Keep this component for reference, but it's no longer used in the app
// The search functionality has been moved to the header component

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const { query, results, isSearching, setQuery, clearSearch } = useSearchStore()
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case "Enter":
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          onOpenChange(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, results, selectedIndex, onOpenChange])

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        clearSearch()
      }, 200)
    }
  }, [open, clearSearch])

  const handleSelect = (result: (typeof results)[0]) => {
    router.push(result.url)
    onOpenChange(false)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return <Receipt className="h-4 w-4" />
      case "account":
        return <CreditCard className="h-4 w-4" />
      case "category":
        return <Tag className="h-4 w-4" />
      case "budget":
        return <PiggyBank className="h-4 w-4" />
      case "goal":
        return <Target className="h-4 w-4" />
      default:
        return <ArrowRight className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search transactions, accounts, categories..."
            className="flex h-12 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {query.length > 1 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            {isSearching ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-6 text-center">
                <p>No results found</p>
              </div>
            ) : (
              <p>
                {results.length} result{results.length === 1 ? "" : "s"} found
              </p>
            )}
          </div>
        )}

        {results.length > 0 && (
          <ScrollArea className="max-h-[300px]">
            <div className="p-2">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer",
                    selectedIndex === index ? "bg-muted" : "hover:bg-muted/50",
                  )}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {getIcon(result.type)}
                    </div>
                    <div>
                      <div className="font-medium">{result.title}</div>
                      <div className="text-xs text-muted-foreground">{result.description}</div>
                    </div>
                  </div>
                  {result.amount !== undefined && (
                    <div className={cn("font-medium", result.amount < 0 ? "text-red-500" : "text-green-500")}>
                      {result.amount < 0 ? "-" : "+"}${Math.abs(result.amount).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {query.length > 1 && results.length > 0 && (
          <div className="border-t px-3 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>
                <span className="rounded border px-1 py-0.5 font-mono">↑</span>
                <span className="mx-1 rounded border px-1 py-0.5 font-mono">↓</span>
                <span>to navigate</span>
              </div>
              <div>
                <span className="rounded border px-1 py-0.5 font-mono">Enter</span>
                <span className="ml-1">to select</span>
              </div>
              <div>
                <span className="rounded border px-1 py-0.5 font-mono">Esc</span>
                <span className="ml-1">to close</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

