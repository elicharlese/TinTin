import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { config, validateConfig } from '@/config'
import { logger } from '@/utils/logger'
import { errorHandler } from '@/middleware/errorHandler'
import { rateLimiter } from '@/middleware/rateLimiter'
import { authMiddleware } from '@/middleware/auth'

// Import route handlers - using placeholders for now
import {
  authRoutes,
  transactionRoutes,
  accountRoutes,
  categoryRoutes,
  tagRoutes,
  budgetRoutes,
  goalRoutes,
  alertRoutes,
  cryptoRoutes,
  reportRoutes,
  webhookRoutes,
} from '@/api/routes'

/**
 * Initialize and configure Express application
 */
function createApp(): express.Application {
  const app = express()

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }))

  // CORS configuration
  app.use(cors({
    origin: config.security.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }))

  // Compression middleware
  app.use(compression())

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Rate limiting
  app.use(rateLimiter)

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    })
  })

  // API documentation endpoint
  app.get('/api/docs', (req, res) => {
    res.json({
      message: 'TinTin API Documentation',
      version: 'v1',
      endpoints: {
        auth: '/api/auth',
        transactions: '/api/transactions',
        accounts: '/api/accounts',
        categories: '/api/categories',
        tags: '/api/tags',
        budgets: '/api/budgets',
        goals: '/api/goals',
        alerts: '/api/alerts',
        crypto: '/api/crypto',
        reports: '/api/reports',
        webhooks: '/api/webhooks',
      },
    })
  })

  // Public routes (no authentication required)
  if (authRoutes) app.use('/api/auth', authRoutes)
  if (webhookRoutes) app.use('/api/webhooks', webhookRoutes) // Webhooks often need to bypass auth

  // Protected API routes (require authentication)
  app.use('/api', authMiddleware)
  if (transactionRoutes) app.use('/api/transactions', transactionRoutes)
  if (accountRoutes) app.use('/api/accounts', accountRoutes)
  if (categoryRoutes) app.use('/api/categories', categoryRoutes)
  if (tagRoutes) app.use('/api/tags', tagRoutes)
  if (budgetRoutes) app.use('/api/budgets', budgetRoutes)
  if (goalRoutes) app.use('/api/goals', goalRoutes)
  if (alertRoutes) app.use('/api/alerts', alertRoutes)
  if (cryptoRoutes) app.use('/api/crypto', cryptoRoutes)
  if (reportRoutes) app.use('/api/reports', reportRoutes)

  // 404 handler for unknown routes
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`,
    })
  })

  // Global error handler (must be last)
  app.use(errorHandler)

  return app
}

/**
 * Start the server
 */
async function startServer() {
  try {
    // Validate configuration
    validateConfig()
    
    logger.info('Configuration validated successfully')

    // Create Express app
    const app = createApp()

    // Start server
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server started successfully`)
      logger.info(`📡 Environment: ${config.NODE_ENV}`)
      logger.info(`🔗 Server URL: http://localhost:${config.PORT}`)
      logger.info(`📚 API Docs: http://localhost:${config.PORT}/api/docs`)
      logger.info(`❤️  Health Check: http://localhost:${config.PORT}/health`)
    })

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`)
      server.close(() => {
        logger.info('Server closed successfully')
        process.exit(0)
      })

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer()
}

export { createApp, startServer }
