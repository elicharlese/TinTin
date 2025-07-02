import { createClient } from '@supabase/supabase-js'
import { config } from './index'

/**
 * Supabase client instance
 * Uses service role key for server-side operations
 */
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export default supabase
