"use client"

import type React from "react"

import { useState } from "react"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { format } from "date-fns"
import { ArrowUpRight, ArrowDownRight, Plus, RefreshCw, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCryptoStore } from "@/hooks/use-crypto-store"
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

// Updated color palette with blue and orange shades
const CHART_COLORS = [
  "#2563eb", // Primary blue
  "#3b82f6", // Blue-500
  "#60a5fa", // Blue-400
  "#93c5fd", // Blue-300
  "#f97316", // Orange-500
  "#fb923c", // Orange-400
  "#fdba74", // Orange-300
  "#4ade80", // Green-400 (for income)
  "#f87171", // Red-400 (for expenses)
]

export function CryptoDashboard() {
  const {
    assets,
    wallets,
    tokenPrices,
    updateAssetPrices,
    addWallet,
    addAsset,
    deleteWallet,
    deleteAsset,
    updateWallet,
    updateAsset,
  } = useCryptoStore()

  const [activeTab, setActiveTab] = useState("overview")
  const [marketViewTab, setMarketViewTab] = useState<"all" | "defi" | "cefi">("all")

  const [isAddingWallet, setIsAddingWallet] = useState(false)
  const [isAddingAsset, setIsAddingAsset] = useState(false)

  // New wallet form state
  const [newWalletName, setNewWalletName] = useState("")
  const [newWalletType, setNewWalletType] = useState<"hot" | "cold" | "exchange" | "defi" | "other">("hot")
  const [newWalletAddress, setNewWalletAddress] = useState("")
  const [newWalletNetwork, setNewWalletNetwork] = useState<
    "ethereum" | "bitcoin" | "polygon" | "solana" | "avalanche" | "binance" | "other"
  >("ethereum")
  const [newWalletExchange, setNewWalletExchange] = useState("")
  const [newWalletColor, setNewWalletColor] = useState("#4f46e5")
  const [newWalletNotes, setNewWalletNotes] = useState("")

  // New asset form state
  const [newAssetName, setNewAssetName] = useState("")
  const [newAssetSymbol, setNewAssetSymbol] = useState("")
  const [newAssetMarketType, setNewAssetMarketType] = useState<"defi" | "cefi">("cefi")
  const [newAssetAmount, setNewAssetAmount] = useState("")
  const [newAssetPrice, setNewAssetPrice] = useState("")
  const [newAssetWalletId, setNewAssetWalletId] = useState("")
  const [newAssetNetwork, setNewAssetNetwork] = useState<
    "ethereum" | "bitcoin" | "polygon" | "solana" | "avalanche" | "binance" | "other"
  >("ethereum")
  const [newAssetProtocol, setNewAssetProtocol] = useState("")
  const [newAssetIsStaked, setNewAssetIsStaked] = useState(false)
  const [newAssetStakingApy, setNewAssetStakingApy] = useState("")

  // Filter assets based on market type tab
  const filteredAssets = assets.filter((asset) => {
    if (marketViewTab === "all") return true
    return asset.marketType === marketViewTab
  })

  // Calculate total values
  const totalValue = assets.reduce((sum, asset) => sum + asset.usdValue, 0)
  const totalDeFiValue = assets.filter((a) => a.marketType === "defi").reduce((sum, asset) => sum + asset.usdValue, 0)
  const totalCeFiValue = assets.filter((a) => a.marketType === "cefi").reduce((sum, asset) => sum + asset.usdValue, 0)

  // Helper function to get market type change percentage
  const getMarketTypeChange = (marketType: "defi" | "cefi" | "all") => {
    const relevantAssets = marketType === "all" ? assets : assets.filter((a) => a.marketType === marketType)

    const totalChange = relevantAssets.reduce((sum, asset) => {
      const change = asset.marketData?.change24h || 0
      return sum + change * asset.usdValue
    }, 0)

    const totalValue = relevantAssets.reduce((sum, asset) => sum + asset.usdValue, 0)

    return totalValue > 0 ? totalChange / totalValue : 0
  }

  // Overall market change
  const marketChange = getMarketTypeChange("all")
  const defiMarketChange = getMarketTypeChange("defi")
  const cefiMarketChange = getMarketTypeChange("cefi")

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Calculate portfolio allocation data
  const pieChartData = assets.map((asset) => ({
    name: asset.symbol,
    value: asset.usdValue,
  }))

  // Distribution between DeFi and CeFi
  const marketTypeDistribution = [
    { name: "DeFi", value: totalDeFiValue },
    { name: "CeFi", value: totalCeFiValue },
  ]

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background p-2 border border-border/30 rounded-md shadow-sm">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-xs text-muted-foreground">{formatCurrency(data.value)}</p>
        </div>
      )
    }
    return null
  }

  // Handle wallet form submission
  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault()

    const wallet = {
      name: newWalletName,
      type: newWalletType,
      address: newWalletAddress || undefined,
      network: newWalletType !== "exchange" ? newWalletNetwork : undefined,
      exchange: newWalletType === "exchange" ? newWalletExchange : undefined,
      color: newWalletColor,
      notes: newWalletNotes || undefined,
    }

    addWallet(wallet)
    setIsAddingWallet(false)
    resetWalletForm()
  }

  // Handle asset form submission
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAssetWalletId) {
      alert("Please select a wallet")
      return
    }

    const amount = Number.parseFloat(newAssetAmount)
    const price = Number.parseFloat(newAssetPrice)

    if (isNaN(amount) || isNaN(price) || amount <= 0 || price <= 0) {
      alert("Please enter valid amount and price")
      return
    }

    const asset = {
      name: newAssetName,
      symbol: newAssetSymbol.toUpperCase(),
      marketType: newAssetMarketType,
      amount,
      priceUsd: price,
      network: newAssetNetwork,
      walletId: newAssetWalletId,
      protocol: newAssetProtocol || undefined,
      isStaked: newAssetIsStaked,
      stakingApy: newAssetIsStaked ? Number.parseFloat(newAssetStakingApy) || undefined : undefined,
    }

    addAsset(asset)
    setIsAddingAsset(false)
    resetAssetForm()
  }

  // Reset form states
  const resetWalletForm = () => {
    setNewWalletName("")
    setNewWalletType("hot")
    setNewWalletAddress("")
    setNewWalletNetwork("ethereum")
    setNewWalletExchange("")
    setNewWalletColor("#4f46e5")
    setNewWalletNotes("")
  }

  const resetAssetForm = () => {
    setNewAssetName("")
    setNewAssetSymbol("")
    setNewAssetMarketType("cefi")
    setNewAssetAmount("")
    setNewAssetPrice("")
    setNewAssetWalletId("")
    setNewAssetNetwork("ethereum")
    setNewAssetProtocol("")
    setNewAssetIsStaked(false)
    setNewAssetStakingApy("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Crypto Portfolio</h2>
          <p className="text-muted-foreground">Monitor and manage your cryptocurrency holdings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => updateAssetPrices()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Prices
          </Button>
          <Button onClick={() => setIsAddingWallet(true)}>
            <Wallet className="mr-2 h-4 w-4" />
            Add Wallet
          </Button>
          <Button onClick={() => setIsAddingAsset(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <div className="flex items-center mt-1">
              {marketChange >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  {marketChange.toFixed(2)}%
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                  {Math.abs(marketChange).toFixed(2)}%
                </span>
              )}
              <span className="text-muted-foreground ml-2 text-sm">24h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DeFi Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDeFiValue)}</div>
            <div className="flex items-center mt-1">
              {defiMarketChange >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  {defiMarketChange.toFixed(2)}%
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                  {Math.abs(defiMarketChange).toFixed(2)}%
                </span>
              )}
              <span className="text-muted-foreground ml-2 text-sm">24h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CeFi Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCeFiValue)}</div>
            <div className="flex items-center mt-1">
              {cefiMarketChange >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  {cefiMarketChange.toFixed(2)}%
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                  {Math.abs(cefiMarketChange).toFixed(2)}%
                </span>
              )}
              <span className="text-muted-foreground ml-2 text-sm">24h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
                <CardDescription>Distribution of assets by value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        strokeWidth={1}
                        stroke="var(--background)"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DeFi vs CeFi</CardTitle>
                <CardDescription>Distribution between DeFi and CeFi assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={marketTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        strokeWidth={1}
                        stroke="var(--background)"
                      >
                        <Cell fill="#2563eb" /> {/* Blue for DeFi */}
                        <Cell fill="#f97316" /> {/* Orange for CeFi */}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Assets</CardTitle>
              <CardDescription>Your highest value crypto holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {assets
                  .sort((a, b) => b.usdValue - a.usdValue)
                  .slice(0, 5)
                  .map((asset) => (
                    <div key={asset.id} className="flex items-center">
                      <div className="flex flex-col flex-grow">
                        <div className="flex justify-between mb-1">
                          <div className="font-medium">
                            {asset.name} ({asset.symbol})
                          </div>
                          <div>{formatCurrency(asset.usdValue)}</div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <div>
                            {asset.amount.toFixed(4)} {asset.symbol}
                          </div>
                          <div className="flex items-center">
                            {(asset.marketData?.change24h || 0) >= 0 ? (
                              <span className="text-green-500 flex items-center">
                                <ArrowUpRight className="mr-1 h-3 w-3" />
                                {(asset.marketData?.change24h || 0).toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-red-500 flex items-center">
                                <ArrowDownRight className="mr-1 h-3 w-3" />
                                {Math.abs(asset.marketData?.change24h || 0).toFixed(2)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <Card key={wallet.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: wallet.color }} />
                        {wallet.name}
                      </CardTitle>
                      <CardDescription>
                        {wallet.type === "hot" && "Hot Wallet"}
                        {wallet.type === "cold" && "Cold Wallet"}
                        {wallet.type === "exchange" && `Exchange: ${wallet.exchange}`}
                        {wallet.type === "defi" && "DeFi Protocol"}
                        {wallet.type === "other" && "Other Wallet"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-xl font-bold mb-1">{formatCurrency(wallet.balance)}</div>
                  {wallet.address && (
                    <div className="text-sm text-muted-foreground truncate">
                      Address: {wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 4)}
                    </div>
                  )}
                  {wallet.network && (
                    <div className="text-sm text-muted-foreground capitalize mt-1">Network: {wallet.network}</div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="text-xs text-muted-foreground">
                    Last updated: {format(new Date(wallet.lastUpdated), "MMM d, yyyy")}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <div className="border rounded-md">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Crypto Assets</h3>
                <div className="flex space-x-2">
                  <TabsList className="grid grid-cols-3 h-8">
                    <TabsTrigger
                      className="text-xs px-2"
                      value="all"
                      onClick={() => setMarketViewTab("all")}
                      data-state={marketViewTab === "all" ? "active" : "inactive"}
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      className="text-xs px-2"
                      value="defi"
                      onClick={() => setMarketViewTab("defi")}
                      data-state={marketViewTab === "defi" ? "active" : "inactive"}
                    >
                      DeFi
                    </TabsTrigger>
                    <TabsTrigger
                      className="text-xs px-2"
                      value="cefi"
                      onClick={() => setMarketViewTab("cefi")}
                      data-state={marketViewTab === "cefi" ? "active" : "inactive"}
                    >
                      CeFi
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Asset</th>
                    <th className="px-4 py-3 text-left font-medium">Price</th>
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                    <th className="px-4 py-3 text-left font-medium">Value</th>
                    <th className="px-4 py-3 text-left font-medium">24h Change</th>
                    <th className="px-4 py-3 text-left font-medium">Wallet</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => {
                    const wallet = wallets.find((w) => w.id === asset.walletId)
                    return (
                      <tr key={asset.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                        </td>
                        <td className="px-4 py-3">
                          $
                          {asset.priceUsd.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {asset.amount.toLocaleString(undefined, {
                            minimumFractionDigits: asset.amount < 1 ? 4 : 2,
                            maximumFractionDigits: 8,
                          })}
                        </td>
                        <td className="px-4 py-3">{formatCurrency(asset.usdValue)}</td>
                        <td className="px-4 py-3">
                          {(asset.marketData?.change24h || 0) >= 0 ? (
                            <span className="text-green-500 flex items-center">
                              <ArrowUpRight className="mr-1 h-3 w-3" />
                              {(asset.marketData?.change24h || 0).toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center">
                              <ArrowDownRight className="mr-1 h-3 w-3" />
                              {Math.abs(asset.marketData?.change24h || 0).toFixed(2)}%
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{wallet?.name || "Unknown"}</td>
                        <td className="px-4 py-3">
                          <Badge variant={asset.marketType === "defi" ? "default" : "destructive"}>
                            {asset.marketType === "defi" ? "DeFi" : "CeFi"}
                          </Badge>
                          {asset.isStaked && (
                            <Badge variant="outline" className="ml-1">
                              Staked {asset.stakingApy ? `(${asset.stakingApy}%)` : ""}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Wallet Dialog */}
      <Dialog open={isAddingWallet} onOpenChange={setIsAddingWallet}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Crypto Wallet</DialogTitle>
            <DialogDescription>Add a new wallet or exchange account to track your crypto assets.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWallet}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wallet-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="wallet-name"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  className="col-span-3"
                  placeholder="My Ethereum Wallet"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wallet-type" className="text-right">
                  Type
                </Label>
                <Select
                  value={newWalletType}
                  onValueChange={(value: "hot" | "cold" | "exchange" | "defi" | "other") => setNewWalletType(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select wallet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">Hot Wallet</SelectItem>
                    <SelectItem value="cold">Cold Wallet</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                    <SelectItem value="defi">DeFi Protocol</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newWalletType === "hot" || newWalletType === "cold") && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="wallet-address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="wallet-address"
                      value={newWalletAddress}
                      onChange={(e) => setNewWalletAddress(e.target.value)}
                      className="col-span-3"
                      placeholder="0x123...abc"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="wallet-network" className="text-right">
                      Network
                    </Label>
                    <Select
                      value={newWalletNetwork}
                      onValueChange={(
                        value: "ethereum" | "bitcoin" | "polygon" | "solana" | "avalanche" | "binance" | "other",
                      ) => setNewWalletNetwork(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="bitcoin">Bitcoin</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                        <SelectItem value="solana">Solana</SelectItem>
                        <SelectItem value="avalanche">Avalanche</SelectItem>
                        <SelectItem value="binance">Binance Smart Chain</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {newWalletType === "exchange" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="wallet-exchange" className="text-right">
                    Exchange
                  </Label>
                  <Input
                    id="wallet-exchange"
                    value={newWalletExchange}
                    onChange={(e) => setNewWalletExchange(e.target.value)}
                    className="col-span-3"
                    placeholder="Coinbase, Binance, etc."
                    required
                  />
                </div>
              )}

              {newWalletType === "defi" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="wallet-network" className="text-right">
                    Network
                  </Label>
                  <Select
                    value={newWalletNetwork}
                    onValueChange={(
                      value: "ethereum" | "bitcoin" | "polygon" | "solana" | "avalanche" | "binance" | "other",
                    ) => setNewWalletNetwork(value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                      <SelectItem value="avalanche">Avalanche</SelectItem>
                      <SelectItem value="binance">Binance Smart Chain</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wallet-color" className="text-right">
                  Color
                </Label>
                <Input
                  id="wallet-color"
                  type="color"
                  value={newWalletColor}
                  onChange={(e) => setNewWalletColor(e.target.value)}
                  className="col-span-3 h-10"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wallet-notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="wallet-notes"
                  value={newWalletNotes}
                  onChange={(e) => setNewWalletNotes(e.target.value)}
                  className="col-span-3"
                  placeholder="Optional notes about this wallet"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingWallet(false)
                  resetWalletForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Wallet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Asset Dialog */}
      <Dialog open={isAddingAsset} onOpenChange={setIsAddingAsset}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Crypto Asset</DialogTitle>
            <DialogDescription>Add a cryptocurrency or token to your portfolio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAsset}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="asset-name"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="col-span-3"
                  placeholder="Bitcoin"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-symbol" className="text-right">
                  Symbol
                </Label>
                <Input
                  id="asset-symbol"
                  value={newAssetSymbol}
                  onChange={(e) => setNewAssetSymbol(e.target.value)}
                  className="col-span-3"
                  placeholder="BTC"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-type" className="text-right">
                  Market Type
                </Label>
                <Select
                  value={newAssetMarketType}
                  onValueChange={(value: "defi" | "cefi") => setNewAssetMarketType(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select market type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cefi">CeFi (Centralized)</SelectItem>
                    <SelectItem value="defi">DeFi (Decentralized)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="asset-amount"
                  value={newAssetAmount}
                  onChange={(e) => setNewAssetAmount(e.target.value)}
                  className="col-span-3"
                  placeholder="1.5"
                  type="number"
                  step="any"
                  min="0"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-price" className="text-right">
                  Price (USD)
                </Label>
                <Input
                  id="asset-price"
                  value={newAssetPrice}
                  onChange={(e) => setNewAssetPrice(e.target.value)}
                  className="col-span-3"
                  placeholder="30000"
                  type="number"
                  step="any"
                  min="0"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-wallet" className="text-right">
                  Wallet
                </Label>
                <Select value={newAssetWalletId} onValueChange={setNewAssetWalletId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-network" className="text-right">
                  Network
                </Label>
                <Select
                  value={newAssetNetwork}
                  onValueChange={(
                    value: "ethereum" | "bitcoin" | "polygon" | "solana" | "avalanche" | "binance" | "other",
                  ) => setNewAssetNetwork(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="solana">Solana</SelectItem>
                    <SelectItem value="avalanche">Avalanche</SelectItem>
                    <SelectItem value="binance">Binance Smart Chain</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newAssetMarketType === "defi" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="asset-protocol" className="text-right">
                    Protocol
                  </Label>
                  <Input
                    id="asset-protocol"
                    value={newAssetProtocol}
                    onChange={(e) => setNewAssetProtocol(e.target.value)}
                    className="col-span-3"
                    placeholder="Aave, Uniswap, etc."
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-staked" className="text-right">
                  Staked
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <input
                    type="checkbox"
                    id="asset-staked"
                    checked={newAssetIsStaked}
                    onChange={(e) => setNewAssetIsStaked(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="asset-staked">This asset is staked or earning yield</Label>
                </div>
              </div>

              {newAssetIsStaked && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="asset-apy" className="text-right">
                    APY %
                  </Label>
                  <Input
                    id="asset-apy"
                    value={newAssetStakingApy}
                    onChange={(e) => setNewAssetStakingApy(e.target.value)}
                    className="col-span-3"
                    placeholder="5.2"
                    type="number"
                    step="any"
                    min="0"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingAsset(false)
                  resetAssetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Asset</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

