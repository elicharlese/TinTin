import { Request, Response, NextFunction } from 'express'
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible'
import { config } from '../config'
import { logger } from '../utils/logger'

/**
 * Rate limiter configuration
 */
const rateLimiterConfig = {
  keyPrefix: 'tintin_rate_limit',
  points: config.rateLimiting.maxRequests, // Number of requests
  duration: config.rateLimiting.windowMs / 1000, // Per duration in seconds
  blockDuration: config.rateLimiting.windowMs / 1000, // Block for duration in seconds
}

/**
 * Create rate limiter instance
 * Uses Redis if available, otherwise falls back to memory
 */
function createRateLimiter() {
  if (config.redis.url) {
    try {
      // Use Redis for distributed rate limiting
      return new RateLimiterRedis({
        ...rateLimiterConfig,
        storeClient: require('redis').createClient({
          url: config.redis.url,
        }),
      })
    } catch (error) {
      logger.warn('Failed to connect to Redis for rate limiting, falling back to memory')
    }
  }

  // Fallback to memory-based rate limiting
  return new RateLimiterMemory(rateLimiterConfig)
}

const rateLimiter = createRateLimiter()

/**
 * Rate limiting middleware
 */
export async function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Use IP address as the key for rate limiting
    const key = req.ip || 'unknown'
    
    // Check rate limit
    await rateLimiter.consume(key)
    
    // If successful, continue to next middleware
    next()
  } catch (rejRes: any) {
    // Rate limit exceeded
    const remainingPoints = rejRes?.remainingPoints || 0
    const msBeforeNext = rejRes?.msBeforeNext || 0
    const totalHits = rejRes?.totalHits || 0

    // Set rate limit headers
    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': config.rateLimiting.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, remainingPoints).toString(),
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
    })

    // Log rate limit exceeded
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      totalHits,
      remainingPoints,
    })

    // Send rate limit error response
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(msBeforeNext / 1000),
    })
  }
}

/**
 * Create custom rate limiter for specific endpoints
 */
export function createCustomRateLimiter(options: {
  points: number
  duration: number
  blockDuration?: number
}) {
  const customLimiter = new RateLimiterMemory({
    keyPrefix: 'tintin_custom_rate_limit',
    points: options.points,
    duration: options.duration,
    blockDuration: options.blockDuration || options.duration,
  })

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.ip || 'unknown'
      await customLimiter.consume(key)
      next()
    } catch (rejRes: any) {
      const msBeforeNext = rejRes?.msBeforeNext || 0
      
      res.set({
        'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      })

      res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded for this endpoint.',
        retryAfter: Math.round(msBeforeNext / 1000),
      })
    }
  }
}

export { rateLimiterMiddleware as rateLimiter }
export { rateLimiterMiddleware as rateLimitStrict }
