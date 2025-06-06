"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, CreditCard, PiggyBank, Target, Info } from "lucide-react"
import { useAlertsStore, type AlertPriority, type AlertType } from "@/hooks/use-alerts-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export function AlertGenerator() {
  const { addAlert } = useAlertsStore()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<AlertPriority>("medium")
  const [type, setType] = useState<AlertType>("system")
  const [actionUrl, setActionUrl] = useState("")
  const [actionText, setActionText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !message) {
      toast({
        title: "Missing fields",
        description: "Please fill in both title and message",
        variant: "destructive",
      })
      return
    }

    addAlert({
      title,
      message,
      priority,
      type,
      actionUrl: actionUrl || undefined,
      actionText: actionText || undefined,
    })

    toast({
      title: "Alert created",
      description: "Your alert has been added to the notifications",
    })

    // Reset form
    setTitle("")
    setMessage("")
    setPriority("medium")
    setType("system")
    setActionUrl("")
    setActionText("")
  }

  const handleQuickAlert = (preset: string) => {
    switch (preset) {
      case "bill":
        addAlert({
          title: "Upcoming Bill",
          message: "Your electricity bill of $85.42 is due in 3 days",
          priority: "high",
          type: "bill",
          actionUrl: "/recurring",
          actionText: "View Bill",
        })
        break
      case "budget":
        addAlert({
          title: "Budget Alert",
          message: "You have exceeded your Dining budget by $45.20 this month",
          priority: "medium",
          type: "budget",
          actionUrl: "/budget",
          actionText: "View Budget",
        })
        break
      case "account":
        addAlert({
          title: "Low Account Balance",
          message: "Your Checking account balance is below $500",
          priority: "high",
          type: "account",
          actionUrl: "/accounts",
          actionText: "View Account",
        })
        break
      case "goal":
        addAlert({
          title: "Goal Progress",
          message: "You are 75% of the way to your Vacation savings goal!",
          priority: "low",
          type: "goal",
          actionUrl: "/goals",
          actionText: "View Goal",
        })
        break
      case "system":
        addAlert({
          title: "New Feature Available",
          message: "Try our new investment tracking tools",
          priority: "low",
          type: "system",
          actionUrl: "/investments",
          actionText: "Explore",
        })
        break
    }

    toast({
      title: "Alert created",
      description: `A ${preset} alert has been added to your notifications`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Alert</CardTitle>
        <CardDescription>Add a new notification to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Alert title" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Alert message"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as AlertPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as AlertType)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bill">Bill</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="goal">Goal</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="actionUrl">Action URL (optional)</Label>
            <Input
              id="actionUrl"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="/path/to/page"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="actionText">Action Text (optional)</Label>
            <Input
              id="actionText"
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="View Details"
            />
          </div>

          <Button type="submit" className="w-full">
            Create Alert
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t pt-6">
        <div className="w-full mb-2">
          <h4 className="text-sm font-medium">Quick Alerts</h4>
        </div>
        <Button variant="outline" size="sm" onClick={() => handleQuickAlert("bill")}>
          <CreditCard className="mr-2 h-4 w-4" />
          Bill Due
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleQuickAlert("budget")}>
          <PiggyBank className="mr-2 h-4 w-4" />
          Budget Alert
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleQuickAlert("account")}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Low Balance
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleQuickAlert("goal")}>
          <Target className="mr-2 h-4 w-4" />
          Goal Progress
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleQuickAlert("system")}>
          <Info className="mr-2 h-4 w-4" />
          New Feature
        </Button>
      </CardFooter>
    </Card>
  )
}

