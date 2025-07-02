import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth';
import { supabase } from '../../utils/supabase';
import { logger } from '../../utils/logger';

const router = Router();

// Get spending report by category
router.get('/spending/category',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { start_date, end_date, period = 'monthly' } = req.query;

      let startDate: Date;
      let endDate: Date;

      if (start_date && end_date) {
        startDate = new Date(start_date as string);
        endDate = new Date(end_date as string);
      } else {
        // Default to current month
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          categories!inner(id, name, color, icon)
        `)
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .lt('amount', 0); // Only expenses

      if (error) {
        logger.error('Error fetching spending by category:', error);
        return res.status(500).json({ error: 'Failed to fetch spending report' });
      }

      // Group by category
      const categorySpending = transactions.reduce((acc: any, transaction) => {
        const category = transaction.categories?.[0]; // Get first category from array
        const categoryName = category?.name || 'Uncategorized';
        const categoryId = category?.id || 'uncategorized';
        const amount = Math.abs(transaction.amount);

        if (!acc[categoryId]) {
          acc[categoryId] = {
            id: categoryId,
            name: categoryName,
            color: category?.color || '#6B7280',
            icon: category?.icon || 'folder',
            total: 0,
            transaction_count: 0
          };
        }

        acc[categoryId].total += amount;
        acc[categoryId].transaction_count += 1;

        return acc;
      }, {});

      const categories = Object.values(categorySpending).sort((a: any, b: any) => b.total - a.total);
      const totalSpent = categories.reduce((sum: number, cat: any) => sum + cat.total, 0);

      res.json({
        period: { start_date: startDate.toISOString().split('T')[0], end_date: endDate.toISOString().split('T')[0] },
        total_spent: totalSpent,
        categories
      });
    } catch (error) {
      logger.error('Category spending report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get income vs expenses report
router.get('/income-expenses',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { start_date, end_date, period = 'monthly' } = req.query;

      let startDate: Date;
      let endDate: Date;

      if (start_date && end_date) {
        startDate = new Date(start_date as string);
        endDate = new Date(end_date as string);
      } else {
        // Default to current month
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, date')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (error) {
        logger.error('Error fetching income/expenses:', error);
        return res.status(500).json({ error: 'Failed to fetch income/expenses report' });
      }

      const income = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = Math.abs(transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0));

      const netIncome = income - expenses;

      // Group by time period for trend analysis
      const dailyData: { [key: string]: { income: number; expenses: number; date: string } } = {};

      transactions.forEach(transaction => {
        const date = transaction.date;
        if (!dailyData[date]) {
          dailyData[date] = { income: 0, expenses: 0, date };
        }

        if (transaction.amount > 0) {
          dailyData[date].income += transaction.amount;
        } else {
          dailyData[date].expenses += Math.abs(transaction.amount);
        }
      });

      const trend = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

      res.json({
        period: { start_date: startDate.toISOString().split('T')[0], end_date: endDate.toISOString().split('T')[0] },
        summary: {
          total_income: income,
          total_expenses: expenses,
          net_income: netIncome,
          savings_rate: income > 0 ? ((netIncome / income) * 100) : 0
        },
        trend
      });
    } catch (error) {
      logger.error('Income/expenses report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get net worth report
router.get('/net-worth',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      // Get all accounts with current balances
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);

      if (accountsError) {
        logger.error('Error fetching accounts for net worth:', accountsError);
        return res.status(500).json({ error: 'Failed to fetch accounts' });
      }

      // Get crypto assets
      const { data: cryptoAssets, error: cryptoError } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('user_id', userId);

      if (cryptoError) {
        logger.error('Error fetching crypto assets:', cryptoError);
        // Continue without crypto assets
      }

      // Calculate net worth
      const accountBalances = accounts.reduce((acc, account) => {
        acc[account.type] = (acc[account.type] || 0) + account.balance;
        return acc;
      }, {} as { [key: string]: number });

      const totalAssets = accounts
        .filter(a => ['checking', 'savings', 'investment', 'crypto'].includes(a.type))
        .reduce((sum, a) => sum + a.balance, 0);

      const totalLiabilities = accounts
        .filter(a => ['credit_card', 'loan', 'mortgage'].includes(a.type))
        .reduce((sum, a) => sum + Math.abs(a.balance), 0);

      const cryptoValue = cryptoAssets?.reduce((sum, asset) => {
        return sum + (asset.balance * (asset.price_usd || 0));
      }, 0) || 0;

      const netWorth = totalAssets + cryptoValue - totalLiabilities;

      res.json({
        net_worth: netWorth,
        breakdown: {
          assets: {
            cash_and_checking: accountBalances.checking || 0,
            savings: accountBalances.savings || 0,
            investments: accountBalances.investment || 0,
            crypto: cryptoValue
          },
          liabilities: {
            credit_cards: accountBalances.credit_card || 0,
            loans: accountBalances.loan || 0,
            mortgages: accountBalances.mortgage || 0
          }
        },
        total_assets: totalAssets + cryptoValue,
        total_liabilities: totalLiabilities
      });
    } catch (error) {
      logger.error('Net worth report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get budget performance report
router.get('/budget-performance',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      // Get all active budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .eq('user_id', userId);

      if (budgetsError) {
        logger.error('Error fetching budgets:', budgetsError);
        return res.status(500).json({ error: 'Failed to fetch budgets' });
      }

      const budgetPerformance = await Promise.all(budgets.map(async (budget) => {
        // Calculate current period spending
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (budget.period) {
          case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case 'weekly':
            const dayOfWeek = now.getDay();
            startDate = new Date(now);
            startDate.setDate(now.getDate() - dayOfWeek);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            break;
          case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            break;
          default:
            startDate = budget.start_date ? new Date(budget.start_date) : new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = budget.end_date ? new Date(budget.end_date) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        // Get spending for the period
        let query = supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', userId)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .lt('amount', 0); // Only expenses

        if (budget.category_id) {
          query = query.eq('category_id', budget.category_id);
        }

        const { data: transactions } = await query;
        const totalSpent = transactions?.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0) || 0;
        const remaining = budget.amount - totalSpent;
        const percentage = (totalSpent / budget.amount) * 100;

        return {
          budget_id: budget.id,
          name: budget.name,
          category: budget.category,
          amount: budget.amount,
          spent: totalSpent,
          remaining,
          percentage: Math.round(percentage * 100) / 100,
          status: percentage > 100 ? 'over_budget' : percentage > 80 ? 'near_limit' : 'on_track',
          period: budget.period
        };
      }));

      res.json({
        budgets: budgetPerformance,
        summary: {
          total_budgets: budgets.length,
          over_budget: budgetPerformance.filter(b => b.status === 'over_budget').length,
          near_limit: budgetPerformance.filter(b => b.status === 'near_limit').length,
          on_track: budgetPerformance.filter(b => b.status === 'on_track').length
        }
      });
    } catch (error) {
      logger.error('Budget performance report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Export data (CSV format)
router.get('/export',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { type = 'transactions', start_date, end_date } = req.query;

      if (type !== 'transactions') {
        return res.status(400).json({ error: 'Only transaction export is currently supported' });
      }

      let query = supabase
        .from('transactions')
        .select(`
          *,
          account:accounts(name, type),
          category:categories(name)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (start_date) {
        query = query.gte('date', start_date as string);
      }
      if (end_date) {
        query = query.lte('date', end_date as string);
      }

      const { data: transactions, error } = await query;

      if (error) {
        logger.error('Error fetching transactions for export:', error);
        return res.status(500).json({ error: 'Failed to export data' });
      }

      // Convert to CSV
      const headers = ['Date', 'Description', 'Amount', 'Account', 'Category', 'Notes'];
      const csvData = [
        headers.join(','),
        ...transactions.map(t => [
          t.date,
          `"${t.description || ''}"`,
          t.amount,
          `"${t.account?.name || ''}"`,
          `"${t.category?.name || ''}"`,
          `"${t.notes || ''}"`
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);

      logger.info(`Data exported by user ${userId}: ${transactions.length} transactions`);
    } catch (error) {
      logger.error('Export error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export { router as reportRoutes };
