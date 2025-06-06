"use client"

import { useState } from "react"
import { useBudgetStore } from "./use-budget-store"

export type Message = {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are a financial advisor assistant that provides personalized advice based on the user's financial data.",
      timestamp: new Date(),
    },
    {
      role: "assistant",
      content:
        "Hi there! I'm your financial assistant. I can analyze your financial profile and provide personalized advice. What would you like to know about your finances today?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const { transactions, categories, accounts, budgets, budgetPeriods } = useBudgetStore()

  // Calculate financial summary
  const totalIncome = transactions
    .filter((t) => {
      const category = categories.find((c) => c.id === t.categoryId)
      return category?.type === "income"
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => {
      const category = categories.find((c) => c.id === t.categoryId)
      return category?.type === "expense"
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const netWorth = accounts.reduce((sum, account) => sum + account.balance, 0)

  const financialProfile = {
    totalIncome,
    totalExpenses,
    netWorth,
    savingsRate: (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1),
    accounts: accounts.map((a) => ({
      name: a.name,
      type: a.type,
      balance: a.balance,
    })),
    topCategories: categories
      .filter((c) => c.type === "expense" && c.parentId !== null)
      .map((category) => {
        const totalSpent = transactions
          .filter((t) => t.categoryId === category.id)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        return {
          name: category.name,
          totalSpent,
        }
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5),
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)

    // Add user message
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // In a real implementation, you would call an AI API here
    // For now, we'll simulate a response based on the user's query
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate response based on user query and financial data
    let responseText = ""

    const lowerCaseMessage = content.toLowerCase()

    if (lowerCaseMessage.includes("budget") || lowerCaseMessage.includes("spending")) {
      const activeBudgetPeriod = budgetPeriods.find((p) => p.isActive)
      const activeBudgets = activeBudgetPeriod ? budgets.filter((b) => b.periodId === activeBudgetPeriod.id) : []

      const totalBudgeted = activeBudgets.reduce((sum, budget) => sum + budget.amount, 0)

      responseText = `Based on your financial profile, you've budgeted $${totalBudgeted.toFixed(2)} for the current period. Your total expenses are $${totalExpenses.toFixed(2)}, which is ${totalExpenses > totalBudgeted ? "over" : "under"} your budget ${Math.abs(totalExpenses - totalBudgeted).toFixed(2)}.
      
I recommend ${totalExpenses > totalBudgeted ? "reviewing your spending in categories that exceed their budgets" : "considering if you can allocate more to savings or debt repayment since you're under budget"}.`
    } else if (lowerCaseMessage.includes("save") || lowerCaseMessage.includes("saving")) {
      responseText = `Your current savings rate is approximately ${financialProfile.savingsRate}% of your income. Financial experts typically recommend saving 15-20% of your income.
      
${Number(financialProfile.savingsRate) < 15 ? "To improve your savings rate, consider reviewing discretionary expenses or finding ways to increase your income." : "You're doing well with your savings rate! Consider diversifying where you keep your savings between emergency funds, retirement accounts, and other investments."}`
    } else if (lowerCaseMessage.includes("debt") || lowerCaseMessage.includes("credit")) {
      const creditAccounts = accounts.filter((a) => a.type === "credit")
      const totalDebt = creditAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0)

      responseText = `You currently have ${creditAccounts.length} credit accounts with a total balance of $${totalDebt.toFixed(2)}.
      
${totalDebt > 0 ? "I recommend prioritizing paying off high-interest debt first while making minimum payments on other accounts. Consider the debt avalanche (highest interest first) or debt snowball (smallest balance first) methods." : "Great job having no credit card debt! This helps your financial health significantly."}`
    } else if (lowerCaseMessage.includes("invest") || lowerCaseMessage.includes("investment")) {
      responseText = `Based on your financial profile, you have a net worth of $${netWorth.toFixed(2)}. 
      
For investment advice, consider following these principles:
1. Ensure you have an emergency fund of 3-6 months of expenses first
2. Maximize tax-advantaged retirement accounts like 401(k)s and IRAs
3. Consider low-cost index funds for long-term growth
4. Diversify your investments across different asset classes

Would you like more specific investment recommendations based on your age and risk tolerance?`
    } else {
      responseText = `Based on your financial profile:
- Monthly Income: $${totalIncome.toFixed(2)}
- Monthly Expenses: $${totalExpenses.toFixed(2)}
- Net Worth: $${netWorth.toFixed(2)}
- Savings Rate: ${financialProfile.savingsRate}%

What specific aspect of your finances would you like advice on? I can help with budgeting, saving, debt management, investing, or general financial planning.`
    }

    // Add AI response
    const assistantMessage: Message = {
      role: "assistant",
      content: responseText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)

    return assistantMessage
  }

  return {
    messages: messages.filter((m) => m.role !== "system"),
    isLoading,
    sendMessage,
    financialProfile,
  }
}

