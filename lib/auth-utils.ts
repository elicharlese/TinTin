import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApiError } from './api-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface AuthUser {
  id: string
  email: string
  role?: string
}

export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role,
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

export function requireAuth(user: AuthUser | null): AuthUser {
  if (!user) {
    throw new ApiError('Authentication required', 401, 'UNAUTHORIZED')
  }
  return user
}

export function requireRole(user: AuthUser | null, requiredRole: string): AuthUser {
  const authenticatedUser = requireAuth(user)
  
  if (authenticatedUser.role !== requiredRole) {
    throw new ApiError('Insufficient permissions', 403, 'FORBIDDEN')
  }
  
  return authenticatedUser
}
