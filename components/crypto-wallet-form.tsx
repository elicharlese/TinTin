"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCryptoStore, type WalletType, type NetworkType } from "@/hooks/use-crypto-store"

interface CryptoWalletFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletId?: string // If editing existing wallet
}

export function CryptoWalletForm({ open, onOpenChange, walletId }: CryptoWalletFormProps) {
  const { wallets, addWallet, updateWallet } = useCryptoStore()
  const editingWallet = walletId ? wallets.find((w) => w.id === walletId) : undefined

  // Form state
  const [name, setName] = useState(editingWallet?.name || "")
  const [type, setType] = useState<WalletType>(editingWallet?.type || "hot")
  const [address, setAddress] = useState(editingWallet?.address || "")
  const [network, setNetwork] = useState<NetworkType>(editingWallet?.network || "ethereum")
  const [exchange, setExchange] = useState(editingWallet?.exchange || "")
  const [color, setColor] = useState(editingWallet?.color || "#4f46e5")
  const [notes, setNotes] = useState(editingWallet?.notes || "")

  // Reset form function
  const resetForm = () => {
    if (editingWallet) {
      setName(editingWallet.name)
      setType(editingWallet.type)
      setAddress(editingWallet.address || "")
      setNetwork(editingWallet.network || "ethereum")
      setExchange(editingWallet.exchange || "")
      setColor(editingWallet.color || "#4f46e5")
      setNotes(editingWallet.notes || "")
    } else {
      setName("")
      setType("hot")
      setAddress("")
      setNetwork("ethereum")
      setExchange("")
      setColor("#4f46e5")
      setNotes("")
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const walletData = {
      name,
      type,
      address: address || undefined,
      network: type !== "exchange" ? network : undefined,
      exchange: type === "exchange" ? exchange : undefined,
      color,
      notes: notes || undefined,
    }

    if (editingWallet) {
      updateWallet(editingWallet.id, walletData)
    } else {
      addWallet(walletData)
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
          <DialogTitle>{editingWallet ? "Edit Wallet" : "Add Crypto Wallet"}</DialogTitle>
          <DialogDescription>
            {editingWallet
              ? "Update your wallet details below."
              : "Add a new wallet or exchange account to track your crypto assets."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wallet-name" className="text-right">
                Name
              </Label>
              <Input
                id="wallet-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={type}
                onValueChange={(value: WalletType) => setType(value)}
                disabled={!!editingWallet} // Disable type change for existing wallets
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

            {(type === "hot" || type === "cold") && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="wallet-address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="wallet-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="col-span-3"
                    placeholder="0x123...abc"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="wallet-network" className="text-right">
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
              </>
            )}

            {type === "exchange" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wallet-exchange" className="text-right">
                  Exchange
                </Label>
                <Input
                  id="wallet-exchange"
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  className="col-span-3"
                  placeholder="Coinbase, Binance, etc."
                  required
                />
              </div>
            )}

            {type === "defi" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wallet-network" className="text-right">
                  Network
                </Label>
                <Select value={network} onValueChange={(value: NetworkType) => setNetwork(value)}>
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
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="col-span-3 h-10"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wallet-notes" className="text-right">
                Notes
              </Label>
              <Input
                id="wallet-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                onOpenChange(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{editingWallet ? "Save Changes" : "Add Wallet"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

