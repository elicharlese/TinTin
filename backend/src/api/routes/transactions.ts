import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { supabase } from '../../config';
import { logger } from '../../utils/logger';
import { AuthenticatedRequest, auth } from '../../middleware/auth';
import { rateLimitStrict } from '../../middleware/rateLimiter';
import { Transaction, CreateTransactionRequest, UpdateTransactionRequest, TransactionFilters } from '../../types';

const router = Router();

// Apply authentication and rate limiting to all routes
router.use(auth);
router.use(rateLimitStrict);

/**
 * @route   GET /api/transactions
 * @desc    Get transactions with optional filtering
 * @access  Private
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category_id').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  query('account_id').optional().isUUID().withMessage('Account ID must be a valid UUID'),
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  query('min_amount').optional().isFloat().withMessage('Min amount must be a valid number'),
  query('max_amount').optional().isFloat().withMessage('Max amount must be a valid number'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('type').optional().isIn(['income', 'expense', 'transfer']).withMessage('Type must be income, expense, or transfer'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const {
      page = 1,
      limit = 50,
      category_id,
      account_id,
      start_date,
      end_date,
      min_amount,
      max_amount,
      search,
      type
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('transactions')
      .select(`
        *,
        account:accounts!inner(id, name, type),
        category:categories(id, name, color),
        tags:transaction_tags(tag:tags(id, name, color))
      `)
      .eq('user_id', req.user!.id)
      .order('date', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    // Apply filters
    if (category_id) query = query.eq('category_id', category_id);
    if (account_id) query = query.eq('account_id', account_id);
    if (start_date) query = query.gte('date', start_date);
    if (end_date) query = query.lte('date', end_date);
    if (min_amount) query = query.gte('amount', min_amount);
    if (max_amount) query = query.lte('amount', max_amount);
    if (type) query = query.eq('type', type);
    if (search) {
      query = query.or(`description.ilike.%${search}%,merchant.ilike.%${search}%`);
    }

    const { data: transactions, error, count } = await query;

    if (error) {
      logger.error('Error fetching transactions:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user!.id);

    if (countError) {
      logger.error('Error counting transactions:', countError);
    }

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error in GET /transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction by ID
 * @access  Private
 */
router.get('/:id', [
  param('id').isUUID().withMessage('Transaction ID must be a valid UUID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        *,
        account:accounts!inner(id, name, type),
        category:categories(id, name, color),
        tags:transaction_tags(tag:tags(id, name, color))
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      logger.error('Error fetching transaction:', error);
      return res.status(500).json({ error: 'Failed to fetch transaction' });
    }

    res.json(transaction);
  } catch (error) {
    logger.error('Error in GET /transactions/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   POST /api/transactions
 * @desc    Create new transaction
 * @access  Private
 */
router.post('/', [
  body('amount').isFloat().withMessage('Amount is required and must be a number'),
  body('description').isString().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('account_id').isUUID().withMessage('Account ID must be a valid UUID'),
  body('category_id').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  body('type').isIn(['income', 'expense', 'transfer']).withMessage('Type must be income, expense, or transfer'),
  body('merchant').optional().isString().withMessage('Merchant must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('tag_ids').optional().isArray().withMessage('Tag IDs must be an array'),
  body('tag_ids.*').optional().isUUID().withMessage('Each tag ID must be a valid UUID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const transactionData: CreateTransactionRequest = {
      ...req.body,
      user_id: req.user!.id,
    };

    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', transactionData.account_id)
      .eq('user_id', req.user!.id)
      .single();

    if (accountError || !account) {
      return res.status(400).json({ error: 'Invalid account ID' });
    }

    // Verify category belongs to user (if provided)
    if (transactionData.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', transactionData.category_id)
        .eq('user_id', req.user!.id)
        .single();

      if (categoryError || !category) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
    }

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
      return res.status(500).json({ error: 'Failed to create transaction' });
    }

    // Handle tags if provided
    if (req.body.tag_ids && req.body.tag_ids.length > 0) {
      const tagAssociations = req.body.tag_ids.map((tag_id: string) => ({
        transaction_id: transaction.id,
        tag_id,
      }));

      const { error: tagError } = await supabase
        .from('transaction_tags')
        .insert(tagAssociations);

      if (tagError) {
        logger.error('Error associating tags:', tagError);
      }
    }

    logger.info(`Transaction created: ${transaction.id} for user: ${req.user!.id}`);
    res.status(201).json(transaction);
  } catch (error) {
    logger.error('Error in POST /transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction
 * @access  Private
 */
router.put('/:id', [
  param('id').isUUID().withMessage('Transaction ID must be a valid UUID'),
  body('amount').optional().isFloat().withMessage('Amount must be a number'),
  body('description').optional().isString().notEmpty().withMessage('Description must not be empty'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('account_id').optional().isUUID().withMessage('Account ID must be a valid UUID'),
  body('category_id').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  body('type').optional().isIn(['income', 'expense', 'transfer']).withMessage('Type must be income, expense, or transfer'),
  body('merchant').optional().isString().withMessage('Merchant must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    // Verify transaction belongs to user
    const { data: existingTransaction, error: checkError } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (checkError || !existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updateData: UpdateTransactionRequest = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    // Verify account belongs to user (if being updated)
    if (updateData.account_id) {
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', updateData.account_id)
        .eq('user_id', req.user!.id)
        .single();

      if (accountError || !account) {
        return res.status(400).json({ error: 'Invalid account ID' });
      }
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .select(`
        *,
        account:accounts!inner(id, name, type),
        category:categories(id, name, color)
      `)
      .single();

    if (error) {
      logger.error('Error updating transaction:', error);
      return res.status(500).json({ error: 'Failed to update transaction' });
    }

    logger.info(`Transaction updated: ${transaction.id} for user: ${req.user!.id}`);
    res.json(transaction);
  } catch (error) {
    logger.error('Error in PUT /transactions/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete transaction
 * @access  Private
 */
router.delete('/:id', [
  param('id').isUUID().withMessage('Transaction ID must be a valid UUID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      logger.error('Error deleting transaction:', error);
      return res.status(500).json({ error: 'Failed to delete transaction' });
    }

    logger.info(`Transaction deleted: ${req.params.id} for user: ${req.user!.id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error in DELETE /transactions/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/transactions/summary
 * @desc    Get transaction summary statistics
 * @access  Private
 */
router.get('/summary', [
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { start_date, end_date } = req.query;

    let query = supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', req.user!.id);

    if (start_date) query = query.gte('date', start_date);
    if (end_date) query = query.lte('date', end_date);

    const { data: transactions, error } = await query;

    if (error) {
      logger.error('Error fetching transaction summary:', error);
      return res.status(500).json({ error: 'Failed to fetch transaction summary' });
    }

    const summary: any = transactions.reduce(
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

    res.json(summary);
  } catch (error) {
    logger.error('Error in GET /transactions/summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as transactionRoutes };
