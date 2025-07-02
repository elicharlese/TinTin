import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth';
import { supabase } from '../../utils/supabase';
import { logger } from '../../utils/logger';

const router = Router();

// Validation helper
const validateBudget = (data: any) => {
  const errors: string[] = [];
  
  if (data.name && (typeof data.name !== 'string' || data.name.trim().length === 0 || data.name.length > 255)) {
    errors.push('Name must be a non-empty string with maximum 255 characters');
  }
  
  if (data.amount && (typeof data.amount !== 'number' || data.amount <= 0)) {
    errors.push('Amount must be a positive number');
  }
  
  if (data.period && !['monthly', 'weekly', 'yearly', 'custom'].includes(data.period)) {
    errors.push('Period must be one of: monthly, weekly, yearly, custom');
  }
  
  return errors;
};

// Get all budgets for authenticated user
router.get('/', 
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      const { data: budgets, error } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching budgets:', error);
        return res.status(500).json({ error: 'Failed to fetch budgets' });
      }

      res.json({ budgets });
    } catch (error) {
      logger.error('Budgets fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get budget by ID
router.get('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid budget ID format' });
      }

      const { data: budget, error } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Budget not found' });
        }
        logger.error('Error fetching budget:', error);
        return res.status(500).json({ error: 'Failed to fetch budget' });
      }

      res.json({ budget });
    } catch (error) {
      logger.error('Budget fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get budget spending progress
router.get('/:id/progress',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid budget ID format' });
      }

      // Get budget details
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (budgetError || !budget) {
        return res.status(404).json({ error: 'Budget not found' });
      }

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
        .lte('date', endDate.toISOString().split('T')[0]);

      if (budget.category_id) {
        query = query.eq('category_id', budget.category_id);
      }

      const { data: transactions, error: transactionError } = await query;

      if (transactionError) {
        logger.error('Error fetching transaction data:', transactionError);
        return res.status(500).json({ error: 'Failed to calculate spending' });
      }

      const totalSpent = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
      const remaining = budget.amount - totalSpent;
      const percentage = (totalSpent / budget.amount) * 100;

      res.json({
        budget_id: id,
        amount: budget.amount,
        spent: totalSpent,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
        period: budget.period,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });
    } catch (error) {
      logger.error('Budget progress error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create new budget
router.post('/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, amount, period, category_id, start_date, end_date, description } = req.body;
      const userId = req.user?.id;

      // Validate input
      const validationErrors = validateBudget({ name, amount, period });
      if (!name || name.trim().length === 0) {
        validationErrors.push('Name is required');
      }
      if (!amount || amount <= 0) {
        validationErrors.push('Amount is required and must be positive');
      }
      if (!period) {
        validationErrors.push('Period is required');
      }
      
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: validationErrors });
      }

      const { data: budget, error } = await supabase
        .from('budgets')
        .insert({
          user_id: userId,
          name: name.trim(),
          amount: parseFloat(amount),
          period,
          category_id: category_id || null,
          start_date: start_date || null,
          end_date: end_date || null,
          description: description?.trim() || null
        })
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .single();

      if (error) {
        logger.error('Error creating budget:', error);
        return res.status(500).json({ error: 'Failed to create budget' });
      }

      logger.info(`Budget created: ${budget.id} by user ${userId}`);
      res.status(201).json({ budget });
    } catch (error) {
      logger.error('Budget creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update budget
router.put('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid budget ID format' });
      }

      // Validate updates
      const validationErrors = validateBudget(updates);
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: validationErrors });
      }

      // Verify budget ownership
      const { data: existing } = await supabase
        .from('budgets')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      const cleanUpdates: any = {};
      if (updates.name) cleanUpdates.name = updates.name.trim();
      if (updates.amount) cleanUpdates.amount = parseFloat(updates.amount);
      if (updates.period) cleanUpdates.period = updates.period;
      if (updates.category_id !== undefined) cleanUpdates.category_id = updates.category_id || null;
      if (updates.start_date !== undefined) cleanUpdates.start_date = updates.start_date || null;
      if (updates.end_date !== undefined) cleanUpdates.end_date = updates.end_date || null;
      if (updates.description !== undefined) cleanUpdates.description = updates.description?.trim() || null;
      cleanUpdates.updated_at = new Date().toISOString();

      const { data: budget, error } = await supabase
        .from('budgets')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .single();

      if (error) {
        logger.error('Error updating budget:', error);
        return res.status(500).json({ error: 'Failed to update budget' });
      }

      logger.info(`Budget updated: ${id} by user ${userId}`);
      res.json({ budget });
    } catch (error) {
      logger.error('Budget update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete budget
router.delete('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid budget ID format' });
      }

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        logger.error('Error deleting budget:', error);
        return res.status(500).json({ error: 'Failed to delete budget' });
      }

      logger.info(`Budget deleted: ${id} by user ${userId}`);
      res.status(204).send();
    } catch (error) {
      logger.error('Budget deletion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export { router as budgetRoutes };
