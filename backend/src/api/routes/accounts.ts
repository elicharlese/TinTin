import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { supabase } from '../../config';
import { logger } from '../../utils/logger';
import { AuthenticatedRequest, auth } from '../../middleware/auth';
import { rateLimitStrict } from '../../middleware/rateLimiter';

const router = Router();

// Apply authentication and rate limiting to all routes
router.use(auth);
router.use(rateLimitStrict);

/**
 * @route   GET /api/accounts
 * @desc    Get all accounts for the authenticated user
 * @access  Private
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select(`
        *,
        transactions:transactions(amount, type)
      `)
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching accounts:', error);
      return res.status(500).json({ error: 'Failed to fetch accounts' });
    }

    // Calculate balances and transaction counts
    const accountsWithBalances = accounts.map(account => {
      const transactions = account.transactions || [];
      const balance = transactions.reduce((sum: number, transaction: any) => {
        return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
      }, account.initial_balance || 0);

      const transactionCount = transactions.length;

      return {
        ...account,
        current_balance: balance,
        transaction_count: transactionCount,
        transactions: undefined // Remove transactions from response
      };
    });

    res.json(accountsWithBalances);
  } catch (error) {
    logger.error('Error in GET /accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/accounts/:id
 * @desc    Get single account by ID
 * @access  Private
 */
router.get('/:id', [
  param('id').isUUID().withMessage('Account ID must be a valid UUID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .select(`
        *,
        transactions:transactions(id, amount, type, date, description, merchant)
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Account not found' });
      }
      logger.error('Error fetching account:', error);
      return res.status(500).json({ error: 'Failed to fetch account' });
    }

    // Calculate current balance
    const transactions = account.transactions || [];
    const currentBalance = transactions.reduce((sum: number, transaction: any) => {
      return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    }, account.initial_balance || 0);

    res.json({
      ...account,
      current_balance: currentBalance,
      transaction_count: transactions.length
    });
  } catch (error) {
    logger.error('Error in GET /accounts/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   POST /api/accounts
 * @desc    Create new account
 * @access  Private
 */
router.post('/', [
  body('name').isString().notEmpty().withMessage('Account name is required'),
  body('type').isIn(['checking', 'savings', 'credit_card', 'investment', 'loan', 'cash', 'other'])
    .withMessage('Account type must be one of: checking, savings, credit_card, investment, loan, cash, other'),
  body('initial_balance').optional().isFloat().withMessage('Initial balance must be a number'),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('institution').optional().isString().withMessage('Institution must be a string'),
  body('account_number').optional().isString().withMessage('Account number must be a string'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const accountData = {
      ...req.body,
      user_id: req.user!.id,
      initial_balance: req.body.initial_balance || 0,
      currency: req.body.currency || 'USD',
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
    };

    const { data: account, error } = await supabase
      .from('accounts')
      .insert(accountData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating account:', error);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    logger.info(`Account created: ${account.id} for user: ${req.user!.id}`);
    res.status(201).json({
      ...account,
      current_balance: account.initial_balance,
      transaction_count: 0
    });
  } catch (error) {
    logger.error('Error in POST /accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   PUT /api/accounts/:id
 * @desc    Update account
 * @access  Private
 */
router.put('/:id', [
  param('id').isUUID().withMessage('Account ID must be a valid UUID'),
  body('name').optional().isString().notEmpty().withMessage('Account name must not be empty'),
  body('type').optional().isIn(['checking', 'savings', 'credit_card', 'investment', 'loan', 'cash', 'other'])
    .withMessage('Account type must be one of: checking, savings, credit_card, investment, loan, cash, other'),
  body('initial_balance').optional().isFloat().withMessage('Initial balance must be a number'),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('institution').optional().isString().withMessage('Institution must be a string'),
  body('account_number').optional().isString().withMessage('Account number must be a string'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    // Verify account belongs to user
    const { data: existingAccount, error: checkError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (checkError || !existingAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    const { data: account, error } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating account:', error);
      return res.status(500).json({ error: 'Failed to update account' });
    }

    logger.info(`Account updated: ${account.id} for user: ${req.user!.id}`);
    res.json(account);
  } catch (error) {
    logger.error('Error in PUT /accounts/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Delete account
 * @access  Private
 */
router.delete('/:id', [
  param('id').isUUID().withMessage('Account ID must be a valid UUID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    // Check if account has any transactions
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('id')
      .eq('account_id', req.params.id)
      .limit(1);

    if (transactionError) {
      logger.error('Error checking account transactions:', transactionError);
      return res.status(500).json({ error: 'Failed to verify account deletion' });
    }

    if (transactions && transactions.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete account with existing transactions. Please transfer or delete all transactions first.' 
      });
    }

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Account not found' });
      }
      logger.error('Error deleting account:', error);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    logger.info(`Account deleted: ${req.params.id} for user: ${req.user!.id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error in DELETE /accounts/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/accounts/:id/balance-history
 * @desc    Get account balance history over time
 * @access  Private
 */
router.get('/:id/balance-history', [
  param('id').isUUID().withMessage('Account ID must be a valid UUID'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const days = Number(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, initial_balance')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Get transactions for the time period
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('account_id', req.params.id)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (error) {
      logger.error('Error fetching balance history:', error);
      return res.status(500).json({ error: 'Failed to fetch balance history' });
    }

    // Calculate daily balances
    const balanceHistory = [];
    let runningBalance = account.initial_balance || 0;
    
    // Get transactions before the start date to calculate initial balance
    const { data: previousTransactions, error: prevError } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('account_id', req.params.id)
      .lt('date', startDate.toISOString());

    if (!prevError && previousTransactions) {
      runningBalance = previousTransactions.reduce((sum, transaction) => {
        return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
      }, account.initial_balance || 0);
    }

    // Group transactions by date and calculate balances
    const transactionsByDate = new Map();
    transactions.forEach(transaction => {
      const date = transaction.date.split('T')[0]; // Get date part only
      if (!transactionsByDate.has(date)) {
        transactionsByDate.set(date, []);
      }
      transactionsByDate.get(date).push(transaction);
    });

    // Generate daily balance points
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];

      if (transactionsByDate.has(dateString)) {
        const dayTransactions = transactionsByDate.get(dateString);
        dayTransactions.forEach((transaction: any) => {
          runningBalance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
        });
      }

      balanceHistory.push({
        date: dateString,
        balance: runningBalance
      });
    }

    res.json(balanceHistory);
  } catch (error) {
    logger.error('Error in GET /accounts/:id/balance-history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/accounts/summary
 * @desc    Get accounts summary with total balances by type
 * @access  Private
 */
router.get('/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select(`
        id,
        name,
        type,
        initial_balance,
        currency,
        is_active,
        transactions:transactions(amount, type)
      `)
      .eq('user_id', req.user!.id)
      .eq('is_active', true);

    if (error) {
      logger.error('Error fetching accounts summary:', error);
      return res.status(500).json({ error: 'Failed to fetch accounts summary' });
    }

    // Calculate balances and group by account type
    const summary = accounts.reduce((acc: any, account) => {
      const transactions = account.transactions || [];
      const currentBalance = transactions.reduce((sum: number, transaction: any) => {
        return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
      }, account.initial_balance || 0);

      if (!acc[account.type]) {
        acc[account.type] = {
          count: 0,
          total_balance: 0,
          accounts: []
        };
      }

      acc[account.type].count++;
      acc[account.type].total_balance += currentBalance;
      acc[account.type].accounts.push({
        id: account.id,
        name: account.name,
        balance: currentBalance,
        currency: account.currency
      });

      return acc;
    }, {});

    // Calculate total net worth
    const totalNetWorth = Object.values(summary).reduce((sum: number, typeData: any) => {
      return sum + typeData.total_balance;
    }, 0);

    res.json({
      summary,
      total_accounts: accounts.length,
      total_net_worth: totalNetWorth
    });
  } catch (error) {
    logger.error('Error in GET /accounts/summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as accountRoutes };
