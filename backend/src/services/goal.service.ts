import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

export interface GoalProgress {
  goalId: string;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  percentage: number;
  isCompleted: boolean;
  daysRemaining?: number;
}

export class GoalService {
  /**
   * Calculate progress for a specific goal
   */
  async calculateGoalProgress(goalId: string, userId: string): Promise<GoalProgress | null> {
    try {
      const { data: goal, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', userId)
        .single();

      if (error || !goal) {
        logger.error('Goal not found:', error);
        return null;
      }

      const remaining = goal.target_amount - goal.current_amount;
      const percentage = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
      const isCompleted = goal.current_amount >= goal.target_amount;

      let daysRemaining: number | undefined;
      if (goal.target_date && !isCompleted) {
        const targetDate = new Date(goal.target_date);
        const now = new Date();
        const timeDiff = targetDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }

      return {
        goalId: goal.id,
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
        isCompleted,
        daysRemaining
      };
    } catch (error) {
      logger.error('Error calculating goal progress:', error);
      return null;
    }
  }

  /**
   * Add progress to a goal
   */
  async addProgress(goalId: string, userId: string, amount: number, note?: string): Promise<boolean> {
    try {
      // Get current goal
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', userId)
        .single();

      if (goalError || !goal) {
        logger.error('Goal not found:', goalError);
        return false;
      }

      // Add progress entry
      const { error: progressError } = await supabase
        .from('goal_progress')
        .insert({
          goal_id: goalId,
          amount,
          note: note || null
        });

      if (progressError) {
        logger.error('Error adding goal progress:', progressError);
        return false;
      }

      // Update goal current amount
      const newCurrentAmount = goal.current_amount + amount;
      const { error: updateError } = await supabase
        .from('goals')
        .update({
          current_amount: newCurrentAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', userId);

      if (updateError) {
        logger.error('Error updating goal:', updateError);
        return false;
      }

      // Check if goal is now completed
      if (newCurrentAmount >= goal.target_amount && goal.current_amount < goal.target_amount) {
        await this.createGoalCompletionAlert(userId, goal);
      }

      logger.info(`Goal progress added: ${goalId} by user ${userId}, amount: ${amount}`);
      return true;
    } catch (error) {
      logger.error('Error adding goal progress:', error);
      return false;
    }
  }

  /**
   * Check all goals for a user and generate milestone alerts
   */
  async checkGoalMilestones(userId: string): Promise<void> {
    try {
      const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      if (error || !goals) {
        logger.error('Error fetching goals for milestone check:', error);
        return;
      }

      for (const goal of goals) {
        const progress = await this.calculateGoalProgress(goal.id, userId);
        
        if (!progress) continue;

        // Check for milestone achievements (25%, 50%, 75%, 100%)
        const milestones = [25, 50, 75, 100];
        for (const milestone of milestones) {
          if (progress.percentage >= milestone) {
            await this.checkAndCreateMilestoneAlert(userId, goal, milestone, progress.percentage);
          }
        }

        // Check for deadline warnings (7 days, 1 day before target date)
        if (goal.target_date && !progress.isCompleted && progress.daysRemaining !== undefined) {
          if (progress.daysRemaining <= 7 && progress.daysRemaining > 0) {
            await this.createDeadlineAlert(userId, goal, progress.daysRemaining);
          }
        }
      }
    } catch (error) {
      logger.error('Error checking goal milestones:', error);
    }
  }

  /**
   * Create goal completion alert
   */
  private async createGoalCompletionAlert(userId: string, goal: any): Promise<void> {
    try {
      await supabase
        .from('alerts')
        .insert({
          user_id: userId,
          type: 'goal_milestone',
          title: `Goal "${goal.name}" completed! 🎉`,
          message: `Congratulations! You've reached your goal of $${goal.target_amount.toFixed(2)}.`,
          priority: 'high',
          metadata: {
            goal_id: goal.id,
            goal_name: goal.name,
            milestone: 100
          }
        });

      logger.info(`Goal completion alert created for user ${userId}, goal ${goal.id}`);
    } catch (error) {
      logger.error('Error creating goal completion alert:', error);
    }
  }

  /**
   * Check and create milestone alert if it doesn't exist
   */
  private async checkAndCreateMilestoneAlert(userId: string, goal: any, milestone: number, currentPercentage: number): Promise<void> {
    try {
      // Check if milestone alert already exists
      const { data: existingAlert } = await supabase
        .from('alerts')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'goal_milestone')
        .contains('metadata', { goal_id: goal.id, milestone })
        .single();

      if (existingAlert) {
        // Alert already exists, don't create duplicate
        return;
      }

      // Only create milestone alerts for significant milestones and not 100% (handled separately)
      if (milestone === 100) return;

      await supabase
        .from('alerts')
        .insert({
          user_id: userId,
          type: 'goal_milestone',
          title: `${milestone}% progress on goal "${goal.name}"`,
          message: `Great progress! You're ${milestone}% of the way to your $${goal.target_amount.toFixed(2)} goal.`,
          priority: 'medium',
          metadata: {
            goal_id: goal.id,
            goal_name: goal.name,
            milestone
          }
        });

      logger.info(`Goal milestone alert created for user ${userId}, goal ${goal.id}, milestone ${milestone}%`);
    } catch (error) {
      logger.error('Error creating goal milestone alert:', error);
    }
  }

  /**
   * Create deadline warning alert
   */
  private async createDeadlineAlert(userId: string, goal: any, daysRemaining: number): Promise<void> {
    try {
      // Check if deadline alert already exists in the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: existingAlert } = await supabase
        .from('alerts')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'goal_deadline')
        .gte('created_at', yesterday.toISOString())
        .contains('metadata', { goal_id: goal.id })
        .single();

      if (existingAlert) {
        return;
      }

      const message = daysRemaining === 1 
        ? `Your goal "${goal.name}" deadline is tomorrow!`
        : `Your goal "${goal.name}" deadline is in ${daysRemaining} days.`;

      await supabase
        .from('alerts')
        .insert({
          user_id: userId,
          type: 'goal_deadline',
          title: 'Goal deadline approaching',
          message,
          priority: daysRemaining <= 1 ? 'high' : 'medium',
          metadata: {
            goal_id: goal.id,
            goal_name: goal.name,
            days_remaining: daysRemaining
          }
        });

      logger.info(`Goal deadline alert created for user ${userId}, goal ${goal.id}`);
    } catch (error) {
      logger.error('Error creating goal deadline alert:', error);
    }
  }
}

export const goalService = new GoalService();
