import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          name: string
          type: 'checking' | 'savings' | 'credit' | 'investment' | 'crypto'
          balance: number
          color: string
          is_active: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'checking' | 'savings' | 'credit' | 'investment' | 'crypto'
          balance?: number
          color: string
          is_active?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          type?: 'checking' | 'savings' | 'credit' | 'investment' | 'crypto'
          balance?: number
          color?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          parent_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          parent_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          color?: string
          parent_id?: string | null
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          color?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          description: string
          amount: number
          date: string
          account_id: string
          category_id: string
          tags: string[] | null
          notes: string | null
          is_recurring: boolean
          recurrence_type: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
          recurrence_custom_days: number | null
          recurrence_end_date: string | null
          is_reviewed: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          date: string
          account_id: string
          category_id: string
          tags?: string[] | null
          notes?: string | null
          is_recurring?: boolean
          recurrence_type?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
          recurrence_custom_days?: number | null
          recurrence_end_date?: string | null
          is_reviewed?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          description?: string
          amount?: number
          date?: string
          account_id?: string
          category_id?: string
          tags?: string[] | null
          notes?: string | null
          is_recurring?: boolean
          recurrence_type?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
          recurrence_custom_days?: number | null
          recurrence_end_date?: string | null
          is_reviewed?: boolean
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          name: string
          amount: number
          period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          category_ids: string[]
          start_date: string
          end_date: string | null
          is_active: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          amount: number
          period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          category_ids: string[]
          start_date: string
          end_date?: string | null
          is_active?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          amount?: number
          period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          category_ids?: string[]
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          name: string
          description: string | null
          target_amount: number
          current_amount: number
          target_date: string
          is_completed: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          target_amount: number
          current_amount?: number
          target_date: string
          is_completed?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          target_amount?: number
          current_amount?: number
          target_date?: string
          is_completed?: boolean
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          type: 'budget_exceeded' | 'low_balance' | 'goal_reached' | 'unusual_spending' | 'bill_reminder'
          title: string
          message: string
          severity: 'info' | 'warning' | 'error'
          is_read: boolean
          metadata: Record<string, any> | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'budget_exceeded' | 'low_balance' | 'goal_reached' | 'unusual_spending' | 'bill_reminder'
          title: string
          message: string
          severity: 'info' | 'warning' | 'error'
          is_read?: boolean
          metadata?: Record<string, any> | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          type?: 'budget_exceeded' | 'low_balance' | 'goal_reached' | 'unusual_spending' | 'bill_reminder'
          title?: string
          message?: string
          severity?: 'info' | 'warning' | 'error'
          is_read?: boolean
          metadata?: Record<string, any> | null
          updated_at?: string
        }
      }
      crypto_assets: {
        Row: {
          id: string
          name: string
          symbol: string
          market_type: 'cefi' | 'defi'
          amount: number
          usd_value: number
          price_usd: number
          network: string
          wallet_id: string
          protocol: string | null
          is_staked: boolean
          staking_apy: number | null
          last_updated: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          symbol: string
          market_type: 'cefi' | 'defi'
          amount: number
          usd_value: number
          price_usd: number
          network: string
          wallet_id: string
          protocol?: string | null
          is_staked?: boolean
          staking_apy?: number | null
          last_updated: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          symbol?: string
          market_type?: 'cefi' | 'defi'
          amount?: number
          usd_value?: number
          price_usd?: number
          network?: string
          wallet_id?: string
          protocol?: string | null
          is_staked?: boolean
          staking_apy?: number | null
          last_updated?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
