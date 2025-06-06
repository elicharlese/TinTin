"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useBudgetStore, type UserSettings } from "@/hooks/use-budget-store"
import { toast } from "@/components/ui/use-toast"
import { DataExportImport } from "@/components/data-export-import"
import { ThemeTest } from "@/components/theme-test"

export function SettingsPage() {
  const { settings, updateSettings, accounts } = useBudgetStore()
  const [isLoading, setIsLoading] = useState(false)
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings)

  // Handle settings update
  const handleSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Update settings
    updateSettings(localSettings)

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully",
      })
    }, 500)
  }

  // Handle setting change
  const handleSettingChange = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setLocalSettings({
      ...localSettings,
      [key]: value,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your general application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSettingsUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={localSettings.currency}
                    onValueChange={(value) => handleSettingChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={localSettings.dateFormat}
                    onValueChange={(value) => handleSettingChange("dateFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (US)</SelectItem>
                      <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (UK/EU)</SelectItem>
                      <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (ISO)</SelectItem>
                      <SelectItem value="MMMM d, yyyy">Month D, YYYY (Long)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultAccount">Default Account</Label>
                  <Select
                    value={localSettings.defaultAccount || ""}
                    onValueChange={(value) => handleSettingChange("defaultAccount", value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Default</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultView">Default View</Label>
                  <Select
                    value={localSettings.defaultView}
                    onValueChange={(value: "transactions" | "dashboard" | "reports") =>
                      handleSettingChange("defaultView", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="transactions">Transactions</SelectItem>
                      <SelectItem value="reports">Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Customize how information is displayed</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSettingsUpdate} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme" className="flex items-center gap-2 cursor-pointer">
                      <span>Dark Theme</span>
                    </Label>
                    <Select
                      value={localSettings.theme}
                      onValueChange={(value: "light" | "dark" | "system") => handleSettingChange("theme", value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label htmlFor="hideZeroTransactions" className="flex items-center gap-2 cursor-pointer">
                      <span>Hide Zero-Amount Transactions</span>
                    </Label>
                    <Switch
                      id="hideZeroTransactions"
                      checked={localSettings.hideZeroTransactions}
                      onCheckedChange={(checked) => handleSettingChange("hideZeroTransactions", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showRunningBalance" className="flex items-center gap-2 cursor-pointer">
                      <span>Show Running Balance</span>
                    </Label>
                    <Switch
                      id="showRunningBalance"
                      checked={localSettings.showRunningBalance}
                      onCheckedChange={(checked) => handleSettingChange("showRunningBalance", checked)}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
              </form>
              <ThemeTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export, import, or reset your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Backup & Restore</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export your data to create a backup or import data from a previous backup.
                </p>
                <DataExportImport />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
                      useBudgetStore.getState().resetData()
                      toast({
                        title: "Data reset",
                        description: "All data has been reset to defaults",
                      })
                    }
                  }}
                >
                  Reset All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

