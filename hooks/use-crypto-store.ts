"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "@/components/ui/use-toast"

export type NetworkType = "ethereum" | "bitcoin" | "polygon" | "solana" | "avalanche" | "binance" | "other"
export type WalletType = "hot" | "cold" | "exchange" | "defi" | "other"
export type MarketType = "defi" | "cefi"

export interface CryptoAsset {
  id: string
  name: string
  symbol: string
  marketType: MarketType
  amount: number
  usdValue: number
  priceUsd: number
  protocol?: string
  network: NetworkType
  walletId: string
  lastUpdated: string
  marketData?: {
    change24h: number
    change7d: number
    high24h: number
    low24h: number
    marketCap: number
    volume24h: number
  }
  notes?: string
  isStaked?: boolean
  stakingApy?: number
  isLocked?: boolean
  unlockDate?: string
}

export interface CryptoWallet {
  id: string
  name: string
  type: WalletType
  address?: string
  network?: NetworkType
  exchange?: string
  balance: number
  lastUpdated: string
  isHidden?: boolean
  color?: string
  icon?: string
  notes?: string
}

export interface TokenPrice {
  id: string
  symbol: string
  name: string
  priceUsd: number
  change24h: number
  change7d: number
  lastUpdated: string
}

interface CryptoStore {
  wallets: CryptoWallet[]
  assets: CryptoAsset[]
  tokenPrices: TokenPrice[]
  isLoading: boolean
  error: string | null

  // Wallet actions
  addWallet: (wallet: Omit<CryptoWallet, "id" | "balance" | "lastUpdated">) => string
  updateWallet: (id: string, wallet: Partial<Omit<CryptoWallet, "id" | "lastUpdated">>) => boolean
  deleteWallet: (id: string) => boolean

  // Asset actions
  addAsset: (asset: Omit<CryptoAsset, "id" | "usdValue" | "lastUpdated">) => string
  updateAsset: (id: string, asset: Partial<Omit<CryptoAsset, "id" | "lastUpdated">>) => boolean
  deleteAsset: (id: string) => boolean
  updateAssetPrices: () => void

  // Import/Export
  importCryptoData: (data: string) => boolean
  exportCryptoData: () => string
  resetCryptoData: () => void
}

// Default data
const defaultWallets: CryptoWallet[] = [
  {
    id: "metamask",
    name: "MetaMask",
    type: "hot",
    address: "0x1234...5678",
    network: "ethereum",
    balance: 1250,
    lastUpdated: new Date().toISOString(),
    color: "#E2761B",
    icon: "metamask",
  },
  {
    id: "ledger",
    name: "Ledger",
    type: "cold",
    address: "bc1q...zdrn",
    network: "bitcoin",
    balance: 3500,
    lastUpdated: new Date().toISOString(),
    color: "#000000",
    icon: "ledger",
  },
  {
    id: "coinbase",
    name: "Coinbase",
    type: "exchange",
    exchange: "Coinbase",
    balance: 2750,
    lastUpdated: new Date().toISOString(),
    color: "#0052FF",
    icon: "coinbase",
  },
  {
    id: "aave",
    name: "Aave Protocol",
    type: "defi",
    network: "ethereum",
    balance: 1800,
    lastUpdated: new Date().toISOString(),
    color: "#B6509E",
    icon: "aave",
  },
]

const defaultAssets: CryptoAsset[] = [
  {
    id: "eth-metamask",
    name: "Ethereum",
    symbol: "ETH",
    marketType: "cefi",
    amount: 0.75,
    usdValue: 1500,
    priceUsd: 2000,
    network: "ethereum",
    walletId: "metamask",
    lastUpdated: new Date().toISOString(),
    marketData: {
      change24h: 2.5,
      change7d: 5.2,
      high24h: 2050,
      low24h: 1950,
      marketCap: 240000000000,
      volume24h: 15000000000,
    },
  },
  {
    id: "btc-ledger",
    name: "Bitcoin",
    symbol: "BTC",
    marketType: "cefi",
    amount: 0.12,
    usdValue: 3500,
    priceUsd: 29166.67,
    network: "bitcoin",
    walletId: "ledger",
    lastUpdated: new Date().toISOString(),
    marketData: {
      change24h: 1.8,
      change7d: -2.1,
      high24h: 29500,
      low24h: 28900,
      marketCap: 570000000000,
      volume24h: 25000000000,
    },
  },
  {
    id: "sol-coinbase",
    name: "Solana",
    symbol: "SOL",
    marketType: "cefi",
    amount: 25,
    usdValue: 1750,
    priceUsd: 70,
    network: "solana",
    walletId: "coinbase",
    lastUpdated: new Date().toISOString(),
    marketData: {
      change24h: 4.2,
      change7d: 8.7,
      high24h: 72,
      low24h: 68,
      marketCap: 30000000000,
      volume24h: 2000000000,
    },
  },
  {
    id: "link-coinbase",
    name: "Chainlink",
    symbol: "LINK",
    marketType: "cefi",
    amount: 50,
    usdValue: 1000,
    priceUsd: 20,
    network: "ethereum",
    walletId: "coinbase",
    lastUpdated: new Date().toISOString(),
    marketData: {
      change24h: 3.1,
      change7d: 6.5,
      high24h: 20.5,
      low24h: 19.5,
      marketCap: 10000000000,
      volume24h: 500000000,
    },
  },
  {
    id: "aave-eth",
    name: "Aave ETH",
    symbol: "aETH",
    marketType: "defi",
    amount: 0.5,
    usdValue: 1000,
    priceUsd: 2000,
    protocol: "Aave",
    network: "ethereum",
    walletId: "aave",
    lastUpdated: new Date().toISOString(),
    isStaked: true,
    stakingApy: 3.2,
    marketData: {
      change24h: 2.5,
      change7d: 5.2,
      high24h: 2050,
      low24h: 1950,
      marketCap: 240000000000,
      volume24h: 15000000000,
    },
  },
  {
    id: "uni-metamask",
    name: "Uniswap",
    symbol: "UNI",
    marketType: "defi",
    amount: 40,
    usdValue: 800,
    priceUsd: 20,
    protocol: "Uniswap",
    network: "ethereum",
    walletId: "metamask",
    lastUpdated: new Date().toISOString(),
    marketData: {
      change24h: 1.5,
      change7d: -0.8,
      high24h: 20.5,
      low24h: 19.5,
      marketCap: 9000000000,
      volume24h: 350000000,
    },
  },
]

const defaultTokenPrices: TokenPrice[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    priceUsd: 29166.67,
    change24h: 1.8,
    change7d: -2.1,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    priceUsd: 2000,
    change24h: 2.5,
    change7d: 5.2,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    priceUsd: 70,
    change24h: 4.2,
    change7d: 8.7,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    priceUsd: 20,
    change24h: 3.1,
    change7d: 6.5,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "uniswap",
    symbol: "UNI",
    name: "Uniswap",
    priceUsd: 20,
    change24h: 1.5,
    change7d: -0.8,
    lastUpdated: new Date().toISOString(),
  },
]

export const useCryptoStore = create<CryptoStore>()(
  persist(
    (set, get) => ({
      wallets: defaultWallets,
      assets: defaultAssets,
      tokenPrices: defaultTokenPrices,
      isLoading: false,
      error: null,

      // Wallet actions
      addWallet: (wallet) => {
        try {
          const id = crypto.randomUUID()
          const now = new Date().toISOString()

          set((state) => ({
            wallets: [
              ...state.wallets,
              {
                ...wallet,
                id,
                balance: 0,
                lastUpdated: now,
              },
            ],
          }))

          toast({
            title: "Wallet added",
            description: "Wallet has been added successfully",
          })

          return id
        } catch (error) {
          set({ error: "Failed to add wallet" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add wallet",
          })
          return ""
        }
      },

      updateWallet: (id, wallet) => {
        try {
          const now = new Date().toISOString()

          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === id
                ? {
                    ...w,
                    ...wallet,
                    lastUpdated: now,
                    // Recalculate balance if not explicitly provided
                    balance:
                      wallet.balance !== undefined
                        ? wallet.balance
                        : state.assets
                            .filter((asset) => asset.walletId === id)
                            .reduce((sum, asset) => sum + asset.usdValue, 0),
                  }
                : w,
            ),
          }))

          toast({
            title: "Wallet updated",
            description: "Wallet has been updated successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to update wallet" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update wallet",
          })
          return false
        }
      },

      deleteWallet: (id) => {
        try {
          // Check if wallet has assets
          const hasAssets = get().assets.some((a) => a.walletId === id)

          if (hasAssets) {
            toast({
              variant: "destructive",
              title: "Cannot delete wallet",
              description: "This wallet contains assets. Please move or delete them first.",
            })
            return false
          }

          set((state) => ({
            wallets: state.wallets.filter((w) => w.id !== id),
          }))

          toast({
            title: "Wallet deleted",
            description: "Wallet has been deleted successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to delete wallet" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete wallet",
          })
          return false
        }
      },

      // Asset actions
      addAsset: (asset) => {
        try {
          const id = crypto.randomUUID()
          const now = new Date().toISOString()

          // Get the current price from token prices
          const tokenPrice = get().tokenPrices.find((t) => t.symbol.toLowerCase() === asset.symbol.toLowerCase())

          const priceUsd = asset.priceUsd || (tokenPrice ? tokenPrice.priceUsd : 0)
          const usdValue = asset.amount * priceUsd

          const newAsset = {
            ...asset,
            id,
            priceUsd,
            usdValue,
            lastUpdated: now,
          }

          set((state) => ({
            assets: [...state.assets, newAsset],
          }))

          // Update wallet balance
          const wallets = get().wallets
          const wallet = wallets.find((w) => w.id === asset.walletId)

          if (wallet) {
            get().updateWallet(wallet.id, {
              balance: wallet.balance + usdValue,
            })
          }

          toast({
            title: "Asset added",
            description: "Crypto asset has been added successfully",
          })

          return id
        } catch (error) {
          set({ error: "Failed to add asset" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add asset",
          })
          return ""
        }
      },

      updateAsset: (id, asset) => {
        try {
          const now = new Date().toISOString()
          const currentAsset = get().assets.find((a) => a.id === id)

          if (!currentAsset) {
            throw new Error("Asset not found")
          }

          let priceUsd = currentAsset.priceUsd
          if (asset.priceUsd) {
            priceUsd = asset.priceUsd
          } else if (asset.symbol) {
            const tokenPrice = get().tokenPrices.find((t) => t.symbol.toLowerCase() === asset.symbol.toLowerCase())
            if (tokenPrice) {
              priceUsd = tokenPrice.priceUsd
            }
          }

          const amount = asset.amount !== undefined ? asset.amount : currentAsset.amount
          const usdValue = amount * priceUsd
          const oldValue = currentAsset.usdValue

          set((state) => ({
            assets: state.assets.map((a) =>
              a.id === id
                ? {
                    ...a,
                    ...asset,
                    priceUsd,
                    usdValue,
                    lastUpdated: now,
                  }
                : a,
            ),
          }))

          // Update wallet balance
          const wallets = get().wallets
          const wallet = wallets.find((w) => w.id === currentAsset.walletId)

          if (wallet) {
            get().updateWallet(wallet.id, {
              balance: wallet.balance - oldValue + usdValue,
            })
          }

          toast({
            title: "Asset updated",
            description: "Crypto asset has been updated successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to update asset" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update asset",
          })
          return false
        }
      },

      deleteAsset: (id) => {
        try {
          const asset = get().assets.find((a) => a.id === id)

          if (!asset) {
            throw new Error("Asset not found")
          }

          set((state) => ({
            assets: state.assets.filter((a) => a.id !== id),
          }))

          // Update wallet balance
          const wallets = get().wallets
          const wallet = wallets.find((w) => w.id === asset.walletId)

          if (wallet) {
            get().updateWallet(wallet.id, {
              balance: wallet.balance - asset.usdValue,
            })
          }

          toast({
            title: "Asset deleted",
            description: "Crypto asset has been deleted successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to delete asset" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete asset",
          })
          return false
        }
      },

      updateAssetPrices: () => {
        try {
          const now = new Date().toISOString()
          const assets = get().assets
          const tokenPrices = get().tokenPrices

          // Simulate price updates with small random changes
          const updatedTokenPrices = tokenPrices.map((token) => {
            const change = (Math.random() * 5 - 2.5) / 100 // -2.5% to +2.5%
            const newPrice = token.priceUsd * (1 + change)

            return {
              ...token,
              priceUsd: newPrice,
              change24h: (token.change24h || 0) + change * 100,
              lastUpdated: now,
            }
          })

          // Update assets with new prices
          const updatedAssets = assets.map((asset) => {
            const tokenPrice = updatedTokenPrices.find((t) => t.symbol.toLowerCase() === asset.symbol.toLowerCase())

            if (tokenPrice) {
              const newPrice = tokenPrice.priceUsd
              const newValue = asset.amount * newPrice

              return {
                ...asset,
                priceUsd: newPrice,
                usdValue: newValue,
                lastUpdated: now,
                marketData: {
                  ...asset.marketData,
                  change24h: tokenPrice.change24h,
                },
              }
            }

            return asset
          })

          // Update wallet balances
          const wallets = get().wallets
          const walletBalances = new Map<string, number>()

          updatedAssets.forEach((asset) => {
            const currentBalance = walletBalances.get(asset.walletId) || 0
            walletBalances.set(asset.walletId, currentBalance + asset.usdValue)
          })

          const updatedWallets = wallets.map((wallet) => {
            const newBalance = walletBalances.get(wallet.id)

            if (newBalance !== undefined) {
              return {
                ...wallet,
                balance: newBalance,
                lastUpdated: now,
              }
            }

            return wallet
          })

          set({
            assets: updatedAssets,
            tokenPrices: updatedTokenPrices,
            wallets: updatedWallets,
          })

          toast({
            title: "Prices updated",
            description: "Crypto asset prices have been updated",
          })
        } catch (error) {
          set({ error: "Failed to update prices" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update crypto prices",
          })
        }
      },

      importCryptoData: (data) => {
        try {
          const parsedData = JSON.parse(data)

          if (!parsedData.wallets || !parsedData.assets || !parsedData.tokenPrices) {
            toast({
              variant: "destructive",
              title: "Invalid data format",
              description: "The imported data is not in a valid format",
            })
            return false
          }

          set({
            wallets: parsedData.wallets || [],
            assets: parsedData.assets || [],
            tokenPrices: parsedData.tokenPrices || [],
          })

          toast({
            title: "Data imported",
            description: "Crypto data has been imported successfully",
          })

          return true
        } catch (error) {
          set({ error: "Failed to import data" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to import crypto data",
          })
          return false
        }
      },

      exportCryptoData: () => {
        try {
          const state = get()
          const data = {
            wallets: state.wallets,
            assets: state.assets,
            tokenPrices: state.tokenPrices,
            exportDate: new Date().toISOString(),
            version: "1.0.0",
          }

          return JSON.stringify(data)
        } catch (error) {
          set({ error: "Failed to export data" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to export crypto data",
          })
          return ""
        }
      },

      resetCryptoData: () => {
        try {
          set({
            wallets: defaultWallets,
            assets: defaultAssets,
            tokenPrices: defaultTokenPrices,
            error: null,
          })

          toast({
            title: "Data reset",
            description: "All crypto data has been reset to defaults",
          })

          return true
        } catch (error) {
          set({ error: "Failed to reset data" })
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to reset crypto data",
          })
          return false
        }
      },
    }),
    {
      name: "crypto-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        wallets: state.wallets,
        assets: state.assets,
        tokenPrices: state.tokenPrices,
      }),
    },
  ),
)

