"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, CreditCard, DollarSign, LineChart, PiggyBank, Shield, Sparkles } from "lucide-react"
import AuthModal from "@/components/auth-modal"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function WelcomePage() {
  const { isAuthenticated, isDemoMode, enableDemoMode } = useAuth()
  const router = useRouter()

  const handleDemoAccess = () => {
    enableDemoMode()
    router.push("/")
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated || isDemoMode) {
    router.push("/")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
        <div className="animate-float inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-medium mb-6">
          <span className="text-primary">✨ New Feature</span>
          <span className="text-muted-foreground">AI-Powered Financial Insights</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Take Control of Your <span className="text-primary">Financial Future</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          TinTin helps you track expenses, manage budgets, and reach your financial goals with powerful tools and
          beautiful visualizations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <AuthModal>
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </AuthModal>

          <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl" onClick={handleDemoAccess}>
            Try Demo
          </Button>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-primary-foreground/20 opacity-70 blur-xl"></div>
          <div className="relative rounded-2xl border bg-card p-1 shadow-xl">
            <img
              src="/placeholder.svg?height=500&width=1000"
              alt="TinTin Dashboard Preview"
              className="rounded-xl shadow-lg w-full max-w-4xl"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Everything you need to master your finances</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-primary" />}
            title="Smart Budgeting"
            description="Create custom budgets and track your spending with intuitive visualizations and real-time updates."
          />

          <FeatureCard
            icon={<PiggyBank className="h-10 w-10 text-primary" />}
            title="Goal Tracking"
            description="Set financial goals and watch your progress with motivating visuals and milestone celebrations."
          />

          <FeatureCard
            icon={<CreditCard className="h-10 w-10 text-primary" />}
            title="Account Management"
            description="Connect all your accounts in one place for a complete picture of your financial health."
          />

          <FeatureCard
            icon={<LineChart className="h-10 w-10 text-primary" />}
            title="Investment Tracking"
            description="Monitor your investments and analyze performance with detailed charts and insights."
          />

          <FeatureCard
            icon={<Sparkles className="h-10 w-10 text-primary" />}
            title="AI Insights"
            description="Get personalized financial advice and spending insights powered by advanced AI."
          />

          <FeatureCard
            icon={<Shield className="h-10 w-10 text-primary" />}
            title="Bank-Level Security"
            description="Your data is protected with industry-leading encryption and security practices."
          />
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Loved by thousands of users</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="TinTin completely changed how I manage my money. I've saved over $5,000 in just 6 months!"
              author="Sarah J."
              role="Marketing Manager"
            />

            <TestimonialCard
              quote="The visualizations make it so easy to understand where my money is going. Best financial app I've ever used."
              author="Michael T."
              role="Software Engineer"
            />

            <TestimonialCard
              quote="I finally paid off my student loans thanks to the budgeting tools. I can't recommend TinTin enough!"
              author="Jessica K."
              role="Teacher"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your finances?</h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Join thousands of users who have taken control of their financial future with TinTin.
        </p>

        <AuthModal>
          <Button
            size="lg"
            className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </AuthModal>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <DollarSign className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold">TinTin</span>
            </div>

            <div className="flex gap-8">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Help
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} TinTin. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-3">{icon}</div>

      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function TestimonialCard({
  quote,
  author,
  role,
}: {
  quote: string
  author: string
  role: string
}) {
  return (
    <div className="bg-card border rounded-xl p-5 shadow-sm">
      <div className="text-primary mb-3">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <span key={i} className="text-lg">
              ★
            </span>
          ))}
      </div>
      <p className="italic mb-4">"{quote}"</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}

