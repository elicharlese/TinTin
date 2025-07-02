import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth';
import { supabase } from '../../utils/supabase';
import { logger } from '../../utils/logger';

const router = Router();

// Validation helper
const validateGoal = (data: any) => {
  const errors: string[] = [];
  
  if (data.name && (typeof data.name !== 'string' || data.name.trim().length === 0 || data.name.length > 255)) {
    errors.push('Name must be a non-empty string with maximum 255 characters');
  }
  
  if (data.target_amount && (typeof data.target_amount !== 'number' || data.target_amount <= 0)) {
    errors.push('Target amount must be a positive number');
  }
  
  if (data.type && !['savings', 'debt_payoff', 'investment', 'emergency_fund', 'custom'].includes(data.type)) {
    errors.push('Type must be one of: savings, debt_payoff, investment, emergency_fund, custom');
  }
  
  return errors;
};

// Get all goals for authenticated user
router.get('/', 
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching goals:', error);
        return res.status(500).json({ error: 'Failed to fetch goals' });
      }

      // Calculate progress for each goal
      const goalsWithProgress = goals.map(goal => {
        const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
        return {
          ...goal,
          progress: Math.round(progress * 100) / 100,
          remaining: goal.target_amount - goal.current_amount
        };
      });

      res.json({ goals: goalsWithProgress });
    } catch (error) {
      logger.error('Goals fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get goal by ID
router.get('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid goal ID format' });
      }

      const { data: goal, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Goal not found' });
        }
        logger.error('Error fetching goal:', error);
        return res.status(500).json({ error: 'Failed to fetch goal' });
      }

      // Calculate progress
      const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
      const goalWithProgress = {
        ...goal,
        progress: Math.round(progress * 100) / 100,
        remaining: goal.target_amount - goal.current_amount
      };

      res.json({ goal: goalWithProgress });
    } catch (error) {
      logger.error('Goal fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get goal progress history
router.get('/:id/history',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid goal ID format' });
      }

      // Verify goal ownership
      const { data: goal } = await supabase
        .from('goals')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      // Get goal progress entries
      const { data: progressEntries, error } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('goal_id', id)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error fetching goal progress:', error);
        return res.status(500).json({ error: 'Failed to fetch goal progress' });
      }

      res.json({ progress: progressEntries });
    } catch (error) {
      logger.error('Goal progress fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create new goal
router.post('/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, description, type, target_amount, current_amount, target_date } = req.body;
      const userId = req.user?.id;

      // Validate input
      const validationErrors = validateGoal({ name, target_amount, type });
      if (!name || name.trim().length === 0) {
        validationErrors.push('Name is required');
      }
      if (!target_amount || target_amount <= 0) {
        validationErrors.push('Target amount is required and must be positive');
      }
      if (!type) {
        validationErrors.push('Type is required');
      }
      
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: validationErrors });
      }

      const { data: goal, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          name: name.trim(),
          description: description?.trim() || null,
          type,
          target_amount: parseFloat(target_amount),
          current_amount: parseFloat(current_amount) || 0,
          target_date: target_date || null
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating goal:', error);
        return res.status(500).json({ error: 'Failed to create goal' });
      }

      // Add initial progress entry if current_amount > 0
      if (goal.current_amount > 0) {
        await supabase
          .from('goal_progress')
          .insert({
            goal_id: goal.id,
            amount: goal.current_amount,
            note: 'Initial amount'
          });
      }

      logger.info(`Goal created: ${goal.id} by user ${userId}`);
      
      // Calculate progress
      const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
      const goalWithProgress = {
        ...goal,
        progress: Math.round(progress * 100) / 100,
        remaining: goal.target_amount - goal.current_amount
      };

      res.status(201).json({ goal: goalWithProgress });
    } catch (error) {
      logger.error('Goal creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update goal progress
router.post('/:id/progress',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { amount, note } = req.body;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid goal ID format' });
      }

      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ error: 'Amount is required and must be a number' });
      }

      // Get current goal
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (goalError || !goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      // Add progress entry
      const { error: progressError } = await supabase
        .from('goal_progress')
        .insert({
          goal_id: id,
          amount: typeof amount === 'number' ? amount : parseFloat(amount),
          note: note?.trim() || null
        });

      if (progressError) {
        logger.error('Error adding goal progress:', progressError);
        return res.status(500).json({ error: 'Failed to add progress' });
      }

      // Update goal current amount
      const newCurrentAmount = goal.current_amount + (typeof amount === 'number' ? amount : parseFloat(amount));
      const { data: updatedGoal, error: updateError } = await supabase
        .from('goals')
        .update({
          current_amount: newCurrentAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        logger.error('Error updating goal:', updateError);
        return res.status(500).json({ error: 'Failed to update goal' });
      }

      // Calculate progress
      const progress = updatedGoal.target_amount > 0 ? (updatedGoal.current_amount / updatedGoal.target_amount) * 100 : 0;
      const goalWithProgress = {
        ...updatedGoal,
        progress: Math.round(progress * 100) / 100,
        remaining: updatedGoal.target_amount - updatedGoal.current_amount
      };

      logger.info(`Goal progress updated: ${id} by user ${userId}, amount: ${amount}`);
      res.json({ goal: goalWithProgress });
    } catch (error) {
      logger.error('Goal progress update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update goal
router.put('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid goal ID format' });
      }

      // Validate updates
      const validationErrors = validateGoal(updates);
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: validationErrors });
      }

      // Verify goal ownership
      const { data: existing } = await supabase
        .from('goals')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      const cleanUpdates: any = {};
      if (updates.name) cleanUpdates.name = updates.name.trim();
      if (updates.description !== undefined) cleanUpdates.description = updates.description?.trim() || null;
      if (updates.type) cleanUpdates.type = updates.type;
      if (updates.target_amount) cleanUpdates.target_amount = parseFloat(updates.target_amount);
      if (updates.current_amount !== undefined) cleanUpdates.current_amount = parseFloat(updates.current_amount) || 0;
      if (updates.target_date !== undefined) cleanUpdates.target_date = updates.target_date || null;
      cleanUpdates.updated_at = new Date().toISOString();

      const { data: goal, error } = await supabase
        .from('goals')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating goal:', error);
        return res.status(500).json({ error: 'Failed to update goal' });
      }

      // Calculate progress
      const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
      const goalWithProgress = {
        ...goal,
        progress: Math.round(progress * 100) / 100,
        remaining: goal.target_amount - goal.current_amount
      };

      logger.info(`Goal updated: ${id} by user ${userId}`);
      res.json({ goal: goalWithProgress });
    } catch (error) {
      logger.error('Goal update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete goal
router.delete('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid goal ID format' });
      }

      // Delete goal progress entries first (cascade should handle this, but being explicit)
      await supabase
        .from('goal_progress')
        .delete()
        .eq('goal_id', id);

      // Delete the goal
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        logger.error('Error deleting goal:', error);
        return res.status(500).json({ error: 'Failed to delete goal' });
      }

      logger.info(`Goal deleted: ${id} by user ${userId}`);
      res.status(204).send();
    } catch (error) {
      logger.error('Goal deletion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export { router as goalRoutes };
