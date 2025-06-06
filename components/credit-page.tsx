"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  Info,
  CreditCard,
  Shield,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react"
import { useCreditStore, type CreditBureau } from "@/hooks/use-credit-store"
import { cn } from "@/lib/utils"

export function CreditPage() {
  // Fix: Use the correct property names from useCreditStore
  const { scores, factors, accounts, settings } = useCreditStore()
  const [selectedBureau, setSelectedBureau] = useState<CreditBureau>("Experian")

  const handleBureauChange = (bureau: string) => {
    setSelectedBureau(bureau as CreditBureau)
  }

  // Get the most recent score for the selected bureau
  const bureauScores = scores[selectedBureau] || []
  const currentScore = bureauScores.length > 0 ? bureauScores[0].score : 700 // Default score if none available

  // Get previous score for comparison
  const previousScore = bureauScores.length > 1 ? bureauScores[1].score : currentScore
  const scoreDifference = currentScore - previousScore
  const scoreChange = scoreDifference !== 0 ? (scoreDifference > 0 ? "increase" : "decrease") : "unchanged"

  // Get score range and calculate percentage
  const scoreRange = { min: 300, max: 850 }
  const { min, max } = scoreRange
  const scorePercentage = ((currentScore - min) / (max - min)) * 100

  // Determine score category
  const getScoreCategory = (score: number) => {
    if (score >= 800) return { label: "Exceptional", color: "text-green-600" }
    if (score >= 740) return { label: "Very Good", color: "text-green-500" }
    if (score >= 670) return { label: "Good", color: "text-yellow-500" }
    if (score >= 580) return { label: "Fair", color: "text-orange-500" }
    return { label: "Poor", color: "text-red-500" }
  }

  const scoreCategory = getScoreCategory(currentScore)

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Building</h1>
          <p className="text-muted-foreground mt-1">Monitor and improve your credit score</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4 space-y-6">
          {/* Credit Score Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Credit Score</CardTitle>
                <CardDescription>Your current credit score and history</CardDescription>
              </div>
              <Tabs defaultValue={selectedBureau} onValueChange={handleBureauChange}>
                <TabsList>
                  <TabsTrigger value="Experian">Experian</TabsTrigger>
                  <TabsTrigger value="Equifax">Equifax</TabsTrigger>
                  <TabsTrigger value="TransUnion">TransUnion</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative flex items-center justify-center w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 stroke-current"
                      strokeWidth="8"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    ></circle>
                    <circle
                      className={cn(
                        "stroke-current",
                        scorePercentage >= 80
                          ? "text-green-500"
                          : scorePercentage >= 60
                            ? "text-green-400"
                            : scorePercentage >= 40
                              ? "text-yellow-500"
                              : scorePercentage >= 20
                                ? "text-orange-500"
                                : "text-red-500",
                      )}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${scorePercentage * 2.51} 251`}
                      strokeDashoffset="0"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      transform="rotate(-90 50 50)"
                    ></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{currentScore}</span>
                    <span className={`text-sm font-medium ${scoreCategory.color}`}>{scoreCategory.label}</span>
                    <div className="flex items-center mt-1">
                      {scoreChange === "increase" ? (
                        <>
                          <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-xs text-green-500">+{scoreDifference}</span>
                        </>
                      ) : scoreChange === "decrease" ? (
                        <>
                          <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-xs text-red-500">{scoreDifference}</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">No change</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full flex justify-between text-sm text-muted-foreground">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Very Good</span>
                  <span>Excellent</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={cn(
                      "h-2.5 rounded-full",
                      scorePercentage >= 80
                        ? "bg-green-500"
                        : scorePercentage >= 60
                          ? "bg-green-400"
                          : scorePercentage >= 40
                            ? "bg-yellow-500"
                            : scorePercentage >= 20
                              ? "bg-orange-500"
                              : "bg-red-500",
                    )}
                    style={{ width: `${scorePercentage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Score Details</Button>
              <Button>Get Credit Report</Button>
            </CardFooter>
          </Card>

          {/* Credit Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Factors</CardTitle>
              <CardDescription>Factors affecting your credit score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {factors.map((factor) => (
                  <div key={factor.id || factor.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {factor.status === "excellent" || factor.status === "good" ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : factor.status === "poor" ? (
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        ) : (
                          <Info className="h-5 w-5 text-blue-500 mr-2" />
                        )}
                        <span className="font-medium">{factor.name}</span>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          factor.status === "excellent"
                            ? "text-green-600"
                            : factor.status === "good"
                              ? "text-green-500"
                              : factor.status === "fair"
                                ? "text-yellow-500"
                                : "text-red-500",
                        )}
                      >
                        {factor.status.charAt(0).toUpperCase() + factor.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{factor.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 space-y-6">
          {/* Credit Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Accounts</CardTitle>
              <CardDescription>Your active credit accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-medium">{account.name}</span>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          account.paymentStatus === "current"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800",
                        )}
                      >
                        {account.paymentStatus === "current" ? "Good Standing" : "Past Due"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-medium">${account.balance.toLocaleString()}</p>
                      </div>
                      {account.limit && (
                        <div>
                          <p className="text-muted-foreground">Credit Limit</p>
                          <p className="font-medium">${account.limit.toLocaleString()}</p>
                        </div>
                      )}
                      {account.utilization && (
                        <div>
                          <p className="text-muted-foreground">Utilization</p>
                          <p className="font-medium">{account.utilization}%</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Last Reported</p>
                        <p className="font-medium">{new Date(account.lastReported).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {account.utilization && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Credit Utilization</p>
                        <Progress
                          value={account.utilization}
                          className="h-2"
                          indicatorClassName={cn(
                            account.utilization > 70
                              ? "bg-red-500"
                              : account.utilization > 30
                                ? "bg-yellow-500"
                                : "bg-green-500",
                          )}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Accounts
              </Button>
            </CardFooter>
          </Card>

          {/* Credit Building Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Building Tips</CardTitle>
              <CardDescription>Ways to improve your credit score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Pay bills on time</h4>
                    <p className="text-sm text-muted-foreground">
                      Payment history accounts for 35% of your credit score. Set up automatic payments to avoid missing
                      due dates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Keep credit utilization low</h4>
                    <p className="text-sm text-muted-foreground">
                      Try to keep your credit card balances below 30% of your credit limits to improve your score.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Maintain a good credit mix</h4>
                    <p className="text-sm text-muted-foreground">
                      Having different types of credit accounts (credit cards, loans, mortgage) can positively impact
                      your score.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Keep old accounts open</h4>
                    <p className="text-sm text-muted-foreground">
                      The length of your credit history matters. Keeping older accounts open can help improve your
                      score.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Learn More About Credit
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

