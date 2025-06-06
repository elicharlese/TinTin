import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CreditBureau = "Experian" | "TransUnion" | "Equifax"
export type CreditImpact = "positive" | "negative" | "neutral"

export type CreditScore = {
  bureau: CreditBureau
  score: number
  date: string
  range: {
    min: number
    max: number
  }
}

export type CreditFactor = {
  id: string
  name: string
  status: "excellent" | "good" | "fair" | "poor"
  impact: CreditImpact
  description: string
  recommendations: string[]
  score: number
}

export type CreditAccount = {
  id: string
  name: string
  type: "credit_card" | "loan" | "mortgage" | "auto_loan" | "student_loan" | "other"
  balance: number
  creditLimit?: number
  utilization?: number
  openDate: string
  paymentStatus: "current" | "late_30" | "late_60" | "late_90" | "collections"
  lastReported: string
}

export type CreditActivity = {
  id: string
  date: string
  title: string
  description: string
  impact: CreditImpact
  changeAmount?: number
}

export type CreditGoal = {
  id: string
  title: string
  targetScore: number
  currentScore: number
  startDate: string
  targetDate: string
  completed: boolean
  steps: {
    id: string
    description: string
    completed: boolean
  }[]
}

export type CreditProduct = {
  id: string
  name: string
  provider: string
  type: "secured_card" | "credit_builder" | "loan" | "monitoring"
  description: string
  benefits: string[]
  requirements: string[]
  sponsored: boolean
  url: string
}

type CreditSettings = {
  preferredBureau: CreditBureau
  lastRefresh: string | null
}

type CreditStore = {
  scores: CreditScore[]
  feed: CreditActivity[]
  factors: CreditFactor[]
  accounts: CreditAccount[]
  goals: CreditGoal[]
  products: CreditProduct[]
  settings: CreditSettings
  // Actions
  refreshCreditData: () => Promise<void>
  addGoal: (goal: CreditGoal) => void
  updateGoal: (id: string, goal: Partial<CreditGoal>) => void
  deleteGoal: (id: string) => void
}

const sampleFactors: CreditFactor[] = [
  {
    id: "1",
    name: "Payment History",
    status: "good",
    impact: "high",
    description: "Your payment history shows you generally pay on time, with a few late payments.",
    recommendations: ["Set up automatic payments to ensure you never miss a due date."],
    score: 75,
  },
  {
    id: "2",
    name: "Credit Utilization",
    status: "fair",
    impact: "high",
    description: "Your credit utilization is at 45%, which is higher than the recommended 30%.",
    recommendations: ["Try to pay down your balances to below 30% of your credit limits."],
    score: 50,
  },
  {
    id: "3",
    name: "Credit Age",
    status: "good",
    impact: "medium",
    description: "Your average account age is 5 years, which is considered good.",
    recommendations: ["Keep your oldest accounts open to maintain a long credit history."],
    score: 80,
  },
  {
    id: "4",
    name: "Credit Mix",
    status: "fair",
    impact: "low",
    description: "You have a limited mix of credit types, primarily credit cards.",
    recommendations: ["Consider diversifying your credit portfolio with different types of accounts."],
    score: 60,
  },
  {
    id: "5",
    name: "New Credit",
    status: "excellent",
    impact: "low",
    description: "You have few recent credit inquiries, which is positive.",
    recommendations: ["Continue to apply for new credit sparingly to maintain this factor."],
    score: 90,
  },
]

const sampleAccounts: CreditAccount[] = [
  {
    id: "1",
    name: "Chase Freedom",
    type: "credit_card",
    balance: 2500,
    creditLimit: 5000,
    utilization: 50,
    openDate: "2018-05-01",
    paymentStatus: "current",
    lastReported: "2023-03-10",
  },
  {
    id: "2",
    name: "Bank of America Cash Rewards",
    type: "credit_card",
    balance: 1200,
    creditLimit: 4000,
    utilization: 30,
    openDate: "2020-02-15",
    paymentStatus: "current",
    lastReported: "2023-03-05",
  },
  {
    id: "3",
    name: "Student Loan",
    type: "student_loan",
    balance: 15000,
    openDate: "2015-09-01",
    paymentStatus: "current",
    lastReported: "2023-03-01",
  },
  {
    id: "4",
    name: "Auto Loan",
    type: "auto_loan",
    balance: 8500,
    openDate: "2021-11-01",
    paymentStatus: "current",
    lastReported: "2023-03-08",
  },
]

const sampleActivities: CreditActivity[] = [
  {
    id: "1",
    date: "2023-03-10",
    title: "Paid down Chase Freedom balance",
    description: "Paid down Chase Freedom balance by $500",
    impact: "positive",
    changeAmount: 5,
  },
  {
    id: "2",
    date: "2023-03-05",
    title: "New hard inquiry",
    description: "New hard inquiry from Capital One",
    impact: "negative",
    changeAmount: -3,
  },
  {
    id: "3",
    date: "2023-02-28",
    title: "Closed Discover It card account",
    description: "Closed Discover It card account",
    impact: "negative",
    changeAmount: -2,
  },
  {
    id: "4",
    date: "2023-02-15",
    title: "Decreased overall credit utilization",
    description: "Decreased overall credit utilization",
    impact: "positive",
    changeAmount: 8,
  },
  {
    id: "5",
    date: "2023-02-01",
    title: "On-time payments reported",
    description: "On-time payments reported for all accounts",
    impact: "positive",
    changeAmount: 4,
  },
]

const sampleGoals: CreditGoal[] = [
  {
    id: "1",
    title: "Reach 750 credit score",
    targetScore: 750,
    currentScore: 720,
    startDate: "2023-01-01",
    targetDate: "2023-06-30",
    completed: false,
    steps: [
      {
        id: "1-1",
        description: "Pay down credit card balances to below 30% utilization",
        completed: false,
      },
      {
        id: "1-2",
        description: "Set up automatic payments for all accounts",
        completed: true,
      },
      {
        id: "1-3",
        description: "Dispute inaccurate information on credit report",
        completed: false,
      },
    ],
  },
  {
    id: "2",
    title: "Qualify for mortgage",
    targetScore: 760,
    currentScore: 720,
    startDate: "2023-01-01",
    targetDate: "2023-12-31",
    completed: false,
    steps: [
      {
        id: "2-1",
        description: "Maintain perfect payment history",
        completed: false,
      },
      {
        id: "2-2",
        description: "Reduce overall debt",
        completed: false,
      },
      {
        id: "2-3",
        description: "Avoid new credit applications",
        completed: true,
      },
    ],
  },
]

const sampleProducts: CreditProduct[] = [
  {
    id: "1",
    name: "Secured Credit Builder Card",
    provider: "Capital One",
    type: "secured_card",
    description: "Build credit with a secured card that reports to all three bureaus.",
    benefits: [
      "No annual fee",
      "Reports to all three credit bureaus",
      "Potential for credit line increase after 6 months",
    ],
    requirements: ["Security deposit of $200-$1,000", "No active bankruptcy"],
    sponsored: true,
    url: "#",
  },
  {
    id: "2",
    name: "Credit Builder Loan",
    provider: "Self",
    type: "credit_builder",
    description: "Build credit and savings at the same time with a credit builder loan.",
    benefits: [
      "No hard credit check",
      "Reports to all three credit bureaus",
      "Get your money back at the end of the term",
    ],
    requirements: ["Valid bank account", "Valid ID", "Monthly payments from $25-$150"],
    sponsored: false,
    url: "#",
  },
  {
    id: "3",
    name: "Premium Credit Monitoring",
    provider: "Experian",
    type: "monitoring",
    description: "Get comprehensive credit monitoring and identity protection.",
    benefits: ["Daily credit monitoring", "Identity theft insurance up to $1M", "Credit score simulator"],
    requirements: ["Monthly subscription fee"],
    sponsored: true,
    url: "#",
  },
]

const defaultSettings: CreditSettings = {
  preferredBureau: "Experian",
  lastRefresh: null,
}

export const useCreditStore = create<CreditStore>()(
  persist(
    (set, get) => ({
      scores: [],
      feed: sampleActivities,
      factors: sampleFactors,
      accounts: sampleAccounts,
      goals: sampleGoals,
      products: sampleProducts,
      settings: defaultSettings,

      refreshCreditData: async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simulate new score
        const newScore = Math.floor(Math.random() * (850 - 600 + 1)) + 600
        const change = newScore - (get().scores[0]?.score || newScore)

        set((state) => ({
          scores: [
            {
              bureau: state.settings.preferredBureau,
              score: newScore,
              date: new Date().toISOString(),
              range: { min: 300, max: 850 },
              previousScore: state.scores[0]?.score,
              change: change,
            },
            ...state.scores,
          ].slice(0, 5),
          settings: {
            ...state.settings,
            lastRefresh: new Date().toISOString(),
          },
        }))
      },

      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, goal],
        })),

      updateGoal: (id, goal) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...goal } : g)),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),
    }),
    {
      name: "credit-storage",
    },
  ),
)

