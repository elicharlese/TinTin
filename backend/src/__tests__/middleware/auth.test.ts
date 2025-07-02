import request from 'supertest';
import express from 'express';
import { authMiddleware } from '../../middleware/auth';
import { supabase } from '../../lib/supabase';
import { testSupabase, testUtils } from '../setup';

// Mock the supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: testSupabase
}));

describe('Auth Middleware', () => {
  let app: express.Application;
  let testUser: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    
    // Test route that requires authentication
    app.get('/protected', authMiddleware, (req, res) => {
      res.json({ 
        message: 'Protected route accessed',
        userId: (req as any).user?.id 
      });
    });

    testUser = await testUtils.createTestUser('auth-test@example.com');
  });

  describe('Valid Authentication', () => {
    it('should allow access with valid JWT token', async () => {
      // Create a session for the test user
      const { data: session } = await testSupabase.auth.signInWithPassword({
        email: 'auth-test@example.com',
        password: 'testpassword123'
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${session.session?.access_token}`)
        .expect(200);

      expect(response.body.message).toBe('Protected route accessed');
      expect(response.body.userId).toBe(testUser.id);
    });
  });

  describe('Invalid Authentication', () => {
    it('should reject request without authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.error).toBe('Authorization header required');
    });

    it('should reject request with invalid token format', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidToken')
        .expect(401);

      expect(response.body.error).toBe('Invalid authorization format');
    });

    it('should reject request with expired token', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toBe('Invalid or expired token');
    });

    it('should reject request with malformed JWT', async () => {
      const malformedToken = 'malformed.jwt.token';

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${malformedToken}`)
        .expect(401);

      expect(response.body.error).toBe('Invalid or expired token');
    });
  });

  describe('User Context', () => {
    it('should attach user information to request object', async () => {
      const { data: session } = await testSupabase.auth.signInWithPassword({
        email: 'auth-test@example.com',
        password: 'testpassword123'
      });

      // Create a more detailed test route
      app.get('/user-info', authMiddleware, (req, res) => {
        const user = (req as any).user;
        res.json({
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email
        });
      });

      const response = await request(app)
        .get('/user-info')
        .set('Authorization', `Bearer ${session.session?.access_token}`)
        .expect(200);

      expect(response.body.hasUser).toBe(true);
      expect(response.body.userId).toBe(testUser.id);
      expect(response.body.userEmail).toBe('auth-test@example.com');
    });
  });
});
