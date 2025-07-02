import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

export interface BudgetCalculation {
  budgetId: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'on_track' | 'near_limit' | 'over_budget';
}

export class BudgetService {
  /**
   * Calculate spending for a specific budget
   */
  async calculateBudgetSpending(budgetId: string, userId: string): Promise<BudgetCalculation | null> {
    try {
      // Get budget details
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .eq('user_id', userId)
        .single();

      if (budgetError || !budget) {
        logger.error('Budget not found:', budgetError);
        return null;
      }

      // Calculate current period
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

      const { data: transactions, error: transactionError } = await query;

      if (transactionError) {
        logger.error('Error fetching transactions for budget calculation:', transactionError);
        return null;
      }

      const totalSpent = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
      const remaining = budget.amount - totalSpent;
      const percentage = (totalSpent / budget.amount) * 100;

      let status: 'on_track' | 'near_limit' | 'over_budget';
      if (percentage > 100) {
        status = 'over_budget';
      } else if (percentage > 80) {
        status = 'near_limit';
      } else {
        status = 'on_track';
      }

      return {
        budgetId: budget.id,
        amount: budget.amount,
        spent: totalSpent,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
        status
      };
    } catch (error) {
      logger.error('Error calculating budget spending:', error);
      return null;
    }
  }

  /**
   * Check all budgets for a user and generate alerts if needed
   */
  async checkBudgetAlerts(userId: string): Promise<void> {
    try {
      const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (error || !budgets) {
        logger.error('Error fetching budgets for alert check:', error);
        return;
      }

      for (const budget of budgets) {
        const calculation = await this.calculateBudgetSpending(budget.id, userId);
        
        if (!calculation) continue;

        // Generate alerts based on status
        if (calculation.status === 'over_budget') {
          await this.createBudgetAlert(userId, budget, 'budget_exceeded', 
            `Budget "${budget.name}" exceeded`, 
            `You've spent $${calculation.spent.toFixed(2)} of your $${calculation.amount.toFixed(2)} budget (${calculation.percentage.toFixed(1)}%)`
          );
        } else if (calculation.status === 'near_limit') {
          await this.createBudgetAlert(userId, budget, 'budget_warning',
            `Budget "${budget.name}" near limit`,
            `You've spent $${calculation.spent.toFixed(2)} of your $${calculation.amount.toFixed(2)} budget (${calculation.percentage.toFixed(1)}%)`
          );
        }
      }
    } catch (error) {
      logger.error('Error checking budget alerts:', error);
    }
  }

  /**
   * Create a budget-related alert
   */
  private async createBudgetAlert(userId: string, budget: any, type: string, title: string, message: string): Promise<void> {
    try {
      // Check if similar alert already exists in the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: existingAlert } = await supabase
        .from('alerts')
        .select('id')
        .eq('user_id', userId)
        .eq('type', type)
        .gte('created_at', yesterday.toISOString())
        .contains('metadata', { budget_id: budget.id })
        .single();

      if (existingAlert) {
        // Alert already exists, don't create duplicate
        return;
      }

      await supabase
        .from('alerts')
        .insert({
          user_id: userId,
          type: 'budget_exceeded',
          title,
          message,
          priority: type === 'budget_exceeded' ? 'high' : 'medium',
          metadata: {
            budget_id: budget.id,
            budget_name: budget.name
          }
        });

      logger.info(`Budget alert created for user ${userId}, budget ${budget.id}`);
    } catch (error) {
      logger.error('Error creating budget alert:', error);
    }
  }
}

export const budgetService = new BudgetService();
