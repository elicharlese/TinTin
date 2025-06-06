"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Plus,
  CreditCard,
  Wallet,
  Landmark,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBudgetStore, type AccountType } from "@/hooks/use-budget-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

type AccountGroup = {
  type: string
  title: string
  accounts: any[]
  totalBalance: number
  monthChange?: number
  isOpen: boolean
}

export function AccountsPage() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useBudgetStore()
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [editingAccount, setEditingAccount] = useState<string | null>(null)
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>([])
  const [activeTab, setActiveTab] = useState<"totals" | "percent">("totals")

  // Form state
  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("checking")
  const [balance, setBalance] = useState("")
  const [institution, setInstitution] = useState("")
  const [color, setColor] = useState("#3b82f6")

  // Calculate total assets and group accounts
  useEffect(() => {
    const groups: Record<string, AccountGroup> = {
      cash: {
        type: "cash",
        title: "Cash",
        accounts: [],
        totalBalance: 0,
        monthChange: 145.66,
        isOpen: true,
      },
      investments: {
        type: "investments",
        title: "Investments",
        accounts: [],
        totalBalance: 0,
        monthChange: 43.06,
        isOpen: true,
      },
      credit: {
        type: "credit",
        title: "Credit Cards",
        accounts: [],
        totalBalance: 0,
        monthChange: -12.45,
        isOpen: true,
      },
      loans: {
        type: "loans",
        title: "Loans",
        accounts: [],
        totalBalance: 0,
        monthChange: 0,
        isOpen: true,
      },
    }

    accounts.forEach((account) => {
      let groupKey = "cash"

      if (account.type === "investment") {
        groupKey = "investments"
      } else if (account.type === "credit") {
        groupKey = "credit"
      } else if (account.type === "loan") {
        groupKey = "loans"
      } else if (account.type === "checking" || account.type === "savings") {
        groupKey = "cash"
      }

      if (groups[groupKey]) {
        groups[groupKey].accounts.push(account)
        groups[groupKey].totalBalance += account.balance
      }
    })

    // Convert to array and filter out empty groups
    const groupsArray = Object.values(groups).filter((group) => group.accounts.length > 0)
    setAccountGroups(groupsArray)
  }, [accounts])

  // Reset form
  const resetForm = () => {
    setName("")
    setType("checking")
    setBalance("")
    setInstitution("")
    setColor("#3b82f6")
  }

  // Load account data for editing
  const loadAccountForEditing = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    if (!account) return

    setName(account.name)
    setType(account.type)
    setBalance(account.balance.toString())
    setInstitution(account.institution || "")
    setColor(account.color || "#3b82f6")
    setEditingAccount(accountId)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const balanceValue = Number.parseFloat(balance)

      if (isNaN(balanceValue)) {
        toast({
          variant: "destructive",
          title: "Invalid balance",
          description: "Please enter a valid number for the balance",
        })
        return
      }

      if (editingAccount) {
        updateAccount(editingAccount, {
          name,
          type,
          balance: balanceValue,
          institution,
          color,
        })

        setEditingAccount(null)
      } else {
        addAccount({
          name,
          type,
          balance: balanceValue,
          institution,
          color,
        })
      }

      resetForm()
      setIsAddingAccount(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save account",
      })
    }
  }

  // Handle account deletion
  const handleDeleteAccount = (accountId: string) => {
    if (confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      const success = deleteAccount(accountId)

      if (!success) {
        toast({
          variant: "destructive",
          title: "Cannot delete account",
          description: "This account has transactions associated with it",
        })
      }
    }
  }

  // Get icon for account type
  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case "checking":
        return <Wallet className="h-5 w-5" />
      case "savings":
        return <Landmark className="h-5 w-5" />
      case "credit":
        return <CreditCard className="h-5 w-5" />
      case "investment":
        return <TrendingUp className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  // Format account type label
  const formatAccountType = (type: AccountType) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Toggle group open/closed
  const toggleGroup = (groupType: string) => {
    setAccountGroups(
      accountGroups.map((group) => (group.type === groupType ? { ...group, isOpen: !group.isOpen } : group)),
    )
  }

  // Calculate total assets and liabilities
  const totalAssets = accountGroups.reduce((sum, group) => {
    if (group.type !== "credit" && group.type !== "loans") {
      return sum + group.totalBalance
    }
    return sum
  }, 0)

  const totalLiabilities = accountGroups.reduce((sum, group) => {
    if (group.type === "credit" || group.type === "loans") {
      return sum + Math.abs(group.totalBalance)
    }
    return sum
  }, 0)

  const netWorth = totalAssets - totalLiabilities

  // Calculate percentages for the progress bar
  const cashPercentage = ((accountGroups.find((g) => g.type === "cash")?.totalBalance || 0) / totalAssets) * 100
  const investmentsPercentage =
    ((accountGroups.find((g) => g.type === "investments")?.totalBalance || 0) / totalAssets) * 100

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh all
          </Button>
          <Button
            onClick={() => {
              resetForm()
              setIsAddingAccount(true)
            }}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add account
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-3/4 space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="text-sm text-muted-foreground uppercase">Net Worth</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {netWorth.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </span>
                  <span className="text-sm font-medium text-green-600 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    $188.72 (49.8%)
                  </span>
                  <span className="text-sm text-muted-foreground">1 month change</span>
                </div>
              </div>

              {/* Placeholder for chart - in a real app, you'd use a charting library */}
              <div className="h-48 mt-4 bg-blue-50 rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">Net worth chart would go here</span>
              </div>
            </CardContent>
          </Card>

          {accountGroups.map((group) => (
            <Card key={group.type} className="shadow-sm overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                onClick={() => toggleGroup(group.type)}
              >
                <div className="flex items-center gap-2">
                  {group.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-medium">{group.title}</span>
                  {group.monthChange !== undefined && (
                    <span
                      className={`text-xs font-medium flex items-center ${group.monthChange >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {group.monthChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      ${Math.abs(group.monthChange).toFixed(2)} (
                      {Math.abs((group.monthChange / (group.totalBalance - group.monthChange)) * 100).toFixed(1)}%)
                      <span className="text-muted-foreground ml-1">1 month change</span>
                    </span>
                  )}
                </div>
                <div className="font-medium">
                  {group.totalBalance.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </div>
              </div>

              {group.isOpen && (
                <div className="divide-y">
                  {group.accounts.map((account) => (
                    <div key={account.id} className="p-4 pl-10 flex items-center justify-between hover:bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: account.color || "#3b82f6" }}
                        >
                          {account.institution ? account.institution.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-xs text-muted-foreground">{formatAccountType(account.type)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`font-medium ${account.balance >= 0 ? "" : "text-red-600"}`}>
                            {account.balance.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">8 hours ago</div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => loadAccountForEditing(account.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Transactions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteAccount(account.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="w-1/4">
          <Card className="shadow-sm sticky top-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Summary</h3>

              <Tabs
                defaultValue="totals"
                className="w-full"
                onValueChange={(value) => setActiveTab(value as "totals" | "percent")}
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="totals">Totals</TabsTrigger>
                  <TabsTrigger value="percent">Percent</TabsTrigger>
                </TabsList>

                <TabsContent value="totals" className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Assets</h4>
                      <span className="font-medium">
                        {totalAssets.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </span>
                    </div>

                    <Progress value={100} className="h-2 mb-4" />

                    <div className="space-y-2">
                      {accountGroups
                        .filter((g) => g.type !== "credit" && g.type !== "loans")
                        .map((group) => (
                          <div key={group.type} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${group.type === "cash" ? "bg-emerald-500" : "bg-blue-400"}`}
                              ></div>
                              <span>{group.title}</span>
                            </div>
                            <span>
                              {group.totalBalance.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Liabilities</h4>
                      <span className="font-medium">
                        {totalLiabilities.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </span>
                    </div>

                    {totalLiabilities > 0 ? (
                      <>
                        <Progress value={100} className="h-2 mb-4" />

                        <div className="space-y-2">
                          {accountGroups
                            .filter((g) => g.type === "credit" || g.type === "loans")
                            .map((group) => (
                              <div key={group.type} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                  <span>{group.title}</span>
                                </div>
                                <span>
                                  {Math.abs(group.totalBalance).toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                  })}
                                </span>
                              </div>
                            ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">No liabilities</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="percent" className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Assets</h4>
                      <span className="font-medium">100%</span>
                    </div>

                    <div className="h-2 bg-gray-200 rounded-full mb-4 flex overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${cashPercentage}%` }}></div>
                      <div className="bg-blue-400 h-full" style={{ width: `${investmentsPercentage}%` }}></div>
                    </div>

                    <div className="space-y-2">
                      {accountGroups
                        .filter((g) => g.type !== "credit" && g.type !== "loans")
                        .map((group) => (
                          <div key={group.type} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${group.type === "cash" ? "bg-emerald-500" : "bg-blue-400"}`}
                              ></div>
                              <span>{group.title}</span>
                            </div>
                            <span>{((group.totalBalance / totalAssets) * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {totalLiabilities > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Liabilities</h4>
                        <span className="font-medium">100%</span>
                      </div>

                      <Progress value={100} className="h-2 mb-4" />

                      <div className="space-y-2">
                        {accountGroups
                          .filter((g) => g.type === "credit" || g.type === "loans")
                          .map((group) => (
                            <div key={group.type} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span>{group.title}</span>
                              </div>
                              <span>{((Math.abs(group.totalBalance) / totalLiabilities) * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-4 border-t">
                <Button variant="outline" className="w-full text-sm">
                  Download CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Account Dialog */}
      <Dialog
        open={isAddingAccount || editingAccount !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingAccount(false)
            setEditingAccount(null)
            resetForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Edit Account" : "Add Account"}</DialogTitle>
            <DialogDescription>
              {editingAccount ? "Update your account details" : "Add a new account to track your finances"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chase Checking"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Account Type</Label>
                <Select value={type} onValueChange={(value: AccountType) => setType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">Current Balance</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-muted-foreground">$</span>
                  </div>
                  <Input
                    id="balance"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  For credit cards and loans, enter a negative balance if you owe money
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Financial Institution (Optional)</Label>
                <Input
                  id="institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Chase Bank"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Account Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: color }} />
                  <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-24" />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingAccount(false)
                  setEditingAccount(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingAccount ? "Save Changes" : "Add Account"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

