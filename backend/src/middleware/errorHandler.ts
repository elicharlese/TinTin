import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import type { AppError } from '@/types'

/**
 * Global error handling middleware
 * Catches all errors and returns standardized error responses
 */
export function errorHandler(
  error: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  })

  // Default error values
  let statusCode = 500
  let message = 'Internal Server Error'
  let isOperational = false

  // Check if it's an operational error
  if ('statusCode' in error && 'isOperational' in error) {
    statusCode = error.statusCode
    message = error.message
    isOperational = error.isOperational
  } else if (error.name === 'ValidationError') {
    statusCode = 400
    message = error.message
    isOperational = true
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Unauthorized'
    isOperational = true
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
    isOperational = true
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
    isOperational = true
  }

  // Don't expose internal errors in production
  if (!isOperational && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong'
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error,
    }),
  })
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  })
}
