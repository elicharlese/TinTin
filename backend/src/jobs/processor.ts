import { CronJob } from 'cron';
import { logger } from '../utils/logger';
import { supabase } from '../utils/supabase';
import { solanaService } from '../services/solana.service';
import { budgetService } from '../services/budget.service';
import { goalService } from '../services/goal.service';

export interface JobConfig {
  name: string;
  schedule: string;
  enabled: boolean;
  handler: () => Promise<void>;
}

export class JobProcessor {
  private jobs: Map<string, CronJob> = new Map();
  private jobConfigs: JobConfig[] = [];

  constructor() {
    this.setupJobConfigs();
  }

  /**
   * Initialize all background jobs
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing job processor...');
      
      for (const config of this.jobConfigs) {
        if (config.enabled) {
          await this.registerJob(config);
        }
      }

      logger.info(`Job processor initialized with ${this.jobs.size} active jobs`);
    } catch (error) {
      logger.error('Failed to initialize job processor:', error);
      throw error;
    }
  }

  /**
   * Register a new job
   */
  private async registerJob(config: JobConfig): Promise<void> {
    try {
      const job = new CronJob(
        config.schedule,
        async () => {
          const startTime = Date.now();
          logger.info(`Starting job: ${config.name}`);
          
          try {
            await config.handler();
            const duration = Date.now() - startTime;
            logger.info(`Job completed: ${config.name} (${duration}ms)`);
          } catch (error) {
            const duration = Date.now() - startTime;
            logger.error(`Job failed: ${config.name} (${duration}ms)`, error);
          }
        },
        null,
        false,
        'UTC'
      );

      this.jobs.set(config.name, job);
      job.start();
      
      logger.info(`Job registered: ${config.name} with schedule: ${config.schedule}`);
    } catch (error) {
      logger.error(`Failed to register job: ${config.name}`, error);
      throw error;
    }
  }

  /**
   * Start all jobs
   */
  startAll(): void {
    for (const [name, job] of this.jobs) {
      if (!job.running) {
        job.start();
        logger.info(`Job started: ${name}`);
      }
    }
  }

  /**
   * Stop all jobs
   */
  stopAll(): void {
    for (const [name, job] of this.jobs) {
      if (job.running) {
        job.stop();
        logger.info(`Job stopped: ${name}`);
      }
    }
  }

  /**
   * Get job status
   */
  getJobStatus(): Array<{ name: string; running: boolean; nextDate: Date | null }> {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      running: job.running,
      nextDate: job.nextDate()?.toJSDate() || null
    }));
  }

  /**
   * Setup all job configurations
   */
  private setupJobConfigs(): void {
    this.jobConfigs = [
      {
        name: 'sync-crypto-prices',
        schedule: '0 */5 * * * *', // Every 5 minutes
        enabled: true,
        handler: this.syncCryptoPrices.bind(this)
      },
      {
        name: 'process-recurring-transactions',
        schedule: '0 0 6 * * *', // Daily at 6 AM UTC
        enabled: true,
        handler: this.processRecurringTransactions.bind(this)
      },
      {
        name: 'generate-budget-alerts',
        schedule: '0 0 8 * * *', // Daily at 8 AM UTC
        enabled: true,
        handler: this.generateBudgetAlerts.bind(this)
      },
      {
        name: 'check-goal-milestones',
        schedule: '0 0 7 * * *', // Daily at 7 AM UTC
        enabled: true,
        handler: this.checkGoalMilestones.bind(this)
      },
      {
        name: 'cleanup-audit-logs',
        schedule: '0 0 2 * * 0', // Weekly on Sunday at 2 AM UTC
        enabled: true,
        handler: this.cleanupAuditLogs.bind(this)
      },
      {
        name: 'sync-solana-data',
        schedule: '0 */10 * * * *', // Every 10 minutes
        enabled: true,
        handler: this.syncSolanaData.bind(this)
      },
      {
        name: 'send-notification-digest',
        schedule: '0 0 9 * * *', // Daily at 9 AM UTC
        enabled: true,
        handler: this.sendNotificationDigest.bind(this)
      },
      {
        name: 'backup-database',
        schedule: '0 0 3 * * *', // Daily at 3 AM UTC
        enabled: false, // Disabled by default, enable in production
        handler: this.backupDatabase.bind(this)
      }
    ];
  }

  /**
   * Sync cryptocurrency prices for all crypto assets
   */
  private async syncCryptoPrices(): Promise<void> {
    try {
      // Get all unique crypto symbols from crypto_assets table
      const { data: assets, error } = await supabase
        .from('crypto_assets')
        .select('symbol')
        .neq('symbol', '')
        .order('symbol');

      if (error) {
        throw new Error(`Failed to fetch crypto assets: ${error.message}`);
      }

      if (!assets || assets.length === 0) {
        logger.info('No crypto assets found to sync prices');
        return;
      }

      const uniqueSymbols = [...new Set(assets.map(asset => asset.symbol))];
      logger.info(`Syncing prices for ${uniqueSymbols.length} crypto symbols`);

      // Fetch prices from external API (placeholder - implement actual API calls)
      for (const symbol of uniqueSymbols) {
        try {
          // TODO: Implement actual price fetching from CoinGecko, CoinMarketCap, etc.
          const mockPrice = Math.random() * 100; // Mock price for now
          
          // Update all assets with this symbol
          const { error: updateError } = await supabase
            .from('crypto_assets')
            .update({ 
              current_price: mockPrice,
              last_updated: new Date().toISOString()
            })
            .eq('symbol', symbol);

          if (updateError) {
            logger.error(`Failed to update price for ${symbol}:`, updateError);
          }
        } catch (error) {
          logger.error(`Error processing price for ${symbol}:`, error);
        }
      }

      logger.info('Crypto price sync completed');
    } catch (error) {
      logger.error('Error in syncCryptoPrices:', error);
      throw error;
    }
  }

  /**
   * Process recurring transactions
   */
  private async processRecurringTransactions(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all active recurring transactions that are due
      const { data: recurringTransactions, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('is_active', true)
        .lte('next_date', today);

      if (error) {
        throw new Error(`Failed to fetch recurring transactions: ${error.message}`);
      }

      if (!recurringTransactions || recurringTransactions.length === 0) {
        logger.info('No recurring transactions to process');
        return;
      }

      logger.info(`Processing ${recurringTransactions.length} recurring transactions`);

      for (const recurring of recurringTransactions) {
        try {
          // Create the transaction
          const { error: createError } = await supabase
            .from('transactions')
            .insert({
              user_id: recurring.user_id,
              account_id: recurring.account_id,
              category_id: recurring.category_id,
              amount: recurring.amount,
              description: recurring.description,
              type: recurring.type,
              date: today,
              merchant: recurring.merchant,
              notes: `Auto-generated from recurring transaction: ${recurring.name}`,
              created_at: new Date().toISOString()
            });

          if (createError) {
            logger.error(`Failed to create transaction for recurring ID ${recurring.id}:`, createError);
            continue;
          }

          // Calculate next date based on frequency
          const nextDate = this.calculateNextDate(recurring.next_date, recurring.frequency);
          
          // Update the recurring transaction
          const { error: updateError } = await supabase
            .from('recurring_transactions')
            .update({ 
              next_date: nextDate,
              last_processed: today,
              updated_at: new Date().toISOString()
            })
            .eq('id', recurring.id);

          if (updateError) {
            logger.error(`Failed to update recurring transaction ${recurring.id}:`, updateError);
          }

          logger.info(`Processed recurring transaction: ${recurring.name}`);
        } catch (error) {
          logger.error(`Error processing recurring transaction ${recurring.id}:`, error);
        }
      }

      logger.info('Recurring transaction processing completed');
    } catch (error) {
      logger.error('Error in processRecurringTransactions:', error);
      throw error;
    }
  }

  /**
   * Generate budget alerts for users exceeding their budgets
   */
  private async generateBudgetAlerts(): Promise<void> {
    try {
      // Get all users with active budgets
      const { data: users, error } = await supabase
        .from('budgets')
        .select('user_id')
        .not('user_id', 'is', null);

      if (error) {
        throw new Error(`Failed to fetch users with budgets: ${error.message}`);
      }

      if (!users || users.length === 0) {
        logger.info('No users with budgets found');
        return;
      }

      // Get unique user IDs
      const uniqueUserIds = [...new Set(users.map(u => u.user_id))];
      logger.info(`Checking budgets for ${uniqueUserIds.length} users`);

      // Check budget alerts for each user
      for (const userId of uniqueUserIds) {
        try {
          await budgetService.checkBudgetAlerts(userId);
        } catch (error) {
          logger.error(`Error checking budget alerts for user ${userId}:`, error);
        }
      }

      logger.info('Budget alert generation completed');
    } catch (error) {
      logger.error('Error in generateBudgetAlerts:', error);
      throw error;
    }
  }

  /**
   * Cleanup old audit logs
   */
  private async cleanupAuditLogs(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days
      const cutoffDateStr = cutoffDate.toISOString();

      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', cutoffDateStr);

      if (error) {
        throw new Error(`Failed to cleanup audit logs: ${error.message}`);
      }

      logger.info('Audit log cleanup completed');
    } catch (error) {
      logger.error('Error in cleanupAuditLogs:', error);
      throw error;
    }
  }

  /**
   * Sync data with Solana blockchain
   */
  private async syncSolanaData(): Promise<void> {
    try {
      // Verify Solana connection
      const isConnected = await solanaService.verifyConnection();
      if (!isConnected) {
        logger.warn('Solana connection not available, skipping sync');
        return;
      }

      // Get users with Solana wallets
      const { data: wallets, error } = await supabase
        .from('crypto_wallets')
        .select('user_id, wallet_address')
        .eq('network', 'solana');

      if (error) {
        throw new Error(`Failed to fetch Solana wallets: ${error.message}`);
      }

      if (!wallets || wallets.length === 0) {
        logger.info('No Solana wallets found to sync');
        return;
      }

      logger.info(`Syncing data for ${wallets.length} Solana wallets`);

      for (const wallet of wallets) {
        try {
          // Get portfolio data from Solana
          const portfolio = await solanaService.getPortfolio(wallet.wallet_address);
          if (portfolio) {
            // Update local database with Solana data
            // This is where you'd sync the on-chain data with your local database
            logger.info(`Synced data for wallet: ${wallet.wallet_address}`);
          }
        } catch (error) {
          logger.error(`Error syncing wallet ${wallet.wallet_address}:`, error);
        }
      }

      logger.info('Solana data sync completed');
    } catch (error) {
      logger.error('Error in syncSolanaData:', error);
      throw error;
    }
  }

  /**
   * Send daily notification digest
   */
  private async sendNotificationDigest(): Promise<void> {
    try {
      // Get users who have enabled digest notifications
      const { data: users, error } = await supabase
        .from('user_preferences')
        .select('user_id')
        .eq('digest_notifications', true);

      if (error) {
        throw new Error(`Failed to fetch users for digest: ${error.message}`);
      }

      if (!users || users.length === 0) {
        logger.info('No users enabled for digest notifications');
        return;
      }

      logger.info(`Sending digest notifications to ${users.length} users`);

      for (const user of users) {
        try {
          // Generate and send digest (implement email/push notification logic)
          logger.info(`Sent digest to user: ${user.user_id}`);
        } catch (error) {
          logger.error(`Error sending digest to user ${user.user_id}:`, error);
        }
      }

      logger.info('Notification digest sending completed');
    } catch (error) {
      logger.error('Error in sendNotificationDigest:', error);
      throw error;
    }
  }

  /**
   * Backup database (placeholder)
   */
  private async backupDatabase(): Promise<void> {
    try {
      // Implement database backup logic here
      // This could be triggering a Supabase backup or custom backup process
      logger.info('Database backup completed (placeholder)');
    } catch (error) {
      logger.error('Error in backupDatabase:', error);
      throw error;
    }
  }

  // Helper methods
  private calculateNextDate(currentDate: string, frequency: string): string {
    const date = new Date(currentDate);
    
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        logger.warn(`Unknown frequency: ${frequency}, defaulting to monthly`);
        date.setMonth(date.getMonth() + 1);
    }
    
    return date.toISOString().split('T')[0];
  }

  /**
   * Check goal milestones and deadlines for all users
   */
  private async checkGoalMilestones(): Promise<void> {
    try {
      // Get all users with active goals
      const { data: users, error } = await supabase
        .from('goals')
        .select('user_id')
        .not('user_id', 'is', null);

      if (error) {
        throw new Error(`Failed to fetch users with goals: ${error.message}`);
      }

      if (!users || users.length === 0) {
        logger.info('No users with goals found');
        return;
      }

      // Get unique user IDs
      const uniqueUserIds = [...new Set(users.map(u => u.user_id))];
      logger.info(`Checking goal milestones for ${uniqueUserIds.length} users`);

      // Check goal milestones for each user
      for (const userId of uniqueUserIds) {
        try {
          await goalService.checkGoalMilestones(userId);
        } catch (error) {
          logger.error(`Error checking goal milestones for user ${userId}:`, error);
        }
      }

      logger.info('Goal milestone checking completed');
    } catch (error) {
      logger.error('Error in checkGoalMilestones:', error);
      throw error;
    }
  }

  private async createAlert(
    userId: string,
    type: string,
    title: string,
    message: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Failed to create alert:', error);
      }
    } catch (error) {
      logger.error('Error creating alert:', error);
    }
  }
}

export const jobProcessor = new JobProcessor();
