import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../../utils/logger';
import { AuthenticatedRequest, auth } from '../../middleware/auth';
import { rateLimitStrict } from '../../middleware/rateLimiter';
import { solanaService } from '../../services/solana.service';
import {
  InitializePortfolioRequest,
  AddAssetRequest,
  UpdateAssetRequest,
  RecordTransactionRequest,
  CreateGoalRequest,
  UpdateGoalProgressRequest,
  SolanaServiceError
} from '../../types/solana';

const router = Router();

// Apply authentication and rate limiting to all routes
router.use(auth);
router.use(rateLimitStrict);

/**
 * @route   GET /api/solana/status
 * @desc    Get Solana connection status
 * @access  Private
 */
router.get('/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const connectionStatus = solanaService.getConnectionStatus();
    const isConnected = await solanaService.verifyConnection();
    const currentSlot = await solanaService.getCurrentSlot();

    res.json({
      ...connectionStatus,
      connected: isConnected,
      current_slot: currentSlot,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error checking Solana status:', error);
    res.status(500).json({ error: 'Failed to check Solana status' });
  }
});

/**
 * @route   POST /api/solana/portfolio/initialize
 * @desc    Initialize a new Solana portfolio for user
 * @access  Private
 */
router.post('/portfolio/initialize', [
  body('user_public_key').isString().notEmpty().withMessage('User public key is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const request: InitializePortfolioRequest = {
      userPublicKey: req.body.user_public_key
    };

    const result = await solanaService.initializePortfolio(request);

    logger.info(`Solana portfolio initialized for user: ${req.user!.id}, wallet: ${request.userPublicKey}`);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Error initializing Solana portfolio:', error);
    if (error instanceof SolanaServiceError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to initialize Solana portfolio' });
    }
  }
});

/**
 * @route   GET /api/solana/portfolio/:publicKey
 * @desc    Get Solana portfolio data
 * @access  Private
 */
router.get('/portfolio/:publicKey', [
  param('publicKey').isString().notEmpty().withMessage('Public key is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const portfolio = await solanaService.getPortfolio(req.params.publicKey);
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    res.json(portfolio);
  } catch (error) {
    logger.error('Error fetching Solana portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch Solana portfolio' });
  }
});

/**
 * @route   POST /api/solana/assets
 * @desc    Add crypto asset to Solana portfolio
 * @access  Private
 */
router.post('/assets', [
  body('user_public_key').isString().notEmpty().withMessage('User public key is required'),
  body('symbol').isString().notEmpty().withMessage('Asset symbol is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('price_usd').isFloat({ min: 0 }).withMessage('Price USD must be a positive number'),
  body('network').isString().notEmpty().withMessage('Network is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const request: AddAssetRequest = {
      userPublicKey: req.body.user_public_key,
      symbol: req.body.symbol,
      amount: req.body.amount,
      priceUsd: req.body.price_usd,
      network: req.body.network
    };

    const result = await solanaService.addAsset(request);

    logger.info(`Crypto asset added to Solana portfolio: ${request.symbol} for user: ${req.user!.id}`);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Error adding crypto asset:', error);
    if (error instanceof SolanaServiceError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to add crypto asset' });
    }
  }
});

/**
 * @route   PUT /api/solana/assets/:assetPublicKey
 * @desc    Update crypto asset in Solana portfolio
 * @access  Private
 */
router.put('/assets/:assetPublicKey', [
  param('assetPublicKey').isString().notEmpty().withMessage('Asset public key is required'),
  body('user_public_key').isString().notEmpty().withMessage('User public key is required'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('price_usd').optional().isFloat({ min: 0 }).withMessage('Price USD must be a positive number'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const request: UpdateAssetRequest = {
      userPublicKey: req.body.user_public_key,
      assetPublicKey: req.params.assetPublicKey,
      amount: req.body.amount,
      priceUsd: req.body.price_usd
    };

    const result = await solanaService.updateAsset(request);

    logger.info(`Crypto asset updated in Solana portfolio: ${req.params.assetPublicKey} for user: ${req.user!.id}`);
    res.json(result);
  } catch (error) {
    logger.error('Error updating crypto asset:', error);
    if (error instanceof SolanaServiceError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update crypto asset' });
    }
  }
});

/**
 * @route   GET /api/solana/assets/:publicKey
 * @desc    Get crypto assets for a portfolio
 * @access  Private
 */
router.get('/assets/:publicKey', [
  param('publicKey').isString().notEmpty().withMessage('Public key is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const assets = await solanaService.getAssets(req.params.publicKey);
    res.json(assets);
  } catch (error) {
    logger.error('Error fetching crypto assets:', error);
    res.status(500).json({ error: 'Failed to fetch crypto assets' });
  }
});

/**
 * @route   POST /api/solana/transactions
 * @desc    Record transaction on Solana blockchain
 * @access  Private
 */
router.post('/transactions', [
  body('user_public_key').isString().notEmpty().withMessage('User public key is required'),
  body('transaction_id').isString().notEmpty().withMessage('Transaction ID is required'),
  body('amount').isFloat().withMessage('Amount is required'),
  body('transaction_type').isString().notEmpty().withMessage('Transaction type is required'),
  body('category').isString().notEmpty().withMessage('Category is required'),
  body('description').isString().notEmpty().withMessage('Description is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const request: RecordTransactionRequest = {
      userPublicKey: req.body.user_public_key,
      transactionId: req.body.transaction_id,
      amount: req.body.amount,
      transactionType: req.body.transaction_type,
      category: req.body.category,
      description: req.body.description
    };

    const result = await solanaService.recordTransaction(request);

    logger.info(`Transaction recorded on Solana: ${request.transactionId} for user: ${req.user!.id}`);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Error recording Solana transaction:', error);
    if (error instanceof SolanaServiceError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to record Solana transaction' });
    }
  }
});

/**
 * @route   GET /api/solana/transactions/:publicKey
 * @desc    Get Solana transactions for a portfolio
 * @access  Private
 */
router.get('/transactions/:publicKey', [
  param('publicKey').isString().notEmpty().withMessage('Public key is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const transactions = await solanaService.getTransactions(req.params.publicKey);
    res.json(transactions);
  } catch (error) {
    logger.error('Error fetching Solana transactions:', error);
    res.status(500).json({ error: 'Failed to fetch Solana transactions' });
  }
});

/**
 * @route   POST /api/solana/goals
 * @desc    Create financial goal on Solana blockchain
 * @access  Private
 */
router.post('/goals', [
  body('user_public_key').isString().notEmpty().withMessage('User public key is required'),
  body('name').isString().notEmpty().withMessage('Goal name is required'),
  body('target_amount').isFloat({ min: 0 }).withMessage('Target amount must be a positive number'),
  body('target_date').isISO8601().withMessage('Target date must be a valid ISO 8601 date'),
  body('category').isString().notEmpty().withMessage('Category is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const request: CreateGoalRequest = {
      userPublicKey: req.body.user_public_key,
      name: req.body.name,
      targetAmount: req.body.target_amount,
      targetDate: req.body.target_date,
      category: req.body.category
    };

    const result = await solanaService.createGoal(request);

    logger.info(`Financial goal created on Solana: ${request.name} for user: ${req.user!.id}`);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating Solana goal:', error);
    if (error instanceof SolanaServiceError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create Solana goal' });
    }
  }
});

/**
 * @route   PUT /api/solana/goals/:goalPublicKey/progress
 * @desc    Update goal progress on Solana blockchain
 * @access  Private
 */
router.put('/goals/:goalPublicKey/progress', [
  param('goalPublicKey').isString().notEmpty().withMessage('Goal public key is required'),
  body('user_public_key').isString().notEmpty().withMessage('User public key is required'),
  body('amount_to_add').isFloat({ min: 0 }).withMessage('Amount to add must be a positive number'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const request: UpdateGoalProgressRequest = {
      userPublicKey: req.body.user_public_key,
      goalPublicKey: req.params.goalPublicKey,
      amountToAdd: req.body.amount_to_add
    };

    const result = await solanaService.updateGoalProgress(request);

    logger.info(`Goal progress updated on Solana: ${req.params.goalPublicKey} for user: ${req.user!.id}`);
    res.json(result);
  } catch (error) {
    logger.error('Error updating Solana goal progress:', error);
    if (error instanceof SolanaServiceError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update Solana goal progress' });
    }
  }
});

/**
 * @route   GET /api/solana/goals/:publicKey
 * @desc    Get financial goals for a portfolio
 * @access  Private
 */
router.get('/goals/:publicKey', [
  param('publicKey').isString().notEmpty().withMessage('Public key is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const goals = await solanaService.getGoals(req.params.publicKey);
    res.json(goals);
  } catch (error) {
    logger.error('Error fetching Solana goals:', error);
    res.status(500).json({ error: 'Failed to fetch Solana goals' });
  }
});

/**
 * @route   GET /api/solana/wallet/:publicKey
 * @desc    Get wallet information including balance and portfolio status
 * @access  Private
 */
router.get('/wallet/:publicKey', [
  param('publicKey').isString().notEmpty().withMessage('Public key is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const walletInfo = await solanaService.getWalletInfo(req.params.publicKey);
    res.json(walletInfo);
  } catch (error) {
    logger.error('Error fetching wallet info:', error);
    if (error instanceof SolanaServiceError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch wallet information' });
    }
  }
});

export { router as solanaRoutes };
