import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Setup test database connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const testSupabase = createClient(supabaseUrl, supabaseKey);

// Global test setup
beforeAll(async () => {
  // Clean up test data before running tests
  await cleanupTestData();
});

afterAll(async () => {
  // Clean up test data after running tests
  await cleanupTestData();
});

async function cleanupTestData() {
  // Clean up test records in reverse dependency order
  const tables = [
    'crypto_assets',
    'portfolio_snapshots',
    'recurring_transactions',
    'budget_categories',
    'budgets',
    'goals',
    'categories',
    'transactions',
    'accounts',
    'user_profiles'
  ];

  for (const table of tables) {
    await testSupabase
      .from(table)
      .delete()
      .like('email', 'test%');
  }
}

// Test utilities
export const testUtils = {
  createTestUser: async (email = 'test@example.com') => {
    const { data, error } = await testSupabase.auth.signUp({
      email,
      password: 'testpassword123',
    });

    if (error) throw error;
    return data.user;
  },

  createTestAccount: async (userId: string, overrides = {}) => {
    const account = {
      user_id: userId,
      name: 'Test Checking',
      type: 'checking',
      balance: 1000.00,
      institution: 'Test Bank',
      ...overrides
    };

    const { data, error } = await testSupabase
      .from('accounts')
      .insert(account)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  createTestTransaction: async (accountId: string, overrides = {}) => {
    const transaction = {
      account_id: accountId,
      amount: -50.00,
      description: 'Test Transaction',
      date: new Date().toISOString().split('T')[0],
      category: 'Food',
      ...overrides
    };

    const { data, error } = await testSupabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  createTestCategory: async (userId: string, overrides = {}) => {
    const category = {
      user_id: userId,
      name: 'Test Category',
      type: 'expense',
      color: '#FF0000',
      ...overrides
    };

    const { data, error } = await testSupabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
