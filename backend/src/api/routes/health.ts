import { Router, Request, Response } from 'express';
import { supabase } from '../../config';
import { logger } from '../../utils/logger';
import { solanaService } from '../../services/solana.service';

interface ServiceStatus {
  status: string
  responseTime: number
  error?: string
  cluster?: string
  version?: string
}

interface HealthStatus {
  status: string
  timestamp: string
  uptime: number
  environment: string
  version: string
  services: {
    database: ServiceStatus
    solana: ServiceStatus
  }
  memory: {
    used: number
    total: number
    rss: number
    percentage: number
  }
  cpu: {
    usage: number
    loadAverage?: any
  }
  responseTime?: number
}

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check including database and external services
 * @access  Public
 */
router.get('/detailed', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  const healthStatus: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: { status: 'unknown', responseTime: 0 },
      solana: { status: 'unknown', responseTime: 0 },
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
    },
    cpu: {
      usage: process.cpuUsage().user / 1000000, // Convert to seconds
      loadAverage: process.platform === 'linux' ? require('os').loadavg() : null,
    }
  };

  // Check database connection
  try {
    const dbStart = Date.now();
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const dbResponseTime = Date.now() - dbStart;
    
    if (error) {
      healthStatus.services.database = { 
        status: 'error', 
        responseTime: dbResponseTime, 
        error: error.message 
      };
      healthStatus.status = 'degraded';
    } else {
      healthStatus.services.database = { 
        status: 'ok', 
        responseTime: dbResponseTime 
      };
    }
  } catch (error) {
    healthStatus.services.database = { 
      status: 'error', 
      responseTime: 0, 
      error: 'Connection failed' 
    };
    healthStatus.status = 'degraded';
    logger.error('Database health check failed:', error);
  }

  // Check Solana connection
  try {
    const solanaStart = Date.now();
    const isConnected = await solanaService.verifyConnection();
    const solanaResponseTime = Date.now() - solanaStart;
    
    if (isConnected) {
      const connectionStatus = solanaService.getConnectionStatus();
      healthStatus.services.solana = { 
        status: 'ok', 
        responseTime: solanaResponseTime,
        cluster: connectionStatus.cluster,
        version: connectionStatus.version
      };
    } else {
      healthStatus.services.solana = { 
        status: 'error', 
        responseTime: solanaResponseTime, 
        error: 'Connection failed' 
      };
      healthStatus.status = 'degraded';
    }
  } catch (error) {
    healthStatus.services.solana = { 
      status: 'error', 
      responseTime: 0, 
      error: 'Service unavailable' 
    };
    healthStatus.status = 'degraded';
    logger.error('Solana health check failed:', error);
  }

  const totalResponseTime = Date.now() - startTime;
  healthStatus.responseTime = totalResponseTime;

  // Set appropriate status code
  const statusCode = healthStatus.status === 'ok' ? 200 : 503;
  
  res.status(statusCode).json(healthStatus);
});

/**
 * @route   GET /api/health/database
 * @desc    Database-specific health check
 * @access  Public
 */
router.get('/database', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      logger.error('Database health check failed:', error);
      return res.status(503).json({
        status: 'error',
        service: 'database',
        responseTime,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'ok',
      service: 'database',
      responseTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Database health check exception:', error);
    res.status(503).json({
      status: 'error',
      service: 'database',
      error: 'Connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/health/solana
 * @desc    Solana-specific health check
 * @access  Public
 */
router.get('/solana', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    const isConnected = await solanaService.verifyConnection();
    const connectionStatus = solanaService.getConnectionStatus();
    const currentSlot = await solanaService.getCurrentSlot();
    
    const responseTime = Date.now() - startTime;
    
    if (!isConnected) {
      return res.status(503).json({
        status: 'error',
        service: 'solana',
        responseTime,
        error: 'Connection failed',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'ok',
      service: 'solana',
      responseTime,
      cluster: connectionStatus.cluster,
      version: connectionStatus.version,
      currentSlot,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Solana health check exception:', error);
    res.status(503).json({
      status: 'error',
      service: 'solana',
      error: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/health/readiness
 * @desc    Kubernetes readiness probe
 * @access  Public
 */
router.get('/readiness', async (req: Request, res: Response) => {
  try {
    // Check essential services for readiness
    const checks = await Promise.allSettled([
      // Database check
      supabase.from('users').select('id').limit(1),
      // Solana check
      solanaService.verifyConnection()
    ]);

    const dbResult = checks[0];
    const solanaResult = checks[1];

    const isReady = dbResult.status === 'fulfilled' && 
                    dbResult.value && !dbResult.value.error &&
                    solanaResult.status === 'fulfilled' && 
                    solanaResult.value === true;

    if (isReady) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbResult.status === 'fulfilled' && !dbResult.value.error,
          solana: solanaResult.status === 'fulfilled' && solanaResult.value === true
        }
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not_ready',
      error: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/health/liveness
 * @desc    Kubernetes liveness probe
 * @access  Public
 */
router.get('/liveness', (req: Request, res: Response) => {
  // Basic liveness check - if the server is responding, it's alive
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export { router as healthRoutes };
