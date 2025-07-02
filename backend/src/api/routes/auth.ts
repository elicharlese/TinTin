import { Router } from 'express'
import { supabase } from '@/utils/supabase'
import { logger } from '@/utils/logger'
import { asyncHandler } from '@/middleware/errorHandler'
import type { AuthenticatedRequest } from '@/middleware/auth'

const router = Router()

/**
 * Sign up new user
 */
router.post('/signup', asyncHandler(async (req: any, res: any) => {
  const { email, password, firstName, lastName } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    })
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName,
        lastName,
      },
    },
  })

  if (error) {
    logger.error('Signup error', { error: error.message, email })
    return res.status(400).json({
      success: false,
      error: error.message,
    })
  }

  res.json({
    success: true,
    data: {
      user: data.user,
      session: data.session,
    },
  })
}))

/**
 * Sign in user
 */
router.post('/signin', asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    })
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    logger.error('Signin error', { error: error.message, email })
    return res.status(401).json({
      success: false,
      error: error.message,
    })
  }

  res.json({
    success: true,
    data: {
      user: data.user,
      session: data.session,
    },
  })
}))

/**
 * Sign out user
 */
router.post('/signout', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.substring(7)

  if (token) {
    const { error } = await supabase.auth.signOut()
    if (error) {
      logger.error('Signout error', { error: error.message })
    }
  }

  res.json({
    success: true,
    message: 'Signed out successfully',
  })
}))

/**
 * Refresh token
 */
router.post('/refresh', asyncHandler(async (req: any, res: any) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required',
    })
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  })

  if (error) {
    logger.error('Token refresh error', { error: error.message })
    return res.status(401).json({
      success: false,
      error: error.message,
    })
  }

  res.json({
    success: true,
    data: {
      session: data.session,
    },
  })
}))

export { router as authRoutes }
