"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCryptoStore, type NetworkType, type MarketType } from "@/hooks/use-crypto-store"

interface CryptoAssetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetId?: string // If editing existing asset
}

export function CryptoAssetForm({ open, onOpenChange, assetId }: CryptoAssetFormProps) {
  const { assets, wallets, tokenPrices, addAsset, updateAsset } = useCryptoStore()
  const editingAsset = assetId ? assets.find((a) => a.id === assetId) : undefined

  // Form state
  const [name, setName] = useState(editingAsset?.name || "")
  const [symbol, setSymbol] = useState(editingAsset?.symbol || "")
  const [marketType, setMarketType] = useState<MarketType>(editingAsset?.marketType || "cefi")
  const [amount, setAmount] = useState(editingAsset?.amount.toString() || "")
  const [price, setPrice] = useState(editingAsset?.priceUsd.toString() || "")
  const [walletId, setWalletId] = useState(editingAsset?.walletId || "")
  const [network, setNetwork] = useState<NetworkType>(editingAsset?.network || "ethereum")
  const [protocol, setProtocol] = useState(editingAsset?.protocol || "")
  const [isStaked, setIsStaked] = useState(editingAsset?.isStaked || false)
  const [stakingApy, setStakingApy] = useState(editingAsset?.stakingApy?.toString() || "")

  // Get suggested price from token prices
  useEffect(() => {
    if (symbol && !editingAsset) {
      const tokenPrice = tokenPrices.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase())
      if (tokenPrice) {
        setPrice(tokenPrice.priceUsd.toString())
      }
    }
  }, [symbol, tokenPrices, editingAsset])

  // Reset form function
  const resetForm = () => {
    if (editingAsset) {
      setName(editingAsset.name)
      setSymbol(editingAsset.symbol)
      setMarketType(editingAsset.marketType)
      setAmount(editingAsset.amount.toString())
      setPrice(editingAsset.priceUsd.toString())
      setWalletId(editingAsset.walletId)
      setNetwork(editingAsset.network)
      setProtocol(editingAsset.protocol || "")
      setIsStaked(editingAsset.isStaked || false)
      setStakingApy(editingAsset.stakingApy?.toString() || "")
    } else {
      setName("")
      setSymbol("")
      setMarketType("cefi")
      setAmount("")
      setPrice("")
      setWalletId("")
      setNetwork("ethereum")
      setProtocol("")
      setIsStaked(false)
      setStakingApy("")
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!walletId) {
      alert("Please select a wallet")
      return
    }

    const amountValue = Number.parseFloat(amount)
    const priceValue = Number.parseFloat(price)

    if (isNaN(amountValue) || isNaN(priceValue) || amountValue <= 0 || priceValue <= 0) {
      alert("Please enter valid amount and price")
      return
    }

    const assetData = {
      name,
      symbol: symbol.toUpperCase(),
      marketType,
      amount: amountValue,
      priceUsd: priceValue,
      network,
      walletId,
      protocol: protocol || undefined,
      isStaked,
      stakingApy: isStaked ? Number.parseFloat(stakingApy) || undefined : undefined,
    }

    if (editingAsset) {
      updateAsset(editingAsset.id, assetData)
    } else {
      addAsset(assetData)
    }

    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForm()
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingAsset ? "Edit Asset" : "Add Crypto Asset"}</DialogTitle>
          <DialogDescription>
            {editingAsset ? "Update your asset details below." : "Add a cryptocurrency or token to your portfolio."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="asset-name" className="text-right">
                Name
              </Label>
              <Input
                id="asset-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="col-span-3"
                placeholder="BTC"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="asset-type" className="text-right">
                Market Type
              </Label>
              <Select value={marketType} onValueChange={(value: MarketType) => setMarketType(value)}>
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
              <Select value={walletId} onValueChange={setWalletId}>
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
              <Select value={network} onValueChange={(value: NetworkType) => setNetwork(value)}>
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

            {marketType === "defi" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-protocol" className="text-right">
                  Protocol
                </Label>
                <Input
                  id="asset-protocol"
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="col-span-3"
                  placeholder="Aave, Uniswap, etc."
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Staked</Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox
                  id="asset-staked"
                  checked={isStaked}
                  onCheckedChange={(checked) => setIsStaked(checked as boolean)}
                />
                <Label htmlFor="asset-staked" className="font-normal">
                  This asset is staked or earning yield
                </Label>
              </div>
            </div>

            {isStaked && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-apy" className="text-right">
                  APY %
                </Label>
                <Input
                  id="asset-apy"
                  value={stakingApy}
                  onChange={(e) => setStakingApy(e.target.value)}
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
                onOpenChange(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{editingAsset ? "Save Changes" : "Add Asset"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

