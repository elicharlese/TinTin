/**
 * Generated Supabase types
 * This file should be generated using: supabase gen types typescript --local > src/types/supabase.ts
 */

export interface Database {
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
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          name: string
          type: string
          balance: number
          color: string
          is_active: boolean
          user_id: string
          institution?: string
          account_number?: string
          routing_number?: string
          plaid_item_id?: string
          plaid_account_id?: string
          is_hidden: boolean
          icon?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          balance?: number
          color: string
          is_active?: boolean
          user_id: string
          institution?: string
          account_number?: string
          routing_number?: string
          plaid_item_id?: string
          plaid_account_id?: string
          is_hidden?: boolean
          icon?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          balance?: number
          color?: string
          is_active?: boolean
          user_id?: string
          institution?: string
          account_number?: string
          routing_number?: string
          plaid_item_id?: string
          plaid_account_id?: string
          is_hidden?: boolean
          icon?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          parent_id?: string
          user_id: string
          type: string
          icon?: string
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          parent_id?: string
          user_id: string
          type?: string
          icon?: string
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          parent_id?: string
          user_id?: string
          type?: string
          icon?: string
          is_hidden?: boolean
          created_at?: string
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
          id?: string
          name?: string
          color?: string
          user_id?: string
          created_at?: string
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
          tags: string[]
          notes?: string
          is_recurring: boolean
          recurrence_type: string
          recurrence_custom_days?: number
          recurrence_end_date?: string
          is_reviewed: boolean
          is_excluded_from_reports: boolean
          plaid_transaction_id?: string
          merchant_name?: string
          merchant_category?: string
          location?: any
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
          tags?: string[]
          notes?: string
          is_recurring?: boolean
          recurrence_type?: string
          recurrence_custom_days?: number
          recurrence_end_date?: string
          is_reviewed?: boolean
          is_excluded_from_reports?: boolean
          plaid_transaction_id?: string
          merchant_name?: string
          merchant_category?: string
          location?: any
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          date?: string
          account_id?: string
          category_id?: string
          tags?: string[]
          notes?: string
          is_recurring?: boolean
          recurrence_type?: string
          recurrence_custom_days?: number
          recurrence_end_date?: string
          is_reviewed?: boolean
          is_excluded_from_reports?: boolean
          plaid_transaction_id?: string
          merchant_name?: string
          merchant_category?: string
          location?: any
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          name: string
          amount: number
          period: string
          category_ids: string[]
          start_date: string
          end_date?: string
          is_active: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          amount: number
          period: string
          category_ids: string[]
          start_date: string
          end_date?: string
          is_active?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          amount?: number
          period?: string
          category_ids?: string[]
          start_date?: string
          end_date?: string
          is_active?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          name: string
          description?: string
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
          description?: string
          target_amount: number
          current_amount?: number
          target_date: string
          is_completed?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          target_amount?: number
          current_amount?: number
          target_date?: string
          is_completed?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          type: string
          title: string
          message: string
          severity: string
          is_read: boolean
          metadata?: any
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          message: string
          severity: string
          is_read?: boolean
          metadata?: any
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          message?: string
          severity?: string
          is_read?: boolean
          metadata?: any
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      crypto_assets: {
        Row: {
          id: string
          name: string
          symbol: string
          market_type: string
          amount: number
          usd_value: number
          price_usd: number
          network: string
          wallet_id: string
          protocol?: string
          is_staked: boolean
          staking_apy?: number
          last_updated: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          symbol: string
          market_type: string
          amount: number
          usd_value: number
          price_usd: number
          network: string
          wallet_id: string
          protocol?: string
          is_staked?: boolean
          staking_apy?: number
          last_updated: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          symbol?: string
          market_type?: string
          amount?: number
          usd_value?: number
          price_usd?: number
          network?: string
          wallet_id?: string
          protocol?: string
          is_staked?: boolean
          staking_apy?: number
          last_updated?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      crypto_wallets: {
        Row: {
          id: string
          name: string
          type: string
          address?: string
          network: string
          balance: number
          exchange?: string
          color: string
          icon?: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          address?: string
          network: string
          balance?: number
          exchange?: string
          color?: string
          icon?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          address?: string
          network?: string
          balance?: number
          exchange?: string
          color?: string
          icon?: string
          user_id?: string
          created_at?: string
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
