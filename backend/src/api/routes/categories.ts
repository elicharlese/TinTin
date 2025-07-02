import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth';
import { supabase } from '../../utils/supabase';
import { logger } from '../../utils/logger';

const router = Router();

// Validation helper
const validateCategory = (data: any) => {
  const errors: string[] = [];
  
  if (data.name && (typeof data.name !== 'string' || data.name.trim().length === 0 || data.name.length > 255)) {
    errors.push('Name must be a non-empty string with maximum 255 characters');
  }
  
  if (data.description && (typeof data.description !== 'string' || data.description.length > 500)) {
    errors.push('Description must be a string with maximum 500 characters');
  }
  
  if (data.color && (typeof data.color !== 'string' || !/^#[0-9A-F]{6}$/i.test(data.color))) {
    errors.push('Color must be a valid hex color code');
  }
  
  return errors;
};

// Get all categories for authenticated user
router.get('/', 
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) {
        logger.error('Error fetching categories:', error);
        return res.status(500).json({ error: 'Failed to fetch categories' });
      }

      res.json({ categories });
    } catch (error) {
      logger.error('Categories fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get category by ID
router.get('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid category ID format' });
      }

      const { data: category, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Category not found' });
        }
        logger.error('Error fetching category:', error);
        return res.status(500).json({ error: 'Failed to fetch category' });
      }

      res.json({ category });
    } catch (error) {
      logger.error('Category fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create new category
router.post('/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, description, color, icon, parent_id } = req.body;
      const userId = req.user?.id;

      // Validate input
      const validationErrors = validateCategory({ name, description, color });
      if (!name || name.trim().length === 0) {
        validationErrors.push('Name is required');
      }
      
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: validationErrors });
      }

      // Check if category name already exists for this user
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', name.trim())
        .single();

      if (existing) {
        return res.status(400).json({ error: 'Category name already exists' });
      }

      const { data: category, error } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          name: name.trim(),
          description: description?.trim() || null,
          color: color || '#6B7280',
          icon: icon || 'folder',
          parent_id: parent_id || null
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating category:', error);
        return res.status(500).json({ error: 'Failed to create category' });
      }

      logger.info(`Category created: ${category.id} by user ${userId}`);
      res.status(201).json({ category });
    } catch (error) {
      logger.error('Category creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update category
router.put('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid category ID format' });
      }

      // Validate updates
      const validationErrors = validateCategory(updates);
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: validationErrors });
      }

      // Verify category ownership
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const cleanUpdates: any = {};
      if (updates.name) cleanUpdates.name = updates.name.trim();
      if (updates.description !== undefined) cleanUpdates.description = updates.description?.trim() || null;
      if (updates.color) cleanUpdates.color = updates.color;
      if (updates.icon) cleanUpdates.icon = updates.icon;
      if (updates.parent_id !== undefined) cleanUpdates.parent_id = updates.parent_id || null;
      cleanUpdates.updated_at = new Date().toISOString();

      const { data: category, error } = await supabase
        .from('categories')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating category:', error);
        return res.status(500).json({ error: 'Failed to update category' });
      }

      logger.info(`Category updated: ${id} by user ${userId}`);
      res.json({ category });
    } catch (error) {
      logger.error('Category update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete category
router.delete('/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid category ID format' });
      }

      // Check if category has transactions
      const { count } = await supabase
        .from('transactions')
        .select('id', { count: 'exact' })
        .eq('category_id', id)
        .eq('user_id', userId);

      if (count && count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete category with existing transactions' 
        });
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        logger.error('Error deleting category:', error);
        return res.status(500).json({ error: 'Failed to delete category' });
      }

      logger.info(`Category deleted: ${id} by user ${userId}`);
      res.status(204).send();
    } catch (error) {
      logger.error('Category deletion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export { router as categoryRoutes };
