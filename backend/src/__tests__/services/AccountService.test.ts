import { Request, Response } from 'express';
import { supabase } from '../../lib/supabase';
import { AccountService } from '../../services/AccountService';
import { testSupabase, testUtils } from '../setup';

// Mock the supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: testSupabase
}));

describe('AccountService', () => {
  let testUser: any;
  let accountService: AccountService;

  beforeEach(async () => {
    testUser = await testUtils.createTestUser('accounts-test@example.com');
    accountService = new AccountService();
  });

  describe('getAllAccounts', () => {
    it('should return all accounts for a user', async () => {
      // Create test accounts
      const account1 = await testUtils.createTestAccount(testUser.id, {
        name: 'Checking Account',
        type: 'checking',
        balance: 1500.00
      });

      const account2 = await testUtils.createTestAccount(testUser.id, {
        name: 'Savings Account',
        type: 'savings',
        balance: 5000.00
      });

      const accounts = await accountService.getAllAccounts(testUser.id);

      expect(accounts).toHaveLength(2);
      expect(accounts.find(a => a.id === account1.id)).toBeDefined();
      expect(accounts.find(a => a.id === account2.id)).toBeDefined();
    });

    it('should return empty array for user with no accounts', async () => {
      const accounts = await accountService.getAllAccounts(testUser.id);
      expect(accounts).toHaveLength(0);
    });
  });

  describe('getAccountById', () => {
    it('should return account by id if user owns it', async () => {
      const testAccount = await testUtils.createTestAccount(testUser.id);

      const account = await accountService.getAccountById(testAccount.id, testUser.id);

      expect(account).toBeDefined();
      expect(account?.id).toBe(testAccount.id);
      expect(account?.name).toBe(testAccount.name);
    });

    it('should return null if account does not exist', async () => {
      const account = await accountService.getAccountById('non-existent-id', testUser.id);
      expect(account).toBeNull();
    });

    it('should return null if user does not own the account', async () => {
      const otherUser = await testUtils.createTestUser('other-user@example.com');
      const testAccount = await testUtils.createTestAccount(otherUser.id);

      const account = await accountService.getAccountById(testAccount.id, testUser.id);
      expect(account).toBeNull();
    });
  });

  describe('createAccount', () => {
    it('should create a new account', async () => {
      const accountData = {
        name: 'New Checking Account',
        type: 'checking' as const,
        balance: 2000.00,
        institution: 'Test Bank'
      };

      const account = await accountService.createAccount(testUser.id, accountData);

      expect(account).toBeDefined();
      expect(account.name).toBe(accountData.name);
      expect(account.type).toBe(accountData.type);
      expect(account.balance).toBe(accountData.balance);
      expect(account.institution).toBe(accountData.institution);
      expect(account.user_id).toBe(testUser.id);
    });

    it('should throw error if required fields are missing', async () => {
      const accountData = {
        name: '',
        type: 'checking' as const,
        balance: 0,
        institution: ''
      };

      await expect(accountService.createAccount(testUser.id, accountData))
        .rejects.toThrow();
    });
  });

  describe('updateAccount', () => {
    it('should update an existing account', async () => {
      const testAccount = await testUtils.createTestAccount(testUser.id);

      const updateData = {
        name: 'Updated Account Name',
        balance: 3000.00
      };

      const updatedAccount = await accountService.updateAccount(
        testAccount.id,
        testUser.id,
        updateData
      );

      expect(updatedAccount).toBeDefined();
      expect(updatedAccount?.name).toBe(updateData.name);
      expect(updatedAccount?.balance).toBe(updateData.balance);
    });

    it('should return null if account does not exist', async () => {
      const updateData = { name: 'Updated Name' };

      const result = await accountService.updateAccount(
        'non-existent-id',
        testUser.id,
        updateData
      );

      expect(result).toBeNull();
    });

    it('should return null if user does not own the account', async () => {
      const otherUser = await testUtils.createTestUser('other-user-2@example.com');
      const testAccount = await testUtils.createTestAccount(otherUser.id);

      const updateData = { name: 'Updated Name' };

      const result = await accountService.updateAccount(
        testAccount.id,
        testUser.id,
        updateData
      );

      expect(result).toBeNull();
    });
  });

  describe('deleteAccount', () => {
    it('should delete an account', async () => {
      const testAccount = await testUtils.createTestAccount(testUser.id);

      const success = await accountService.deleteAccount(testAccount.id, testUser.id);

      expect(success).toBe(true);

      // Verify account is deleted
      const deletedAccount = await accountService.getAccountById(testAccount.id, testUser.id);
      expect(deletedAccount).toBeNull();
    });

    it('should return false if account does not exist', async () => {
      const success = await accountService.deleteAccount('non-existent-id', testUser.id);
      expect(success).toBe(false);
    });

    it('should return false if user does not own the account', async () => {
      const otherUser = await testUtils.createTestUser('other-user-3@example.com');
      const testAccount = await testUtils.createTestAccount(otherUser.id);

      const success = await accountService.deleteAccount(testAccount.id, testUser.id);
      expect(success).toBe(false);
    });
  });

  describe('getAccountSummary', () => {
    it('should return account summary with transaction totals', async () => {
      const testAccount = await testUtils.createTestAccount(testUser.id, {
        balance: 1000.00
      });

      // Create some test transactions
      await testUtils.createTestTransaction(testAccount.id, {
        amount: -100.00,
        description: 'Expense 1'
      });

      await testUtils.createTestTransaction(testAccount.id, {
        amount: 200.00,
        description: 'Income 1'
      });

      await testUtils.createTestTransaction(testAccount.id, {
        amount: -50.00,
        description: 'Expense 2'
      });

      const summary = await accountService.getAccountSummary(testAccount.id, testUser.id);

      expect(summary).toBeDefined();
      expect(summary?.account.id).toBe(testAccount.id);
      expect(summary?.totalIncome).toBe(200.00);
      expect(summary?.totalExpenses).toBe(-150.00);
      expect(summary?.transactionCount).toBe(3);
    });

    it('should return null if account does not exist', async () => {
      const summary = await accountService.getAccountSummary('non-existent-id', testUser.id);
      expect(summary).toBeNull();
    });
  });
});
