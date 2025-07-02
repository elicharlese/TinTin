import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * Application configuration object
 * Contains all environment variables and their default values
 */
export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    storageBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'transactions',
  },
  
  // Database
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  // Authentication & Security
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    nextAuthSecret: process.env.NEXTAUTH_SECRET!,
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    encryptionKey: process.env.ENCRYPTION_KEY!,
  },
  
  // Solana Configuration
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    network: process.env.SOLANA_NETWORK || 'mainnet-beta',
    cluster: process.env.SOLANA_CLUSTER || 'mainnet-beta',
    privateKey: process.env.SOLANA_PRIVATE_KEY,
    programId: process.env.SOLANA_PROGRAM_ID,
  },
  
  // External APIs
  apis: {
    coingecko: {
      apiKey: process.env.COINGECKO_API_KEY,
      baseUrl: 'https://api.coingecko.com/api/v3',
    },
    alchemy: {
      apiKey: process.env.ALCHEMY_API_KEY,
    },
    plaid: {
      clientId: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      env: process.env.PLAID_ENV || 'sandbox',
      webhookUrl: process.env.PLAID_WEBHOOK_URL,
    },
  },
  
  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  
  // Monitoring & Analytics
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    vercelAnalyticsId: process.env.VERCEL_ANALYTICS_ID,
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  
  // Redis & Caching
  redis: {
    url: process.env.REDIS_URL,
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  
  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    webhookSecret: process.env.WEBHOOK_SECRET,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
  
  // Feature Flags
  features: {
    enableBlockchainFeatures: process.env.ENABLE_BLOCKCHAIN_FEATURES === 'true',
    enablePlaidIntegration: process.env.ENABLE_PLAID_INTEGRATION === 'true',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
    enableRealTimeUpdates: process.env.ENABLE_REAL_TIME_UPDATES === 'true',
  },
  
  // Rate Limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
  },
}

/**
 * Validates that all required environment variables are set
 */
export function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
    'ENCRYPTION_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Export supabase client
export { supabase } from './supabase'

export default config
