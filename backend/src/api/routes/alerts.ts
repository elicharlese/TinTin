import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth';
import { supabase } from '../../utils/supabase';
import { logger } from '../../utils/logger';

const router = Router();

// Validation helper
const validateAlert = (data: any) => {
  const errors: string[] = [];
  
  if (data.type && !['budget_exceeded', 'goal_milestone', 'unusual_spending', 'low_balance', 'bill_reminder', 'custom'].includes(data.type)) {
    errors.push('Type must be one of: budget_exceeded, goal_milestone, unusual_spending, low_balance, bill_reminder, custom');
  }
  
  if (data.priority && !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
    errors.push('Priority must be one of: low, medium, high, urgent');
  }
  
  return errors;
};

// Get all alerts for authenticated user
router.get('/', 
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { unread_only, limit = 50, offset = 0 } = req.query;
      
      let query = supabase
        .from('alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unread_only === 'true') {
        query = query.eq('is_read', false);
      }

      const limitNum = parseInt(limit as string) || 50;
      const offsetNum = parseInt(offset as string) || 0;
      
      query = query.range(offsetNum, offsetNum + limitNum - 1);

      const { data: alerts, error } = await query;

      if (error) {
        logger.error('Error fetching alerts:', error);
        return res.status(500).json({ error: 'Failed to fetch alerts' });
      }

      res.json({ alerts });
    } catch (error) {
      logger.error('Alerts fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get alert statistics
router.get('/stats',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      // Get counts by status and priority
      const { data: stats, error } = await supabase
        .from('alerts')
        .select('is_read, priority')
        .eq('user_id', userId);

      if (error) {
        logger.error('Error fetching alert stats:', error);
        return res.status(500).json({ error: 'Failed to fetch alert statistics' });
      }

      const unreadCount = stats.filter(alert => !alert.is_read).length;
      const totalCount = stats.length;
      const priorityBreakdown = {
        urgent: stats.filter(alert => alert.priority === 'urgent').length,
        high: stats.filter(alert => alert.priority === 'high').length,
        medium: stats.filter(alert => alert.priority === 'medium').length,
        low: stats.filter(alert => alert.priority === 'low').length
      };

      res.json({
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount,
        priority_breakdown: priorityBreakdown
      });
    } catch (error) {
      logger.error('Alert stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get alert by ID
router.get('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid alert ID format' });
      }

      const { data: alert, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Alert not found' });
        }
        logger.error('Error fetching alert:', error);
        return res.status(500).json({ error: 'Failed to fetch alert' });
      }

      res.json({ alert });
    } catch (error) {
      logger.error('Alert fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create new alert
router.post('/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type, title, message, priority, metadata } = req.body;
      const userId = req.user?.id;

      // Validate input
      const validationErrors = validateAlert({ type, priority });
      if (!type) {
        validationErrors.push('Type is required');
      }
      if (!title || title.trim().length === 0) {
        validationErrors.push('Title is required');
      }
      if (!message || message.trim().length === 0) {
        validationErrors.push('Message is required');
      }
      
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: validationErrors });
      }

      const { data: alert, error } = await supabase
        .from('alerts')
        .insert({
          user_id: userId,
          type,
          title: title.trim(),
          message: message.trim(),
          priority: priority || 'medium',
          metadata: metadata || null
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating alert:', error);
        return res.status(500).json({ error: 'Failed to create alert' });
      }

      logger.info(`Alert created: ${alert.id} by user ${userId}`);
      res.status(201).json({ alert });
    } catch (error) {
      logger.error('Alert creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Mark alert as read
router.patch('/:id/read',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid alert ID format' });
      }

      const { data: alert, error } = await supabase
        .from('alerts')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Alert not found' });
        }
        logger.error('Error marking alert as read:', error);
        return res.status(500).json({ error: 'Failed to mark alert as read' });
      }

      logger.info(`Alert marked as read: ${id} by user ${userId}`);
      res.json({ alert });
    } catch (error) {
      logger.error('Alert read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Mark alert as unread
router.patch('/:id/unread',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid alert ID format' });
      }

      const { data: alert, error } = await supabase
        .from('alerts')
        .update({
          is_read: false,
          read_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Alert not found' });
        }
        logger.error('Error marking alert as unread:', error);
        return res.status(500).json({ error: 'Failed to mark alert as unread' });
      }

      logger.info(`Alert marked as unread: ${id} by user ${userId}`);
      res.json({ alert });
    } catch (error) {
      logger.error('Alert unread error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Mark all alerts as read
router.patch('/read-all',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      const { data: alerts, error } = await supabase
        .from('alerts')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();

      if (error) {
        logger.error('Error marking all alerts as read:', error);
        return res.status(500).json({ error: 'Failed to mark all alerts as read' });
      }

      logger.info(`All alerts marked as read by user ${userId}`);
      res.json({ 
        message: 'All alerts marked as read',
        updated_count: alerts.length
      });
    } catch (error) {
      logger.error('Alert read all error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete alert
router.delete('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid alert ID format' });
      }

      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        logger.error('Error deleting alert:', error);
        return res.status(500).json({ error: 'Failed to delete alert' });
      }

      logger.info(`Alert deleted: ${id} by user ${userId}`);
      res.status(204).send();
    } catch (error) {
      logger.error('Alert deletion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete all read alerts
router.delete('/read-alerts',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('user_id', userId)
        .eq('is_read', true);

      if (error) {
        logger.error('Error deleting read alerts:', error);
        return res.status(500).json({ error: 'Failed to delete read alerts' });
      }

      logger.info(`All read alerts deleted by user ${userId}`);
      res.json({ message: 'All read alerts deleted' });
    } catch (error) {
      logger.error('Alert delete all read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export { router as alertRoutes };
