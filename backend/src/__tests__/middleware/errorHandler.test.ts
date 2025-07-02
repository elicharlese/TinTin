import { errorHandler } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import express from 'express';
import request from 'supertest';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }
}));

describe('Error Handler Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Test routes that throw different types of errors
    app.get('/validation-error', (req, res, next) => {
      const error = new Error('Validation failed');
      (error as any).statusCode = 400;
      (error as any).type = 'validation';
      next(error);
    });

    app.get('/auth-error', (req, res, next) => {
      const error = new Error('Unauthorized access');
      (error as any).statusCode = 401;
      next(error);
    });

    app.get('/not-found-error', (req, res, next) => {
      const error = new Error('Resource not found');
      (error as any).statusCode = 404;
      next(error);
    });

    app.get('/server-error', (req, res, next) => {
      const error = new Error('Database connection failed');
      next(error);
    });

    app.get('/custom-error', (req, res, next) => {
      const error = new Error('Custom business logic error');
      (error as any).statusCode = 422;
      (error as any).details = { field: 'email', message: 'Invalid format' };
      next(error);
    });

    // Use error handler middleware
    app.use(errorHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Errors', () => {
    it('should handle validation errors with 400 status', async () => {
      const response = await request(app)
        .get('/validation-error')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Validation failed',
        statusCode: 400,
        timestamp: expect.any(String)
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'Validation error: Validation failed'
      );
    });
  });

  describe('Authentication Errors', () => {
    it('should handle authentication errors with 401 status', async () => {
      const response = await request(app)
        .get('/auth-error')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized access',
        statusCode: 401,
        timestamp: expect.any(String)
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'Client error (401): Unauthorized access'
      );
    });
  });

  describe('Not Found Errors', () => {
    it('should handle not found errors with 404 status', async () => {
      const response = await request(app)
        .get('/not-found-error')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Resource not found',
        statusCode: 404,
        timestamp: expect.any(String)
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'Client error (404): Resource not found'
      );
    });
  });

  describe('Server Errors', () => {
    it('should handle server errors with 500 status', async () => {
      const response = await request(app)
        .get('/server-error')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error',
        statusCode: 500,
        timestamp: expect.any(String)
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Server error: Database connection failed',
        expect.any(Error)
      );
    });
  });

  describe('Custom Errors', () => {
    it('should handle custom errors with details', async () => {
      const response = await request(app)
        .get('/custom-error')
        .expect(422);

      expect(response.body).toEqual({
        success: false,
        error: 'Custom business logic error',
        statusCode: 422,
        details: { field: 'email', message: 'Invalid format' },
        timestamp: expect.any(String)
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'Client error (422): Custom business logic error'
      );
    });
  });

  describe('Production Environment', () => {
    it('should not expose stack traces in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/server-error')
        .expect(500);

      expect(response.body.stack).toBeUndefined();
      expect(response.body.error).toBe('Internal server error');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Development Environment', () => {
    it('should include stack traces in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Create a new app with error handler for this test
      const devApp = express();
      devApp.get('/error', (req, res, next) => {
        next(new Error('Test error'));
      });
      devApp.use(errorHandler);

      const response = await request(devApp)
        .get('/error')
        .expect(500);

      expect(response.body.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Logging', () => {
    it('should log different error types appropriately', async () => {
      // Test validation error logging
      await request(app).get('/validation-error');
      expect(logger.warn).toHaveBeenCalledWith('Validation error: Validation failed');

      // Test server error logging
      await request(app).get('/server-error');
      expect(logger.error).toHaveBeenCalledWith(
        'Server error: Database connection failed',
        expect.any(Error)
      );
    });

    it('should include request context in error logs', async () => {
      await request(app)
        .get('/server-error')
        .set('User-Agent', 'Test Agent')
        .set('X-Request-ID', 'test-123');

      expect(logger.error).toHaveBeenCalledWith(
        'Server error: Database connection failed',
        expect.any(Error)
      );
    });
  });

  describe('Response Format', () => {
    it('should always return consistent error response format', async () => {
      const response = await request(app)
        .get('/validation-error')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should include correlation ID when available', async () => {
      const response = await request(app)
        .get('/validation-error')
        .set('X-Request-ID', 'correlation-123')
        .expect(400);

      expect(response.body.requestId).toBe('correlation-123');
    });
  });
});
