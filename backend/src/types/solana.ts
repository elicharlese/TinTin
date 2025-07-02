// Placeholder types until Solana dependencies are installed
export interface PublicKey {
  toBase58(): string;
  toBuffer(): Buffer;
}

export interface BN {
  toString(): string;
  toNumber(): number;
}

// IDL Type definitions for TinTin Finance Solana Program
export interface TinTinFinanceIDL {
  version: string;
  name: string;
  instructions: Instruction[];
  accounts: Account[];
  errors: ErrorDef[];
}

export interface Instruction {
  name: string;
  accounts: AccountItem[];
  args: Arg[];
}

export interface AccountItem {
  name: string;
  isMut: boolean;
  isSigner: boolean;
  docs?: string[];
}

export interface Arg {
  name: string;
  type: string;
}

export interface Account {
  name: string;
  type: AccountType;
}

export interface AccountType {
  kind: string;
  fields: Field[];
}

export interface Field {
  name: string;
  type: string;
}

export interface ErrorDef {
  code: number;
  name: string;
  msg: string;
}

// Portfolio Account Structure
export interface PortfolioAccount {
  owner: PublicKey;
  bump: number;
  totalAssets: number;
  totalValueUsd: BN;
  createdAt: BN;
  updatedAt: BN;
}

// Crypto Asset Account Structure
export interface CryptoAssetAccount {
  portfolio: PublicKey;
  symbol: string;
  amount: BN;
  priceUsd: BN;
  network: string;
  lastUpdated: BN;
}

// Transaction Record Account Structure
export interface TransactionRecordAccount {
  portfolio: PublicKey;
  transactionId: string;
  amount: BN;
  transactionType: string;
  category: string;
  description: string;
  timestamp: BN;
}

// Financial Goal Account Structure
export interface FinancialGoalAccount {
  portfolio: PublicKey;
  name: string;
  targetAmount: BN;
  currentAmount: BN;
  targetDate: BN;
  category: string;
  isCompleted: boolean;
  createdAt: BN;
  updatedAt: BN;
}

// API Request/Response Types for Solana Service
export interface InitializePortfolioRequest {
  userPublicKey: string;
}

export interface AddAssetRequest {
  userPublicKey: string;
  symbol: string;
  amount: number;
  priceUsd: number;
  network: string;
}

export interface UpdateAssetRequest {
  userPublicKey: string;
  assetPublicKey: string;
  amount?: number;
  priceUsd?: number;
}

export interface RecordTransactionRequest {
  userPublicKey: string;
  transactionId: string;
  amount: number;
  transactionType: string;
  category: string;
  description: string;
}

export interface CreateGoalRequest {
  userPublicKey: string;
  name: string;
  targetAmount: number;
  targetDate: string; // ISO date string
  category: string;
}

export interface UpdateGoalProgressRequest {
  userPublicKey: string;
  goalPublicKey: string;
  amountToAdd: number;
}

// Response Types
export interface SolanaTransactionResponse {
  signature: string;
  slot?: number;
  confirmationStatus?: string;
}

export interface PortfolioResponse {
  publicKey: string;
  account: PortfolioAccount;
}

export interface AssetResponse {
  publicKey: string;
  account: CryptoAssetAccount;
}

export interface TransactionResponse {
  publicKey: string;
  account: TransactionRecordAccount;
}

export interface GoalResponse {
  publicKey: string;
  account: FinancialGoalAccount;
}

// Error Types
export enum SolanaErrorCodes {
  UNAUTHORIZED = 6000,
  INVALID_AMOUNT = 6001,
  ASSET_NOT_FOUND = 6002,
  GOAL_ALREADY_COMPLETED = 6003,
}

export class SolanaServiceError extends Error {
  constructor(
    message: string,
    public code?: SolanaErrorCodes,
    public programErrorCode?: number
  ) {
    super(message);
    this.name = 'SolanaServiceError';
  }
}

// Connection Status
export interface SolanaConnectionStatus {
  connected: boolean;
  cluster: string;
  version?: string;
  slot?: number;
}

// Wallet Integration Types
export interface WalletInfo {
  publicKey: string;
  balance: number; // SOL balance
  hasPortfolio: boolean;
}

// Program Constants
export const PROGRAM_CONSTANTS = {
  PORTFOLIO_SEED: 'portfolio',
  ASSET_SEED: 'asset',
  TRANSACTION_SEED: 'transaction',
  GOAL_SEED: 'goal',
  DISCRIMINATOR_LENGTH: 8,
  PUBKEY_LENGTH: 32,
  STRING_PREFIX_LENGTH: 4,
  U64_LENGTH: 8,
  I64_LENGTH: 8,
  U32_LENGTH: 4,
  U8_LENGTH: 1,
  BOOL_LENGTH: 1,
} as const;

// Account Size Calculations
export const ACCOUNT_SIZES = {
  PORTFOLIO: PROGRAM_CONSTANTS.DISCRIMINATOR_LENGTH + 
             PROGRAM_CONSTANTS.PUBKEY_LENGTH + 
             PROGRAM_CONSTANTS.U8_LENGTH + 
             PROGRAM_CONSTANTS.U32_LENGTH + 
             PROGRAM_CONSTANTS.U64_LENGTH + 
             PROGRAM_CONSTANTS.I64_LENGTH + 
             PROGRAM_CONSTANTS.I64_LENGTH,
  
  CRYPTO_ASSET: PROGRAM_CONSTANTS.DISCRIMINATOR_LENGTH + 
                PROGRAM_CONSTANTS.PUBKEY_LENGTH + 
                PROGRAM_CONSTANTS.STRING_PREFIX_LENGTH + 32 + // symbol
                PROGRAM_CONSTANTS.U64_LENGTH + 
                PROGRAM_CONSTANTS.U64_LENGTH + 
                PROGRAM_CONSTANTS.STRING_PREFIX_LENGTH + 32 + // network
                PROGRAM_CONSTANTS.I64_LENGTH,
  
  TRANSACTION_RECORD: PROGRAM_CONSTANTS.DISCRIMINATOR_LENGTH + 
                      PROGRAM_CONSTANTS.PUBKEY_LENGTH + 
                      PROGRAM_CONSTANTS.STRING_PREFIX_LENGTH + 64 + // transaction_id
                      PROGRAM_CONSTANTS.I64_LENGTH + 
                      PROGRAM_CONSTANTS.STRING_PREFIX_LENGTH + 32 + // transaction_type
                      PROGRAM_CONSTANTS.STRING_PREFIX_LENGTH + 32 + // category
                      PROGRAM_CONSTANTS.STRING_PREFIX_LENGTH + 128 + // description
                      PROGRAM_CONSTANTS.I64_LENGTH,
  
  FINANCIAL_GOAL: PROGRAM_CONSTANTS.DISCRIMINATOR_LENGTH + 
                  PROGRAM_CONSTANTS.PUBKEY_LENGTH + 
                  PROGRAM_CONSTANTS.STRING_PREFIX_LENGTH + 64 + // name
                  PROGRAM_CONSTANTS.U64_LENGTH + 
                  PROGRAM_CONSTANTS.U64_LENGTH + 
                  PROGRAM_CONSTANTS.I64_LENGTH + 
                  PROGRAM_CONSTANTS.STRING_PREFIX_LENGTH + 32 + // category
                  PROGRAM_CONSTANTS.BOOL_LENGTH + 
                  PROGRAM_CONSTANTS.I64_LENGTH + 
                  PROGRAM_CONSTANTS.I64_LENGTH,
} as const;
