import { supabase } from '../config';
import { logger } from '../utils/logger';
import { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionRequest, 
  TransactionFilters,
  TransactionSummary,
  PaginatedResponse
} from '../types';

export class TransactionService {
  /**
   * Get transactions with filtering and pagination
   */
  async getTransactions(
    userId: string, 
    filters: TransactionFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<Transaction>> {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('transactions')
        .select(`
          *,
          account:accounts!inner(id, name, type),
          category:categories(id, name, color),
          tags:transaction_tags(tag:tags(id, name, color))
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
      if (filters.accountId) query = query.eq('account_id', filters.accountId);
      if (filters.startDate) query = query.gte('date', filters.startDate);
      if (filters.endDate) query = query.lte('date', filters.endDate);
      if (filters.minAmount) query = query.gte('amount', filters.minAmount);
      if (filters.maxAmount) query = query.lte('amount', filters.maxAmount);
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,merchant.ilike.%${filters.search}%`);
      }

      const { data: transactions, error, count } = await query;

      if (error) {
        logger.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
      }

      // Get total count
      const { count: totalCount, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) {
        logger.error('Error counting transactions:', countError);
      }

      return {
        success: true,
        data: transactions || [],
        meta: {
          page,
          limit,
          total: totalCount || 0,
          hasMore: page * limit < (totalCount || 0)
        }
      };
    } catch (error) {
      logger.error('Error in getTransactions:', error);
      throw error;
    }
  }

  /**
   * Get single transaction by ID
   */
  async getTransactionById(userId: string, transactionId: string): Promise<Transaction | null> {
    try {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select(`
          *,
          account:accounts!inner(id, name, type),
          category:categories(id, name, color),
          tags:transaction_tags(tag:tags(id, name, color))
        `)
        .eq('id', transactionId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Error fetching transaction:', error);
        throw new Error('Failed to fetch transaction');
      }

      return transaction;
    } catch (error) {
      logger.error('Error in getTransactionById:', error);
      throw error;
    }
  }

  /**
   * Create new transaction
   */
  async createTransaction(userId: string, data: CreateTransactionRequest): Promise<Transaction> {
    try {
      // Verify account belongs to user
      await this.verifyAccountOwnership(userId, data.account_id);

      // Verify category belongs to user (if provided)
      if (data.category_id) {
        await this.verifyCategoryOwnership(userId, data.category_id);
      }

      const transactionData = {
        ...data,
        user_id: userId,
      };

      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select(`
          *,
          account:accounts!inner(id, name, type),
          category:categories(id, name, color)
        `)
        .single();

      if (error) {
        logger.error('Error creating transaction:', error);
        throw new Error('Failed to create transaction');
      }

      // Handle tags if provided
      if (data.tag_ids && data.tag_ids.length > 0) {
        await this.associateTags(transaction.id, data.tag_ids);
      }

      logger.info(`Transaction created: ${transaction.id} for user: ${userId}`);
      return transaction;
    } catch (error) {
      logger.error('Error in createTransaction:', error);
      throw error;
    }
  }

  /**
   * Update transaction
   */
  async updateTransaction(
    userId: string, 
    transactionId: string, 
    data: UpdateTransactionRequest
  ): Promise<Transaction> {
    try {
      // Verify transaction belongs to user
      const existingTransaction = await this.getTransactionById(userId, transactionId);
      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      // Verify account belongs to user (if being updated)
      if (data.account_id) {
        await this.verifyAccountOwnership(userId, data.account_id);
      }

      // Verify category belongs to user (if being updated)
      if (data.category_id) {
        await this.verifyCategoryOwnership(userId, data.category_id);
      }

      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: transaction, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId)
        .eq('user_id', userId)
        .select(`
          *,
          account:accounts!inner(id, name, type),
          category:categories(id, name, color)
        `)
        .single();

      if (error) {
        logger.error('Error updating transaction:', error);
        throw new Error('Failed to update transaction');
      }

      logger.info(`Transaction updated: ${transaction.id} for user: ${userId}`);
      return transaction;
    } catch (error) {
      logger.error('Error in updateTransaction:', error);
      throw error;
    }
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', userId);

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Transaction not found');
        }
        logger.error('Error deleting transaction:', error);
        throw new Error('Failed to delete transaction');
      }

      logger.info(`Transaction deleted: ${transactionId} for user: ${userId}`);
    } catch (error) {
      logger.error('Error in deleteTransaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction summary statistics
   */
  async getTransactionSummary(
    userId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<TransactionSummary> {
    try {
      let query = supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId);

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data: transactions, error } = await query;

      if (error) {
        logger.error('Error fetching transaction summary:', error);
        throw new Error('Failed to fetch transaction summary');
      }

      const summary = transactions.reduce(
        (acc, transaction) => {
          const amount = Math.abs(transaction.amount);
          acc.total += amount;
          
          if (transaction.type === 'income') {
            acc.income += amount;
          } else if (transaction.type === 'expense') {
            acc.expenses += amount;
          }
          
          acc.count++;
          return acc;
        },
        { total: 0, income: 0, expenses: 0, count: 0, net: 0 }
      );

      summary.net = summary.income - summary.expenses;

      return {
        totalIncome: summary.income,
        totalExpenses: summary.expenses,
        netIncome: summary.net,
        transactionCount: summary.count,
        averageTransaction: summary.count > 0 ? summary.total / summary.count : 0,
        categoryBreakdown: []
      };
    } catch (error) {
      logger.error('Error in getTransactionSummary:', error);
      throw error;
    }
  }

  /**
   * Get transactions grouped by category
   */
  async getTransactionsByCategory(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Array<{ category: string; amount: number; count: number }>> {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          amount,
          type,
          category:categories(name)
        `)
        .eq('user_id', userId);

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data: transactions, error } = await query;

      if (error) {
        logger.error('Error fetching transactions by category:', error);
        throw new Error('Failed to fetch transactions by category');
      }

      // Group by category
      const categoryMap = new Map();
      
      transactions.forEach(transaction => {
        const category = transaction.category?.[0]; // Get first category from array
        const categoryName = category?.name || 'Uncategorized';
        const amount = Math.abs(transaction.amount);
        
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, { amount: 0, count: 0 });
        }
        
        const categoryData = categoryMap.get(categoryName);
        categoryData.amount += amount;
        categoryData.count++;
      });

      return Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count
      }));
    } catch (error) {
      logger.error('Error in getTransactionsByCategory:', error);
      throw error;
    }
  }

  /**
   * Import transactions in bulk
   */
  async importTransactions(userId: string, transactions: CreateTransactionRequest[]): Promise<Transaction[]> {
    try {
      // Validate all transactions first
      for (const transaction of transactions) {
        await this.verifyAccountOwnership(userId, transaction.account_id);
        if (transaction.category_id) {
          await this.verifyCategoryOwnership(userId, transaction.category_id);
        }
      }

      const transactionData = transactions.map(transaction => ({
        ...transaction,
        user_id: userId
      }));

      const { data: createdTransactions, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select(`
          *,
          account:accounts!inner(id, name, type),
          category:categories(id, name, color)
        `);

      if (error) {
        logger.error('Error importing transactions:', error);
        throw new Error('Failed to import transactions');
      }

      logger.info(`Imported ${createdTransactions.length} transactions for user: ${userId}`);
      return createdTransactions;
    } catch (error) {
      logger.error('Error in importTransactions:', error);
      throw error;
    }
  }

  // Private helper methods
  private async verifyAccountOwnership(userId: string, accountId: string): Promise<void> {
    const { data: account, error } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (error || !account) {
      throw new Error('Invalid account ID');
    }
  }

  private async verifyCategoryOwnership(userId: string, categoryId: string): Promise<void> {
    const { data: category, error } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('user_id', userId)
      .single();

    if (error || !category) {
      throw new Error('Invalid category ID');
    }
  }

  private async associateTags(transactionId: string, tagIds: string[]): Promise<void> {
    const tagAssociations = tagIds.map(tagId => ({
      transaction_id: transactionId,
      tag_id: tagId,
    }));

    const { error } = await supabase
      .from('transaction_tags')
      .insert(tagAssociations);

    if (error) {
      logger.error('Error associating tags:', error);
      // Don't throw error for tag association failures
    }
  }
}

export const transactionService = new TransactionService();
