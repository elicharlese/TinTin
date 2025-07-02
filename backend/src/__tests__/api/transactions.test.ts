import request from 'supertest';
import express from 'express';
import { createTransactionRoute } from '../../api/transactions/create';
import { testSupabase, testUtils } from '../setup';

// Mock the supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: testSupabase
}));

describe('POST /api/transactions', () => {
  let app: express.Application;
  let testUser: any;
  let testAccount: any;
  let testCategory: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    
    // Mock auth middleware
    app.use((req, res, next) => {
      (req as any).user = testUser;
      next();
    });

    app.post('/api/transactions', createTransactionRoute);

    // Setup test data
    testUser = await testUtils.createTestUser('transaction-test@example.com');
    testAccount = await testUtils.createTestAccount(testUser.id);
    testCategory = await testUtils.createTestCategory(testUser.id);
  });

  describe('Valid Transaction Creation', () => {
    it('should create a new transaction with valid data', async () => {
      const transactionData = {
        account_id: testAccount.id,
        amount: -75.50,
        description: 'Grocery Shopping',
        date: '2024-01-15',
        category: testCategory.name,
        notes: 'Weekly grocery run'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(transactionData.amount);
      expect(response.body.data.description).toBe(transactionData.description);
      expect(response.body.data.account_id).toBe(testAccount.id);
      expect(response.body.data.category).toBe(testCategory.name);
    });

    it('should create a positive amount transaction (income)', async () => {
      const transactionData = {
        account_id: testAccount.id,
        amount: 2500.00,
        description: 'Salary Payment',
        date: '2024-01-01',
        category: 'Income'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(2500.00);
      expect(response.body.data.description).toBe('Salary Payment');
    });

    it('should handle transaction without notes', async () => {
      const transactionData = {
        account_id: testAccount.id,
        amount: -25.00,
        description: 'Coffee',
        date: '2024-01-15',
        category: 'Food'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBeNull();
    });
  });

  describe('Validation Errors', () => {
    it('should reject transaction with missing required fields', async () => {
      const incompleteData = {
        amount: -50.00,
        description: 'Missing account_id'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should reject transaction with invalid amount', async () => {
      const transactionData = {
        account_id: testAccount.id,
        amount: 'invalid-amount',
        description: 'Invalid Amount Test',
        date: '2024-01-15',
        category: 'Test'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject transaction with invalid date format', async () => {
      const transactionData = {
        account_id: testAccount.id,
        amount: -50.00,
        description: 'Invalid Date Test',
        date: 'not-a-date',
        category: 'Test'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject transaction with empty description', async () => {
      const transactionData = {
        account_id: testAccount.id,
        amount: -50.00,
        description: '',
        date: '2024-01-15',
        category: 'Test'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Authorization Errors', () => {
    it('should reject transaction for account not owned by user', async () => {
      const otherUser = await testUtils.createTestUser('other-user@example.com');
      const otherAccount = await testUtils.createTestAccount(otherUser.id);

      const transactionData = {
        account_id: otherAccount.id,
        amount: -50.00,
        description: 'Unauthorized Transaction',
        date: '2024-01-15',
        category: 'Test'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not authorized');
    });

    it('should reject transaction for non-existent account', async () => {
      const transactionData = {
        account_id: 'non-existent-account-id',
        amount: -50.00,
        description: 'Non-existent Account Test',
        date: '2024-01-15',
        category: 'Test'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Account not found');
    });
  });

  describe('Database Errors', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      const originalInsert = testSupabase.from('transactions').insert;
      testSupabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              error: { message: 'Database connection failed' },
              data: null
            })
          })
        })
      });

      const transactionData = {
        account_id: testAccount.id,
        amount: -50.00,
        description: 'Database Error Test',
        date: '2024-01-15',
        category: 'Test'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('database');
    });
  });
});
