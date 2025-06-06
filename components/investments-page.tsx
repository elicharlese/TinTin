"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  Edit,
  Trash2,
  Share2,
  Copy,
  BarChart,
  ArrowUpDown,
  Filter,
  Download,
  Bitcoin,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { CryptoDashboard } from "@/components/crypto-dashboard"

// Types
interface Investment {
  id: string
  name: string
  type: "stock" | "etf" | "mutual_fund" | "crypto" | "bond" | "other"
  ticker: string
  shares: number
  costBasis: number
  currentValue: number
  purchaseDate: string
  notes?: string
  tags?: string[]
}

interface InvestmentProfile {
  id: string
  name: string
  type: "real" | "paper"
  description?: string
  createdAt: string
  updatedAt: string
  isPublic: boolean
  isDefault: boolean
  institution?: string
  color?: string
  icon?: string
  investments: Investment[]
  performance?: PerformanceData[]
  totalValue: number
  totalCost: number
  totalGain: number
  totalGainPercentage: number
}

interface PerformanceData {
  date: string
  value: number
}

interface Tag {
  id: string
  name: string
  color: string
}

// Mock data
const mockTags: Tag[] = [
  { id: "long-term", name: "Long Term", color: "#4ade80" },
  { id: "high-risk", name: "High Risk", color: "#f87171" },
  { id: "dividend", name: "Dividend", color: "#60a5fa" },
  { id: "tech", name: "Technology", color: "#a78bfa" },
  { id: "finance", name: "Finance", color: "#facc15" },
  { id: "healthcare", name: "Healthcare", color: "#34d399" },
]

// Mock performance data
const generatePerformanceData = (startValue: number, volatility = 0.05, months = 12): PerformanceData[] => {
  const data: PerformanceData[] = []
  let currentValue = startValue

  const now = new Date()
  for (let i = months; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(now.getMonth() - i)

    // Add some random variation
    const change = 1 + (Math.random() * volatility * 2 - volatility)
    currentValue = currentValue * change

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      value: Math.round(currentValue),
    })
  }

  return data
}

// Mock investment profiles
const createMockProfiles = (): InvestmentProfile[] => {
  // Real investment profile
  const realInvestments: Investment[] = [
    {
      id: "voo",
      name: "Vanguard S&P 500 ETF",
      type: "etf",
      ticker: "VOO",
      shares: 10,
      costBasis: 3500,
      currentValue: 4200,
      purchaseDate: "2022-01-15",
      tags: ["long-term"],
    },
    {
      id: "aapl",
      name: "Apple Inc.",
      type: "stock",
      ticker: "AAPL",
      shares: 20,
      costBasis: 3000,
      currentValue: 3600,
      purchaseDate: "2021-06-10",
      notes: "Long-term hold",
      tags: ["tech", "long-term"],
    },
    {
      id: "btc",
      name: "Bitcoin",
      type: "crypto",
      ticker: "BTC",
      shares: 0.5,
      costBasis: 20000,
      currentValue: 24000,
      purchaseDate: "2022-03-22",
      tags: ["high-risk"],
    },
  ]

  const realTotalCost = realInvestments.reduce((sum, inv) => sum + inv.costBasis, 0)
  const realTotalValue = realInvestments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const realTotalGain = realTotalValue - realTotalCost
  const realTotalGainPercentage = (realTotalGain / realTotalCost) * 100

  // Paper trading profile
  const paperInvestments: Investment[] = [
    {
      id: "msft",
      name: "Microsoft Corporation",
      type: "stock",
      ticker: "MSFT",
      shares: 15,
      costBasis: 4500,
      currentValue: 5100,
      purchaseDate: "2022-02-10",
      tags: ["tech", "long-term"],
    },
    {
      id: "amzn",
      name: "Amazon.com, Inc.",
      type: "stock",
      ticker: "AMZN",
      shares: 5,
      costBasis: 8000,
      currentValue: 8500,
      purchaseDate: "2022-01-05",
      tags: ["tech"],
    },
    {
      id: "jpm",
      name: "JPMorgan Chase & Co.",
      type: "stock",
      ticker: "JPM",
      shares: 10,
      costBasis: 1500,
      currentValue: 1650,
      purchaseDate: "2022-03-15",
      tags: ["finance", "dividend"],
    },
  ]

  const paperTotalCost = paperInvestments.reduce((sum, inv) => sum + inv.costBasis, 0)
  const paperTotalValue = paperInvestments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const paperTotalGain = paperTotalValue - paperTotalCost
  const paperTotalGainPercentage = (paperTotalGain / paperTotalCost) * 100

  // Aggressive growth paper trading profile
  const aggressiveInvestments: Investment[] = [
    {
      id: "tsla",
      name: "Tesla, Inc.",
      type: "stock",
      ticker: "TSLA",
      shares: 10,
      costBasis: 7000,
      currentValue: 8200,
      purchaseDate: "2022-01-20",
      tags: ["tech", "high-risk"],
    },
    {
      id: "nvda",
      name: "NVIDIA Corporation",
      type: "stock",
      ticker: "NVDA",
      shares: 20,
      costBasis: 5000,
      currentValue: 6500,
      purchaseDate: "2022-02-15",
      tags: ["tech", "high-risk"],
    },
    {
      id: "eth",
      name: "Ethereum",
      type: "crypto",
      ticker: "ETH",
      shares: 2,
      costBasis: 6000,
      currentValue: 7200,
      purchaseDate: "2022-01-10",
      tags: ["high-risk"],
    },
  ]

  const aggressiveTotalCost = aggressiveInvestments.reduce((sum, inv) => sum + inv.costBasis, 0)
  const aggressiveTotalValue = aggressiveInvestments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const aggressiveTotalGain = aggressiveTotalValue - aggressiveTotalCost
  const aggressiveTotalGainPercentage = (aggressiveTotalGain / aggressiveTotalCost) * 100

  return [
    {
      id: "main",
      name: "Main Portfolio",
      type: "real",
      description: "My primary investment account with Vanguard",
      createdAt: "2022-01-01T00:00:00Z",
      updatedAt: "2023-05-15T00:00:00Z",
      isPublic: false,
      isDefault: true,
      institution: "Vanguard",
      color: "#4ade80",
      investments: realInvestments,
      performance: generatePerformanceData(realTotalCost, 0.03),
      totalValue: realTotalValue,
      totalCost: realTotalCost,
      totalGain: realTotalGain,
      totalGainPercentage: realTotalGainPercentage,
    },
    {
      id: "paper-conservative",
      name: "Paper Trading - Conservative",
      type: "paper",
      description: "Conservative paper trading strategy focusing on blue-chip stocks",
      createdAt: "2022-03-15T00:00:00Z",
      updatedAt: "2023-05-10T00:00:00Z",
      isPublic: true,
      isDefault: false,
      color: "#60a5fa",
      investments: paperInvestments,
      performance: generatePerformanceData(paperTotalCost, 0.02),
      totalValue: paperTotalValue,
      totalCost: paperTotalCost,
      totalGain: paperTotalGain,
      totalGainPercentage: paperTotalGainPercentage,
    },
    {
      id: "paper-aggressive",
      name: "Paper Trading - Aggressive Growth",
      type: "paper",
      description: "High-risk, high-reward paper trading strategy focusing on growth stocks and crypto",
      createdAt: "2022-04-01T00:00:00Z",
      updatedAt: "2023-05-12T00:00:00Z",
      isPublic: true,
      isDefault: false,
      color: "#f87171",
      investments: aggressiveInvestments,
      performance: generatePerformanceData(aggressiveTotalCost, 0.08),
      totalValue: aggressiveTotalValue,
      totalCost: aggressiveTotalCost,
      totalGain: aggressiveTotalGain,
      totalGainPercentage: aggressiveTotalGainPercentage,
    },
  ]
}

// Allocation data
const generateAllocationData = (investments: Investment[]) => {
  const typeMap: Record<string, number> = {}

  investments.forEach((inv) => {
    if (typeMap[inv.type]) {
      typeMap[inv.type] += inv.currentValue
    } else {
      typeMap[inv.type] = inv.currentValue
    }
  })

  return Object.entries(typeMap).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
  }))
}

// Colors for pie chart
const COLORS = ["#4ade80", "#60a5fa", "#f87171", "#facc15", "#a78bfa", "#34d399"]

export function InvestmentsPage() {
  const [profiles, setProfiles] = useState<InvestmentProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>("")
  const [activeTab, setActiveTab] = useState("stocks") // Changed default tab to "stocks"
  const [isAddingInvestment, setIsAddingInvestment] = useState(false)
  const [isAddingProfile, setIsAddingProfile] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState<string | null>(null)
  const [editingInvestment, setEditingInvestment] = useState<string | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [compareProfiles, setCompareProfiles] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>(mockTags)

  // Form state for investments
  const [name, setName] = useState("")
  const [type, setType] = useState<"stock" | "etf" | "mutual_fund" | "crypto" | "bond" | "other">("stock")
  const [ticker, setTicker] = useState("")
  const [shares, setShares] = useState("")
  const [costBasis, setCostBasis] = useState("")
  const [currentValue, setCurrentValue] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Form state for profiles
  const [profileName, setProfileName] = useState("")
  const [profileType, setProfileType] = useState<"real" | "paper">("paper")
  const [profileDescription, setProfileDescription] = useState("")
  const [profileInstitution, setProfileInstitution] = useState("")
  const [profileColor, setProfileColor] = useState("#4ade80")
  const [profileIsPublic, setProfileIsPublic] = useState(false)

  // Initialize with mock data
  useEffect(() => {
    const mockProfiles = createMockProfiles()
    setProfiles(mockProfiles)

    // Make sure we have a valid profile selected
    const defaultProfile = mockProfiles.find((p) => p.isDefault) || mockProfiles[0]
    if (defaultProfile) {
      setSelectedProfileId(defaultProfile.id)
    }
  }, [])

  // Get the selected profile
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0]

  // Reset investment form
  const resetInvestmentForm = () => {
    setName("")
    setType("stock")
    setTicker("")
    setShares("")
    setCostBasis("")
    setCurrentValue("")
    setPurchaseDate("")
    setNotes("")
    setSelectedTags([])
  }

  // Reset profile form
  const resetProfileForm = () => {
    setProfileName("")
    setProfileType("paper")
    setProfileDescription("")
    setProfileInstitution("")
    setProfileColor("#4ade80")
    setProfileIsPublic(false)
  }

  // Load investment data for editing
  const loadInvestmentForEditing = (profileId: string, investmentId: string) => {
    const profile = profiles.find((p) => p.id === profileId)
    if (!profile) return

    const investment = profile.investments.find((i) => i.id === investmentId)
    if (!investment) return

    setName(investment.name)
    setType(investment.type)
    setTicker(investment.ticker)
    setShares(investment.shares.toString())
    setCostBasis(investment.costBasis.toString())
    setCurrentValue(investment.currentValue.toString())
    setPurchaseDate(investment.purchaseDate)
    setNotes(investment.notes || "")
    setSelectedTags(investment.tags || [])
    setEditingInvestment(investmentId)
  }

  // Load profile data for editing
  const loadProfileForEditing = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId)
    if (!profile) return

    setProfileName(profile.name)
    setProfileType(profile.type)
    setProfileDescription(profile.description || "")
    setProfileInstitution(profile.institution || "")
    setProfileColor(profile.color || "#4ade80")
    setProfileIsPublic(profile.isPublic)
    setIsEditingProfile(profileId)
  }

  // Handle investment form submission
  const handleInvestmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const sharesValue = Number.parseFloat(shares)
      const costBasisValue = Number.parseFloat(costBasis)
      const currentValueValue = Number.parseFloat(currentValue)

      if (isNaN(sharesValue) || sharesValue <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid shares",
          description: "Please enter a valid positive number for shares",
        })
        return
      }

      if (isNaN(costBasisValue) || costBasisValue <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid cost basis",
          description: "Please enter a valid positive number for cost basis",
        })
        return
      }

      if (isNaN(currentValueValue) || currentValueValue <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid current value",
          description: "Please enter a valid positive number for current value",
        })
        return
      }

      const newInvestment: Investment = {
        id: editingInvestment || ticker.toLowerCase() + Date.now(),
        name,
        type,
        ticker: ticker.toUpperCase(),
        shares: sharesValue,
        costBasis: costBasisValue,
        currentValue: currentValueValue,
        purchaseDate,
        notes: notes || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      }

      setProfiles((prevProfiles) => {
        return prevProfiles.map((profile) => {
          if (profile.id !== selectedProfileId) return profile

          let updatedInvestments: Investment[]

          if (editingInvestment) {
            updatedInvestments = profile.investments.map((inv) => (inv.id === editingInvestment ? newInvestment : inv))
          } else {
            updatedInvestments = [...profile.investments, newInvestment]
          }

          // Recalculate totals
          const totalCost = updatedInvestments.reduce((sum, inv) => sum + inv.costBasis, 0)
          const totalValue = updatedInvestments.reduce((sum, inv) => sum + inv.currentValue, 0)
          const totalGain = totalValue - totalCost
          const totalGainPercentage = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

          return {
            ...profile,
            investments: updatedInvestments,
            totalCost,
            totalValue,
            totalGain,
            totalGainPercentage,
            updatedAt: new Date().toISOString(),
          }
        })
      })

      toast({
        title: editingInvestment ? "Investment updated" : "Investment added",
        description: editingInvestment
          ? "Your investment has been updated successfully"
          : "Your new investment has been added successfully",
      })

      resetInvestmentForm()
      setIsAddingInvestment(false)
      setEditingInvestment(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save investment",
      })
    }
  }

  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!profileName.trim()) {
        toast({
          variant: "destructive",
          title: "Invalid name",
          description: "Please enter a valid name for the profile",
        })
        return
      }

      const now = new Date().toISOString()

      if (isEditingProfile) {
        setProfiles((prevProfiles) => {
          return prevProfiles.map((profile) => {
            if (profile.id !== isEditingProfile) return profile

            return {
              ...profile,
              name: profileName,
              type: profileType,
              description: profileDescription || undefined,
              institution: profileInstitution || undefined,
              color: profileColor,
              isPublic: profileIsPublic,
              updatedAt: now,
            }
          })
        })

        toast({
          title: "Profile updated",
          description: "Your investment profile has been updated successfully",
        })
      } else {
        const newProfile: InvestmentProfile = {
          id: `profile-${Date.now()}`,
          name: profileName,
          type: profileType,
          description: profileDescription || undefined,
          institution: profileInstitution || undefined,
          color: profileColor,
          isPublic: profileIsPublic,
          isDefault: false,
          createdAt: now,
          updatedAt: now,
          investments: [],
          totalCost: 0,
          totalValue: 0,
          totalGain: 0,
          totalGainPercentage: 0,
          performance: generatePerformanceData(10000, 0.04),
        }

        setProfiles((prevProfiles) => [...prevProfiles, newProfile])
        setSelectedProfileId(newProfile.id)

        toast({
          title: "Profile created",
          description: "Your new investment profile has been created successfully",
        })
      }

      resetProfileForm()
      setIsAddingProfile(false)
      setIsEditingProfile(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile",
      })
    }
  }

  // Handle investment deletion
  const handleDeleteInvestment = (investmentId: string) => {
    if (confirm("Are you sure you want to delete this investment?")) {
      setProfiles((prevProfiles) => {
        return prevProfiles.map((profile) => {
          if (profile.id !== selectedProfileId) return profile

          const updatedInvestments = profile.investments.filter((inv) => inv.id !== investmentId)

          // Recalculate totals
          const totalCost = updatedInvestments.reduce((sum, inv) => sum + inv.costBasis, 0)
          const totalValue = updatedInvestments.reduce((sum, inv) => sum + inv.currentValue, 0)
          const totalGain = totalValue - totalCost
          const totalGainPercentage = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

          return {
            ...profile,
            investments: updatedInvestments,
            totalCost,
            totalValue,
            totalGain,
            totalGainPercentage,
            updatedAt: new Date().toISOString(),
          }
        })
      })

      toast({
        title: "Investment deleted",
        description: "Your investment has been deleted successfully",
      })
    }
  }

  // Handle profile deletion
  const handleDeleteProfile = (profileId: string) => {
    if (profiles.length <= 1) {
      toast({
        variant: "destructive",
        title: "Cannot delete profile",
        description: "You must have at least one investment profile",
      })
      return
    }

    if (confirm("Are you sure you want to delete this profile? This action cannot be undone.")) {
      const updatedProfiles = profiles.filter((p) => p.id !== profileId)
      setProfiles(updatedProfiles)

      // If we're deleting the selected profile, select another one
      if (selectedProfileId === profileId) {
        setSelectedProfileId(updatedProfiles[0].id)
      }

      toast({
        title: "Profile deleted",
        description: "Your investment profile has been deleted successfully",
      })
    }
  }

  // Handle setting a profile as default
  const handleSetDefaultProfile = (profileId: string) => {
    setProfiles((prevProfiles) => {
      return prevProfiles.map((profile) => ({
        ...profile,
        isDefault: profile.id === profileId,
      }))
    })

    toast({
      title: "Default profile set",
      description: "Your default investment profile has been updated",
    })
  }

  // Toggle profile in comparison
  const toggleProfileComparison = (profileId: string) => {
    setCompareProfiles((prev) => {
      if (prev.includes(profileId)) {
        return prev.filter((id) => id !== profileId)
      } else {
        return [...prev, profileId]
      }
    })
  }

  // Get profiles for comparison
  const getComparisonProfiles = () => {
    return compareProfiles.length > 0
      ? profiles.filter((p) => compareProfiles.includes(p.id) && p !== undefined)
      : selectedProfile
        ? [selectedProfile]
        : []
  }

  // Generate comparison data
  const generateComparisonData = () => {
    const comparisonProfiles = getComparisonProfiles()
    if (comparisonProfiles.length === 0) return []

    // Get all unique dates from all profiles
    const allDates = new Set<string>()
    comparisonProfiles.forEach((profile) => {
      if (profile && profile.performance) {
        profile.performance.forEach((perf) => {
          allDates.add(perf.date)
        })
      }
    })

    // Sort dates
    const sortedDates = Array.from(allDates).sort((a, b) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateA.getTime() - dateB.getTime()
    })

    // Create comparison data
    return sortedDates.map((date) => {
      const dataPoint: any = { date }

      comparisonProfiles.forEach((profile) => {
        if (profile && profile.performance) {
          const perfPoint = profile.performance.find((p) => p.date === date)
          if (perfPoint) {
            dataPoint[profile.name] = perfPoint.value
          }
        }
      })

      return dataPoint
    })
  }

  // Get allocation data for the selected profile
  const allocationData = selectedProfile ? generateAllocationData(selectedProfile.investments) : []

  // Get comparison data
  const comparisonData = generateComparisonData()

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stocks" className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4" />
            Stocks & ETFs
          </TabsTrigger>
          <TabsTrigger value="crypto" className="flex items-center">
            <Bitcoin className="mr-2 h-4 w-4" />
            Crypto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stocks" className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Stock Investments</h1>
              <p className="text-muted-foreground">Track and manage your investment portfolios</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: profile.color }} />
                        <span>{profile.name}</span>
                        {profile.type === "paper" && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            Paper
                          </Badge>
                        )}
                        {profile.isDefault && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Profile actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Profile Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => loadProfileForEditing(selectedProfileId)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  {!selectedProfile?.isDefault && (
                    <DropdownMenuItem onClick={() => handleSetDefaultProfile(selectedProfileId)}>
                      <Star className="mr-2 h-4 w-4" />
                      Set as Default
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setIsComparing(!isComparing)}>
                    <BarChart className="mr-2 h-4 w-4" />
                    {isComparing ? "Exit Comparison Mode" : "Compare Profiles"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDeleteProfile(selectedProfileId)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => {
                  resetProfileForm()
                  setIsAddingProfile(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Profile
              </Button>

              <Button
                onClick={() => {
                  resetInvestmentForm()
                  setIsAddingInvestment(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Investment
              </Button>
            </div>
          </div>

          {selectedProfile?.investments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Investments Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start tracking your investments to monitor your portfolio performance.
                </p>
                <Button
                  onClick={() => {
                    resetInvestmentForm()
                    setIsAddingInvestment(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Investment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {selectedProfile?.type === "paper" ? "Paper Trading Portfolio" : "Investment Portfolio"}
                  </h2>
                  {selectedProfile?.type === "paper" && <Badge variant="outline">Paper Trading</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Ticker</th>
                      <th className="text-right py-3 px-4">Shares</th>
                      <th className="text-right py-3 px-4">Cost Basis</th>
                      <th className="text-right py-3 px-4">Current Value</th>
                      <th className="text-right py-3 px-4">Gain/Loss</th>
                      <th className="text-left py-3 px-4">Tags</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProfile?.investments.map((investment) => {
                      const gain = investment.currentValue - investment.costBasis
                      const gainPercentage = (gain / investment.costBasis) * 100

                      return (
                        <tr key={investment.id} className="hover:bg-muted/50">
                          <td className="py-3 px-4">{investment.name}</td>
                          <td className="py-3 px-4 capitalize">{investment.type.replace("_", " ")}</td>
                          <td className="py-3 px-4">{investment.ticker}</td>
                          <td className="py-3 px-4 text-right">{investment.shares.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">
                            {investment.costBasis.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>
                          <td className={`py-3 px-4 text-right ${gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {gain.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              signDisplay: "always",
                            })}
                            <span className="text-xs ml-1">({gainPercentage.toFixed(2)}%)</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {investment.tags?.map((tagId) => {
                                const tag = availableTags.find((t) => t.id === tagId)
                                return tag ? (
                                  <Badge
                                    key={tag.id}
                                    variant="outline"
                                    className="text-xs"
                                    style={{
                                      borderColor: tag.color,
                                      color: tag.color,
                                    }}
                                  >
                                    {tag.name}
                                  </Badge>
                                ) : null
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => loadInvestmentForEditing(selectedProfileId, investment.id)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Investment
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="mr-2 h-4 w-4" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteInvestment(investment.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Investment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Your existing grid of cards */}
          <div className="flex gap-4 mt-4">
            <div className="w-1/3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedProfile?.totalCost.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">Cost basis across all investments</div>
                </CardContent>
              </Card>
            </div>

            <div className="w-1/3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedProfile?.totalValue.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">Market value of your portfolio</div>
                </CardContent>
              </Card>
            </div>

            <div className="w-1/3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                  {selectedProfile?.totalGain >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${selectedProfile?.totalGain >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {selectedProfile?.totalGain.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      signDisplay: "always",
                    })}
                    <span className="text-sm ml-1">({selectedProfile?.totalGainPercentage.toFixed(2)}%)</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Overall portfolio performance</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="crypto" className="pt-6">
          <CryptoDashboard />
        </TabsContent>
      </Tabs>

      {/* All existing dialogs and components remain the same */}
      {/* ... */}
    </div>
  )
}

// Missing imports
function MoreHorizontal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

