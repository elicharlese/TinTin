use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod tintin_finance {
    use super::*;

    /// Initialize a new user portfolio
    pub fn initialize_portfolio(
        ctx: Context<InitializePortfolio>,
        portfolio_bump: u8,
    ) -> Result<()> {
        let portfolio = &mut ctx.accounts.portfolio;
        portfolio.owner = ctx.accounts.user.key();
        portfolio.bump = portfolio_bump;
        portfolio.total_assets = 0;
        portfolio.total_value_usd = 0;
        portfolio.created_at = Clock::get()?.unix_timestamp;
        portfolio.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("Portfolio initialized for user: {}", ctx.accounts.user.key());
        Ok(())
    }

    /// Add a crypto asset to the portfolio
    pub fn add_asset(
        ctx: Context<AddAsset>,
        symbol: String,
        amount: u64,
        price_usd: u64,
        network: String,
    ) -> Result<()> {
        let portfolio = &mut ctx.accounts.portfolio;
        let asset = &mut ctx.accounts.asset;
        
        asset.portfolio = portfolio.key();
        asset.symbol = symbol;
        asset.amount = amount;
        asset.price_usd = price_usd;
        asset.network = network;
        asset.last_updated = Clock::get()?.unix_timestamp;
        
        // Update portfolio totals
        portfolio.total_assets += 1;
        portfolio.total_value_usd += (amount * price_usd) / 1_000_000; // Assuming 6 decimal precision
        portfolio.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("Asset {} added to portfolio", asset.symbol);
        Ok(())
    }

    /// Update asset price and amount
    pub fn update_asset(
        ctx: Context<UpdateAsset>,
        amount: Option<u64>,
        price_usd: Option<u64>,
    ) -> Result<()> {
        let portfolio = &mut ctx.accounts.portfolio;
        let asset = &mut ctx.accounts.asset;
        
        let old_value = (asset.amount * asset.price_usd) / 1_000_000;
        
        if let Some(new_amount) = amount {
            asset.amount = new_amount;
        }
        
        if let Some(new_price) = price_usd {
            asset.price_usd = new_price;
        }
        
        let new_value = (asset.amount * asset.price_usd) / 1_000_000;
        
        // Update portfolio total value
        portfolio.total_value_usd = portfolio.total_value_usd - old_value + new_value;
        portfolio.updated_at = Clock::get()?.unix_timestamp;
        asset.last_updated = Clock::get()?.unix_timestamp;
        
        msg!("Asset {} updated", asset.symbol);
        Ok(())
    }

    /// Record a transaction on-chain for audit trail
    pub fn record_transaction(
        ctx: Context<RecordTransaction>,
        transaction_id: String,
        amount: i64,
        transaction_type: String,
        category: String,
        description: String,
    ) -> Result<()> {
        let transaction = &mut ctx.accounts.transaction;
        let portfolio = &mut ctx.accounts.portfolio;
        
        transaction.portfolio = portfolio.key();
        transaction.transaction_id = transaction_id;
        transaction.amount = amount;
        transaction.transaction_type = transaction_type;
        transaction.category = category;
        transaction.description = description;
        transaction.timestamp = Clock::get()?.unix_timestamp;
        
        portfolio.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("Transaction recorded: {}", transaction.transaction_id);
        Ok(())
    }

    /// Create a financial goal on-chain
    pub fn create_goal(
        ctx: Context<CreateGoal>,
        name: String,
        target_amount: u64,
        target_date: i64,
        category: String,
    ) -> Result<()> {
        let goal = &mut ctx.accounts.goal;
        let portfolio = &mut ctx.accounts.portfolio;
        
        goal.portfolio = portfolio.key();
        goal.name = name;
        goal.target_amount = target_amount;
        goal.current_amount = 0;
        goal.target_date = target_date;
        goal.category = category;
        goal.is_completed = false;
        goal.created_at = Clock::get()?.unix_timestamp;
        goal.updated_at = Clock::get()?.unix_timestamp;
        
        portfolio.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("Goal created: {}", goal.name);
        Ok(())
    }

    /// Update goal progress
    pub fn update_goal_progress(
        ctx: Context<UpdateGoalProgress>,
        amount_to_add: u64,
    ) -> Result<()> {
        let goal = &mut ctx.accounts.goal;
        let portfolio = &mut ctx.accounts.portfolio;
        
        goal.current_amount += amount_to_add;
        
        if goal.current_amount >= goal.target_amount {
            goal.is_completed = true;
            msg!("Goal completed: {}", goal.name);
        }
        
        goal.updated_at = Clock::get()?.unix_timestamp;
        portfolio.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }
}

// Account structures
#[derive(Accounts)]
#[instruction(portfolio_bump: u8)]
pub struct InitializePortfolio<'info> {
    #[account(
        init,
        payer = user,
        space = Portfolio::LEN,
        seeds = [b"portfolio", user.key().as_ref()],
        bump = portfolio_bump
    )]
    pub portfolio: Account<'info, Portfolio>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddAsset<'info> {
    #[account(
        mut,
        seeds = [b"portfolio", portfolio.owner.as_ref()],
        bump = portfolio.bump
    )]
    pub portfolio: Account<'info, Portfolio>,
    #[account(
        init,
        payer = user,
        space = CryptoAsset::LEN,
    )]
    pub asset: Account<'info, CryptoAsset>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAsset<'info> {
    #[account(
        mut,
        seeds = [b"portfolio", portfolio.owner.as_ref()],
        bump = portfolio.bump
    )]
    pub portfolio: Account<'info, Portfolio>,
    #[account(mut, has_one = portfolio)]
    pub asset: Account<'info, CryptoAsset>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct RecordTransaction<'info> {
    #[account(
        mut,
        seeds = [b"portfolio", portfolio.owner.as_ref()],
        bump = portfolio.bump
    )]
    pub portfolio: Account<'info, Portfolio>,
    #[account(
        init,
        payer = user,
        space = TransactionRecord::LEN,
    )]
    pub transaction: Account<'info, TransactionRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateGoal<'info> {
    #[account(
        mut,
        seeds = [b"portfolio", portfolio.owner.as_ref()],
        bump = portfolio.bump
    )]
    pub portfolio: Account<'info, Portfolio>,
    #[account(
        init,
        payer = user,
        space = FinancialGoal::LEN,
    )]
    pub goal: Account<'info, FinancialGoal>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateGoalProgress<'info> {
    #[account(
        mut,
        seeds = [b"portfolio", portfolio.owner.as_ref()],
        bump = portfolio.bump
    )]
    pub portfolio: Account<'info, Portfolio>,
    #[account(mut, has_one = portfolio)]
    pub goal: Account<'info, FinancialGoal>,
    pub user: Signer<'info>,
}

// Data structures
#[account]
pub struct Portfolio {
    pub owner: Pubkey,
    pub bump: u8,
    pub total_assets: u32,
    pub total_value_usd: u64,
    pub created_at: i64,
    pub updated_at: i64,
}

impl Portfolio {
    const LEN: usize = 8 + 32 + 1 + 4 + 8 + 8 + 8;
}

#[account]
pub struct CryptoAsset {
    pub portfolio: Pubkey,
    pub symbol: String,
    pub amount: u64,
    pub price_usd: u64,
    pub network: String,
    pub last_updated: i64,
}

impl CryptoAsset {
    const LEN: usize = 8 + 32 + 4 + 32 + 8 + 8 + 4 + 32 + 8;
}

#[account]
pub struct TransactionRecord {
    pub portfolio: Pubkey,
    pub transaction_id: String,
    pub amount: i64,
    pub transaction_type: String,
    pub category: String,
    pub description: String,
    pub timestamp: i64,
}

impl TransactionRecord {
    const LEN: usize = 8 + 32 + 4 + 64 + 8 + 4 + 32 + 4 + 32 + 4 + 128 + 8;
}

#[account]
pub struct FinancialGoal {
    pub portfolio: Pubkey,
    pub name: String,
    pub target_amount: u64,
    pub current_amount: u64,
    pub target_date: i64,
    pub category: String,
    pub is_completed: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

impl FinancialGoal {
    const LEN: usize = 8 + 32 + 4 + 64 + 8 + 8 + 8 + 4 + 32 + 1 + 8 + 8;
}

// Custom errors
#[error_code]
pub enum TinTinError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Asset not found")]
    AssetNotFound,
    #[msg("Goal already completed")]
    GoalAlreadyCompleted,
}
