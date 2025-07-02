import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor'
import { config } from '@/config'
import { logger } from '@/utils/logger'

/**
 * Solana service for interacting with the TinTin Finance program
 */
export class SolanaService {
  private connection: Connection
  private program: Program | null = null
  private wallet: Wallet | null = null
  private programId: PublicKey

  constructor() {
    this.connection = new Connection(config.solana.rpcUrl, 'confirmed')
    this.programId = new PublicKey(config.solana.programId || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
    
    if (config.solana.privateKey) {
      const keypair = Keypair.fromSecretKey(
        Buffer.from(config.solana.privateKey, 'base64')
      )
      this.wallet = new Wallet(keypair)
    }
  }

  /**
   * Initialize the Anchor program
   */
  private async initializeProgram(): Promise<void> {
    if (!this.wallet) {
      throw new Error('Wallet not configured')
    }

    const provider = new AnchorProvider(this.connection, this.wallet, {
      commitment: 'confirmed',
    })

    // Load the IDL (Interface Definition Language) for the program
    // In a real implementation, you would load this from a file or URL
    const idl = await this.loadProgramIdl()
    this.program = new Program(idl, this.programId, provider)
  }

  /**
   * Load the program IDL
   * This is a placeholder - in production, load from the actual compiled IDL
   */
  private async loadProgramIdl(): Promise<any> {
    // This would typically be loaded from the compiled program
    return {
      version: '0.1.0',
      name: 'tintin_finance',
      instructions: [
        {
          name: 'initializePortfolio',
          accounts: [
            { name: 'portfolio', isMut: true, isSigner: false },
            { name: 'user', isMut: true, isSigner: true },
            { name: 'systemProgram', isMut: false, isSigner: false },
          ],
          args: [{ name: 'portfolioBump', type: 'u8' }],
        },
        {
          name: 'addAsset',
          accounts: [
            { name: 'portfolio', isMut: true, isSigner: false },
            { name: 'asset', isMut: true, isSigner: false },
            { name: 'user', isMut: true, isSigner: true },
            { name: 'systemProgram', isMut: false, isSigner: false },
          ],
          args: [
            { name: 'symbol', type: 'string' },
            { name: 'amount', type: 'u64' },
            { name: 'priceUsd', type: 'u64' },
            { name: 'network', type: 'string' },
          ],
        },
      ],
      accounts: [
        {
          name: 'Portfolio',
          type: {
            kind: 'struct',
            fields: [
              { name: 'owner', type: 'publicKey' },
              { name: 'bump', type: 'u8' },
              { name: 'totalAssets', type: 'u32' },
              { name: 'totalValueUsd', type: 'u64' },
              { name: 'createdAt', type: 'i64' },
              { name: 'updatedAt', type: 'i64' },
            ],
          },
        },
      ],
    }
  }

  /**
   * Initialize a user portfolio on-chain
   */
  async initializePortfolio(userPublicKey: string): Promise<string> {
    try {
      if (!this.program) {
        await this.initializeProgram()
      }

      const userPubkey = new PublicKey(userPublicKey)
      
      // Derive portfolio PDA (Program Derived Address)
      const [portfolioPda, portfolioBump] = await PublicKey.findProgramAddress(
        [Buffer.from('portfolio'), userPubkey.toBuffer()],
        this.programId
      )

      const tx = await this.program!.methods
        .initializePortfolio(portfolioBump)
        .accounts({
          portfolio: portfolioPda,
          user: userPubkey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      logger.info('Portfolio initialized on Solana', {
        userPublicKey,
        portfolioPda: portfolioPda.toString(),
        transaction: tx,
      })

      return tx
    } catch (error) {
      logger.error('Failed to initialize portfolio on Solana', {
        error: error instanceof Error ? error.message : String(error),
        userPublicKey,
      })
      throw error
    }
  }

  /**
   * Add a crypto asset to the on-chain portfolio
   */
  async addAsset(
    userPublicKey: string,
    symbol: string,
    amount: number,
    priceUsd: number,
    network: string
  ): Promise<string> {
    try {
      if (!this.program) {
        await this.initializeProgram()
      }

      const userPubkey = new PublicKey(userPublicKey)
      
      // Derive portfolio PDA
      const [portfolioPda] = await PublicKey.findProgramAddress(
        [Buffer.from('portfolio'), userPubkey.toBuffer()],
        this.programId
      )

      // Generate a new keypair for the asset account
      const assetKeypair = Keypair.generate()

      const tx = await this.program!.methods
        .addAsset(
          symbol,
          new BN(amount * 1_000_000), // Convert to 6 decimal precision
          new BN(priceUsd * 1_000_000),
          network
        )
        .accounts({
          portfolio: portfolioPda,
          asset: assetKeypair.publicKey,
          user: userPubkey,
          systemProgram: SystemProgram.programId,
        })
        .signers([assetKeypair])
        .rpc()

      logger.info('Asset added to Solana portfolio', {
        userPublicKey,
        symbol,
        amount,
        priceUsd,
        network,
        assetAccount: assetKeypair.publicKey.toString(),
        transaction: tx,
      })

      return tx
    } catch (error) {
      logger.error('Failed to add asset to Solana portfolio', {
        error: error instanceof Error ? error.message : String(error),
        userPublicKey,
        symbol,
      })
      throw error
    }
  }

  /**
   * Record a transaction on-chain for audit trail
   */
  async recordTransaction(
    userPublicKey: string,
    transactionId: string,
    amount: number,
    transactionType: string,
    category: string,
    description: string
  ): Promise<string> {
    try {
      if (!this.program) {
        await this.initializeProgram()
      }

      const userPubkey = new PublicKey(userPublicKey)
      
      // Derive portfolio PDA
      const [portfolioPda] = await PublicKey.findProgramAddress(
        [Buffer.from('portfolio'), userPubkey.toBuffer()],
        this.programId
      )

      // Generate a new keypair for the transaction record
      const transactionKeypair = Keypair.generate()

      const tx = await this.program!.methods
        .recordTransaction(
          transactionId,
          new BN(amount * 100), // Convert to cents
          transactionType,
          category,
          description
        )
        .accounts({
          portfolio: portfolioPda,
          transaction: transactionKeypair.publicKey,
          user: userPubkey,
          systemProgram: SystemProgram.programId,
        })
        .signers([transactionKeypair])
        .rpc()

      logger.info('Transaction recorded on Solana', {
        userPublicKey,
        transactionId,
        amount,
        transactionType,
        category,
        onChainTransaction: tx,
      })

      return tx
    } catch (error) {
      logger.error('Failed to record transaction on Solana', {
        error: error instanceof Error ? error.message : String(error),
        userPublicKey,
        transactionId,
      })
      throw error
    }
  }

  /**
   * Get portfolio data from Solana
   */
  async getPortfolio(userPublicKey: string): Promise<any> {
    try {
      if (!this.program) {
        await this.initializeProgram()
      }

      const userPubkey = new PublicKey(userPublicKey)
      
      // Derive portfolio PDA
      const [portfolioPda] = await PublicKey.findProgramAddress(
        [Buffer.from('portfolio'), userPubkey.toBuffer()],
        this.programId
      )

      const portfolio = await this.program!.account.portfolio.fetch(portfolioPda)

      return {
        address: portfolioPda.toString(),
        owner: (portfolio.owner as any).toString(),
        totalAssets: portfolio.totalAssets,
        totalValueUsd: (portfolio.totalValueUsd as any).toNumber() / 1_000_000,
        createdAt: new Date((portfolio.createdAt as any).toNumber() * 1000),
        updatedAt: new Date((portfolio.updatedAt as any).toNumber() * 1000),
      }
    } catch (error) {
      logger.error('Failed to get portfolio from Solana', {
        error: error instanceof Error ? error.message : String(error),
        userPublicKey,
      })
      return null
    }
  }

  /**
   * Check Solana connection status
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.connection.getLatestBlockhash()
      return true
    } catch (error) {
      logger.error('Solana connection failed', {
        error: error instanceof Error ? error.message : String(error),
      })
      return false
    }
  }

  /**
   * Get SOL balance for a public key
   */
  async getBalance(publicKey: string): Promise<number> {
    try {
      const pubkey = new PublicKey(publicKey)
      const balance = await this.connection.getBalance(pubkey)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      logger.error('Failed to get SOL balance', {
        error: error instanceof Error ? error.message : String(error),
        publicKey,
      })
      return 0
    }
  }
}

// Export singleton instance
export const solanaService = new SolanaService()
