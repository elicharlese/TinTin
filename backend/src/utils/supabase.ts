import { createClient } from '@supabase/supabase-js'
import { config } from '@/config'
import type { Database } from '@/types/supabase'

/**
 * Supabase client for server-side operations with service role key
 * This client bypasses RLS and has full access to the database
 */
export const supabaseAdmin = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Supabase client for client-side operations with anon key
 * This client respects RLS policies
 */
export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey
)

/**
 * Get a Supabase client with a user's JWT token
 * Used for server-side operations that need to respect RLS
 */
export function getSupabaseUser(accessToken: string) {
  return createClient<Database>(
    config.supabase.url,
    config.supabase.anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  )
}

export * from '@supabase/supabase-js'
