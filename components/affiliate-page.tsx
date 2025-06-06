"use client"

import { useState } from "react"
import { Copy, CheckCircle, Share2, Gift, Users, CreditCard, ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export function AffiliatePage() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const affiliateLink = "https://tintin.finance/ref/elias-estrada"
  const referralCode = "ELIAS25"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "Your affiliate link has been copied to clipboard.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join TinTin Finance",
        text: "I'm using TinTin to manage my finances. Join me and get 1 month free!",
        url: affiliateLink,
      })
    } else {
      copyToClipboard(affiliateLink)
    }
  }

  return (
    <div className="container py-6 space-y-8 max-w-6xl">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Program</h1>
        <p className="text-muted-foreground">Share TinTin with friends and earn rewards</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-orange-500" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link with friends and family. When they sign up, you both get 1 month free!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={affiliateLink} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(affiliateLink)}
                className="flex-shrink-0"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={shareLink} className="flex-shrink-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Or share your referral code:</p>
              <div className="flex items-center gap-2">
                <code className="relative rounded bg-muted px-[0.5rem] py-[0.3rem] font-mono text-sm font-semibold">
                  {referralCode}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(referralCode)}
                  className="h-7 text-xs gap-1"
                >
                  {copied ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  Copy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Your Referrals
            </CardTitle>
            <CardDescription>Track your successful referrals and rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Total Referrals</p>
                  <p className="text-muted-foreground text-sm">Lifetime</p>
                </div>
                <p className="text-3xl font-bold">3</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Rewards Earned</p>
                  <p className="text-muted-foreground text-sm">3 months free</p>
                </div>
                <p className="text-3xl font-bold">$45</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Detailed History
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-500" />
              Rewards
            </CardTitle>
            <CardDescription>How our referral program works</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                  1
                </div>
                <div>
                  <p className="font-medium">Share your unique link</p>
                  <p className="text-sm text-muted-foreground">Send to friends via email, social media, or text</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                  2
                </div>
                <div>
                  <p className="font-medium">Friends sign up</p>
                  <p className="text-sm text-muted-foreground">They create an account using your link</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                  3
                </div>
                <div>
                  <p className="font-medium">You both get rewarded</p>
                  <p className="text-sm text-muted-foreground">Each of you receives 1 month of TinTin Premium free</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full gap-1">
              Learn More <ExternalLink className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Referrals</TabsTrigger>
          <TabsTrigger value="history">Referral History</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Referrals</CardTitle>
              <CardDescription>People who signed up using your link</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Joined 2 weeks ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 dark:text-green-400">Active</p>
                    <p className="text-sm text-muted-foreground">Premium Plan</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Michael Chen</p>
                    <p className="text-sm text-muted-foreground">Joined 1 month ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 dark:text-green-400">Active</p>
                    <p className="text-sm text-muted-foreground">Basic Plan</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alex Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Joined 3 months ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 dark:text-green-400">Active</p>
                    <p className="text-sm text-muted-foreground">Premium Plan</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
              <CardDescription>Complete history of your referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Joined 2 weeks ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 dark:text-green-400">+1 Month Free</p>
                    <p className="text-sm text-muted-foreground">Apr 5, 2023</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Michael Chen</p>
                    <p className="text-sm text-muted-foreground">Joined 1 month ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 dark:text-green-400">+1 Month Free</p>
                    <p className="text-sm text-muted-foreground">Mar 12, 2023</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Alex Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Joined 3 months ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 dark:text-green-400">+1 Month Free</p>
                    <p className="text-sm text-muted-foreground">Jan 23, 2023</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Jamie Smith</p>
                    <p className="text-sm text-muted-foreground">Joined 6 months ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-orange-600">Expired</p>
                    <p className="text-sm text-muted-foreground">Oct 15, 2022</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-1">
                Load More <ArrowRight className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

