import { TransactionService } from '../../services/TransactionService';
import { testSupabase, testUtils } from '../setup';

// Mock the supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: testSupabase
}));

describe('TransactionService', () => {
  let testUser: any;
  let testAccount: any;
  let testCategory: any;
  let transactionService: TransactionService;

  beforeEach(async () => {
    testUser = await testUtils.createTestUser('transaction-service-test@example.com');
    testAccount = await testUtils.createTestAccount(testUser.id);
    testCategory = await testUtils.createTestCategory(testUser.id);
    transactionService = new TransactionService();
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        account_id: testAccount.id,
        amount: -75.50,
        description: 'Grocery Shopping',
        date: '2024-01-15',
        category: testCategory.name,
        notes: 'Weekly grocery run'
      };

      const transaction = await transactionService.createTransaction(transactionData);

      expect(transaction).toBeDefined();
      expect(transaction.amount).toBe(transactionData.amount);
      expect(transaction.description).toBe(transactionData.description);
      expect(transaction.account_id).toBe(testAccount.id);
      expect(transaction.category).toBe(testCategory.name);
      expect(transaction.notes).toBe(transactionData.notes);
    });

    it('should handle transaction without notes', async () => {
      const transactionData = {
        account_id: testAccount.id,
        amount: 200.00,
        description: 'Salary',
        date: '2024-01-01',
        category: 'Income'
      };

      const transaction = await transactionService.createTransaction(transactionData);

      expect(transaction).toBeDefined();
      expect(transaction.notes).toBeNull();
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by id', async () => {
      const testTransaction = await testUtils.createTestTransaction(testAccount.id);

      const transaction = await transactionService.getTransactionById(testTransaction.id);

      expect(transaction).toBeDefined();
      expect(transaction?.id).toBe(testTransaction.id);
      expect(transaction?.account_id).toBe(testAccount.id);
    });

    it('should return null for non-existent transaction', async () => {
      const transaction = await transactionService.getTransactionById('non-existent-id');
      expect(transaction).toBeNull();
    });
  });

  describe('getTransactionsByAccountId', () => {
    it('should return all transactions for an account', async () => {
      const transaction1 = await testUtils.createTestTransaction(testAccount.id, {
        amount: -100.00,
        description: 'Transaction 1'
      });

      const transaction2 = await testUtils.createTestTransaction(testAccount.id, {
        amount: -50.00,
        description: 'Transaction 2'
      });

      const transactions = await transactionService.getTransactionsByAccountId(
        testAccount.id,
        { limit: 10, offset: 0 }
      );

      expect(transactions).toHaveLength(2);
      expect(transactions.find(t => t.id === transaction1.id)).toBeDefined();
      expect(transactions.find(t => t.id === transaction2.id)).toBeDefined();
    });

    it('should respect pagination parameters', async () => {
      // Create multiple transactions
      for (let i = 0; i < 5; i++) {
        await testUtils.createTestTransaction(testAccount.id, {
          amount: -10.00 * (i + 1),
          description: `Transaction ${i + 1}`
        });
      }

      const firstPage = await transactionService.getTransactionsByAccountId(
        testAccount.id,
        { limit: 2, offset: 0 }
      );

      const secondPage = await transactionService.getTransactionsByAccountId(
        testAccount.id,
        { limit: 2, offset: 2 }
      );

      expect(firstPage).toHaveLength(2);
      expect(secondPage).toHaveLength(2);
      expect(firstPage[0].id).not.toBe(secondPage[0].id);
    });
  });

  describe('updateTransaction', () => {
    it('should update an existing transaction', async () => {
      const testTransaction = await testUtils.createTestTransaction(testAccount.id);

      const updateData = {
        amount: -125.00,
        description: 'Updated Description',
        notes: 'Updated notes'
      };

      const updatedTransaction = await transactionService.updateTransaction(
        testTransaction.id,
        updateData
      );

      expect(updatedTransaction).toBeDefined();
      expect(updatedTransaction?.amount).toBe(updateData.amount);
      expect(updatedTransaction?.description).toBe(updateData.description);
      expect(updatedTransaction?.notes).toBe(updateData.notes);
    });

    it('should return null for non-existent transaction', async () => {
      const updateData = { amount: -100.00 };

      const result = await transactionService.updateTransaction(
        'non-existent-id',
        updateData
      );

      expect(result).toBeNull();
    });
  });

  describe('deleteTransaction', () => {
    it('should delete an existing transaction', async () => {
      const testTransaction = await testUtils.createTestTransaction(testAccount.id);

      const success = await transactionService.deleteTransaction(testTransaction.id);

      expect(success).toBe(true);

      // Verify transaction is deleted
      const deletedTransaction = await transactionService.getTransactionById(testTransaction.id);
      expect(deletedTransaction).toBeNull();
    });

    it('should return false for non-existent transaction', async () => {
      const success = await transactionService.deleteTransaction('non-existent-id');
      expect(success).toBe(false);
    });
  });

  describe('getTransactionStats', () => {
    it('should calculate transaction statistics', async () => {
      await testUtils.createTestTransaction(testAccount.id, {
        amount: -100.00,
        description: 'Expense 1'
      });

      await testUtils.createTestTransaction(testAccount.id, {
        amount: -50.00,
        description: 'Expense 2'
      });

      await testUtils.createTestTransaction(testAccount.id, {
        amount: 200.00,
        description: 'Income 1'
      });

      const stats = await transactionService.getTransactionStats(testAccount.id);

      expect(stats).toBeDefined();
      expect(stats.totalIncome).toBe(200.00);
      expect(stats.totalExpenses).toBe(-150.00);
      expect(stats.transactionCount).toBe(3);
      expect(stats.averageTransaction).toBe(16.67); // (200 - 150) / 3
    });

    it('should return zero stats for account with no transactions', async () => {
      const stats = await transactionService.getTransactionStats(testAccount.id);

      expect(stats).toBeDefined();
      expect(stats.totalIncome).toBe(0);
      expect(stats.totalExpenses).toBe(0);
      expect(stats.transactionCount).toBe(0);
      expect(stats.averageTransaction).toBe(0);
    });
  });

  describe('searchTransactions', () => {
    beforeEach(async () => {
      await testUtils.createTestTransaction(testAccount.id, {
        description: 'Grocery Store Purchase',
        category: 'Food',
        amount: -85.50
      });

      await testUtils.createTestTransaction(testAccount.id, {
        description: 'Gas Station Fill-up',
        category: 'Transportation',
        amount: -45.00
      });

      await testUtils.createTestTransaction(testAccount.id, {
        description: 'Salary Payment',
        category: 'Income',
        amount: 2500.00
      });
    });

    it('should search transactions by description', async () => {
      const results = await transactionService.searchTransactions(testAccount.id, {
        query: 'Grocery',
        limit: 10,
        offset: 0
      });

      expect(results).toHaveLength(1);
      expect(results[0].description).toContain('Grocery');
    });

    it('should search transactions by category', async () => {
      const results = await transactionService.searchTransactions(testAccount.id, {
        category: 'Food',
        limit: 10,
        offset: 0
      });

      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('Food');
    });

    it('should filter transactions by amount range', async () => {
      const results = await transactionService.searchTransactions(testAccount.id, {
        minAmount: 0,
        maxAmount: 1000,
        limit: 10,
        offset: 0
      });

      expect(results).toHaveLength(0); // Only expenses are in negative range
    });

    it('should filter transactions by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const results = await transactionService.searchTransactions(testAccount.id, {
        startDate: today,
        endDate: today,
        limit: 10,
        offset: 0
      });

      expect(results).toHaveLength(3); // All transactions created today
    });
  });
});
