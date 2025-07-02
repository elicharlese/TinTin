import winston from 'winston'
import { config } from '../config'

/**
 * Winston logger configuration
 * Provides structured logging with different levels and formats
 */
const loggerConfig = {
  level: config.monitoring.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
      })
    })
  ),
  defaultMeta: {
    service: 'tintin-backend',
    environment: config.NODE_ENV,
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
}

// Add file transport for production
if (config.NODE_ENV === 'production') {
  (loggerConfig.transports as winston.transport[]).push(
    ...[
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    ]
  )
}

export const logger = winston.createLogger(loggerConfig)

/**
 * Create a child logger with additional context
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context)
}

/**
 * Log HTTP requests
 */
export function logRequest(req: any, res: any, responseTime: number) {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
  })
}

export default logger
