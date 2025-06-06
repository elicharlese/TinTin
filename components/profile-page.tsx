"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { User, Mail, Phone, Lock, Camera, CreditCard, Bell, Eye, Shield, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock user data
const mockUser = {
  id: "user-1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "",
  preferences: {
    darkMode: true,
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
  },
}

export function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "personal"

  const [user, setUser] = useState(mockUser)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [preferences, setPreferences] = useState(user.preferences)

  // Handle tab change
  const handleTabChange = (value: string) => {
    router.push(`/profile?tab=${value}`)
  }

  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setUser({
        ...user,
        name,
        email,
        phone,
      })

      setIsLoading(false)
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      })
    }, 1000)
  }

  // Handle password update
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation password must match",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setIsLoading(false)
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      })
    }, 1000)
  }

  // Handle preferences update
  const handlePreferencesUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setUser({
        ...user,
        preferences,
      })

      setIsLoading(false)
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully",
      })
    }, 1000)
  }

  // Handle preference toggle
  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    })
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-64 h-fit md:h-full overflow-hidden">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full w-7 h-7" variant="outline">
                  <Camera className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-base">{user.name}</h3>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="w-full pt-6 flex-1 overflow-auto no-scrollbar">
              <nav className="flex flex-col space-y-1 w-full">
                <Button
                  variant={tab === "personal" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleTabChange("personal")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Personal Info
                </Button>
                <Button
                  variant={tab === "security" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleTabChange("security")}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </Button>
                <Button
                  variant={tab === "payment" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleTabChange("payment")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Methods
                </Button>
                <Button
                  variant={tab === "notifications" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleTabChange("notifications")}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button
                  variant={tab === "privacy" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleTabChange("privacy")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Privacy
                </Button>
                <Button
                  variant={tab === "billing" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleTabChange("billing")}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Billing
                </Button>
              </nav>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 h-full overflow-hidden">
          <Card className="h-full overflow-hidden">
            {tab === "personal" && (
              <div className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto no-scrollbar">
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          placeholder="john.doe@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </div>
            )}

            {tab === "security" && (
              <div className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto no-scrollbar">
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </div>
            )}

            {tab === "notifications" && (
              <div className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Customize your notification settings</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto no-scrollbar">
                  <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Theme</h3>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="dark-mode" className="flex items-center gap-2 cursor-pointer">
                          <span>Dark Mode</span>
                        </Label>
                        <Switch
                          id="dark-mode"
                          checked={preferences.darkMode}
                          onCheckedChange={() => handlePreferenceToggle("darkMode")}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-3">Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Email Notifications</span>
                          </Label>
                          <Switch
                            id="email-notifications"
                            checked={preferences.emailNotifications}
                            onCheckedChange={() => handlePreferenceToggle("emailNotifications")}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Push Notifications</span>
                          </Label>
                          <Switch
                            id="push-notifications"
                            checked={preferences.pushNotifications}
                            onCheckedChange={() => handlePreferenceToggle("pushNotifications")}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-3">Reports</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="weekly-reports" className="flex items-center gap-2 cursor-pointer">
                            <span>Weekly Reports</span>
                          </Label>
                          <Switch
                            id="weekly-reports"
                            checked={preferences.weeklyReports}
                            onCheckedChange={() => handlePreferenceToggle("weeklyReports")}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="monthly-reports" className="flex items-center gap-2 cursor-pointer">
                            <span>Monthly Reports</span>
                          </Label>
                          <Switch
                            id="monthly-reports"
                            checked={preferences.monthlyReports}
                            onCheckedChange={() => handlePreferenceToggle("monthlyReports")}
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                  </form>
                </CardContent>
              </div>
            )}

            {tab === "payment" && (
              <div className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto no-scrollbar">
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md flex items-center justify-center text-white font-bold">
                          Visa
                        </div>
                        <div>
                          <p className="font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 bg-gradient-to-r from-red-600 to-orange-400 rounded-md flex items-center justify-center text-white font-bold">
                          MC
                        </div>
                        <div>
                          <p className="font-medium">Mastercard ending in 5555</p>
                          <p className="text-sm text-muted-foreground">Expires 08/2024</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>

                    <Button className="w-full">Add Payment Method</Button>
                  </div>
                </CardContent>
              </div>
            )}

            {tab === "privacy" && (
              <div className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Manage your privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto no-scrollbar">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Data Sharing</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow us to use your data to improve our services
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Third-Party Analytics</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow third-party analytics tools to track your usage
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Personalized Recommendations</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive personalized recommendations based on your activity
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Data Export</h3>
                      <p className="text-sm text-muted-foreground mb-3">Download a copy of your personal data</p>
                      <Button variant="outline">Request Data Export</Button>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2 text-red-600">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Permanently delete your account and all your data
                      </p>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            )}

            {tab === "billing" && (
              <div className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>Manage your subscription and billing details</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto no-scrollbar">
                  <div className="space-y-6">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Current Plan</h3>
                        <Badge>Free</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        You are currently on the free plan with limited features.
                      </p>
                      <Button>Upgrade to Pro</Button>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Billing Address</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="first-name">First Name</Label>
                            <Input id="first-name" defaultValue="John" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input id="last-name" defaultValue="Doe" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input id="address" defaultValue="123 Main St" />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" defaultValue="San Francisco" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" defaultValue="CA" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input id="zip" defaultValue="94105" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input id="country" defaultValue="United States" />
                        </div>
                      </div>

                      <Button className="mt-4">Save Billing Address</Button>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Billing History</h3>
                      <div className="rounded-md border">
                        <div className="p-4 text-center text-muted-foreground">
                          <p>No billing history available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

