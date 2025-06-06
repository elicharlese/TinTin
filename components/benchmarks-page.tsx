"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoalsPage } from "@/components/goals-page"
import { AdvicePage } from "@/components/advice-page"
import { useRouter, useSearchParams } from "next/navigation"

export function BenchmarksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "goals"

  const handleTabChange = (value: string) => {
    router.push(`/benchmarks?tab=${value}`, { scroll: false })
  }

  return (
    <div className="space-y-4">
      <div className="border-b pb-3">
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="goals">Financial Goals</TabsTrigger>
            <TabsTrigger value="advice">Financial Advice</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === "goals" ? <GoalsPage /> : <AdvicePage />}
    </div>
  )
}

