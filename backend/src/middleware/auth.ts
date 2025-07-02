import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { supabase } from '../config'
import { config } from '../config'
import { logger } from '../utils/logger'
import type { User } from '../types'

/**
 * Extended Request interface to include user
 */
export interface AuthenticatedRequest extends Request {
  user?: User
  accessToken?: string
}

/**
 * Authentication middleware
 * Verifies JWT token and loads user information
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Access token is required',
      })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      logger.warn('Invalid token provided', {
        error: error?.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      })

      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      })
      return
    }

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      logger.error('Failed to load user profile', {
        userId: user.id,
        error: profileError?.message,
      })

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to load user profile',
      })
      return
    }

    // Attach user to request object
    req.user = {
      id: userProfile.id,
      email: userProfile.email,
      createdAt: new Date(userProfile.created_at),
      updatedAt: new Date(userProfile.updated_at),
    }
    req.accessToken = token

    next()
  } catch (error) {
    logger.error('Authentication error', {
      error: error instanceof Error ? error.message : String(error),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    })

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Authentication failed',
    })
  }
}

/**
 * Optional authentication middleware
 * Loads user if token is present, but doesn't require it
 */
export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next()
      return
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (!error && user) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userProfile) {
        req.user = {
          id: userProfile.id,
          email: userProfile.email,
          createdAt: new Date(userProfile.created_at),
          updatedAt: new Date(userProfile.updated_at),
        }
        req.accessToken = token
      }
    }

    next()
  } catch (error) {
    // Ignore authentication errors for optional auth
    next()
  }
}

/**
 * Admin authentication middleware
 * Requires user to be authenticated and have admin role
 */
export async function adminAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await authMiddleware(req, res, async () => {
    // Check if user has admin role
    // This is a placeholder - implement your admin role logic
    const isAdmin = await checkAdminRole(req.user!.id)

    if (!isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Admin access required',
      })
      return
    }

    next()
  })
}

/**
 * Check if user has admin role
 * This is a placeholder function - implement based on your role system
 */
async function checkAdminRole(userId: string): Promise<boolean> {
  // TODO: Implement admin role checking logic
  // This could check a user_roles table or user metadata
  return false
}

export default authMiddleware
export { authMiddleware as auth }
