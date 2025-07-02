# TinTin Finance Backend API

A comprehensive backend service for the TinTin personal finance application, built with Node.js, TypeScript, Express, Supabase, and Solana blockchain integration.

## 🏗️ Architecture Overview

The backend follows a clean architecture pattern with the following layers:

- **API Layer**: Express.js routes with validation and middleware
- **Service Layer**: Business logic and external integrations
- **Data Layer**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Blockchain Layer**: Solana integration for crypto asset management
- **Job Processing**: Background tasks for data sync and notifications

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account and project
- Solana RPC endpoint (Devnet/Mainnet)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd backend

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migration:up

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=your_program_id
SOLANA_CLUSTER=devnet

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Security
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# External APIs
COINGECKO_API_KEY=your_coingecko_api_key
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
```

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following main entities:

### Core Tables

- **users**: User authentication and profile data
- **accounts**: Financial accounts (checking, savings, credit cards, etc.)
- **transactions**: All financial transactions
- **categories**: Transaction categories
- **tags**: Flexible tagging system for transactions
- **budgets**: Monthly/yearly budgeting
- **goals**: Financial goals tracking
- **alerts**: User notifications and alerts

### Crypto/Blockchain Tables

- **crypto_assets**: Cryptocurrency holdings
- **crypto_wallets**: Wallet addresses and metadata
- **solana_portfolios**: On-chain portfolio data
- **price_history**: Historical price data

### System Tables

- **audit_logs**: System audit trail
- **user_preferences**: User settings and preferences
- **recurring_transactions**: Scheduled recurring transactions

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/register       # User registration
POST   /api/auth/login          # User login
POST   /api/auth/logout         # User logout
GET    /api/auth/profile        # Get user profile
PUT    /api/auth/profile        # Update user profile
POST   /api/auth/forgot-password # Password reset
```

### Transactions
```
GET    /api/transactions        # List transactions with filtering
POST   /api/transactions        # Create new transaction
GET    /api/transactions/:id    # Get transaction details
PUT    /api/transactions/:id    # Update transaction
DELETE /api/transactions/:id    # Delete transaction
GET    /api/transactions/summary # Transaction summary stats
```

### Accounts
```
GET    /api/accounts            # List user accounts
POST   /api/accounts            # Create new account
GET    /api/accounts/:id        # Get account details
PUT    /api/accounts/:id        # Update account
DELETE /api/accounts/:id        # Delete account
GET    /api/accounts/:id/balance-history # Account balance over time
GET    /api/accounts/summary    # Accounts summary by type
```

### Solana Blockchain
```
GET    /api/solana/status       # Solana connection status
POST   /api/solana/portfolio/initialize # Initialize on-chain portfolio
GET    /api/solana/portfolio/:publicKey # Get portfolio data
POST   /api/solana/assets       # Add crypto asset
PUT    /api/solana/assets/:id   # Update crypto asset
GET    /api/solana/assets/:publicKey # Get portfolio assets
POST   /api/solana/transactions # Record on-chain transaction
GET    /api/solana/transactions/:publicKey # Get on-chain transactions
POST   /api/solana/goals        # Create on-chain goal
PUT    /api/solana/goals/:id/progress # Update goal progress
GET    /api/solana/goals/:publicKey # Get portfolio goals
GET    /api/solana/wallet/:publicKey # Get wallet info
```

### Health & Monitoring
```
GET    /api/health              # Basic health check
GET    /api/health/detailed     # Detailed health with service status
GET    /api/health/database     # Database-specific health check
GET    /api/health/solana       # Solana-specific health check
GET    /api/health/readiness    # Kubernetes readiness probe
GET    /api/health/liveness     # Kubernetes liveness probe
```

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication
- Row Level Security (RLS) in database
- Role-based access control
- Session management

### API Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (per IP and per user)
- Request validation with express-validator
- Input sanitization

### Data Security
- Password hashing with bcrypt
- SQL injection prevention
- XSS protection
- Environment variable validation

## ⛓️ Blockchain Integration

### Solana Program Features
- **Portfolio Management**: On-chain portfolio initialization and tracking
- **Asset Management**: Add/update crypto assets with real-time pricing
- **Transaction Recording**: Immutable transaction history on blockchain
- **Goal Tracking**: Smart contract-based financial goal management
- **Audit Trail**: Transparent and verifiable financial records

### Supported Networks
- Solana Devnet (development)
- Solana Mainnet (production)
- Custom RPC endpoints

## 🤖 Background Jobs

The system includes automated background processing:

### Scheduled Jobs
- **Crypto Price Sync**: Updates cryptocurrency prices every 5 minutes
- **Recurring Transactions**: Processes scheduled transactions daily
- **Budget Alerts**: Generates budget warnings and notifications
- **Audit Log Cleanup**: Maintains audit log retention policy
- **Solana Data Sync**: Synchronizes on-chain data every 10 minutes
- **Notification Digest**: Sends daily summary notifications

### Job Management
- Cron-based scheduling
- Error handling and retry logic
- Performance monitoring
- Graceful shutdown handling

## 📝 Logging & Monitoring

### Logging System
- Structured JSON logging with Winston
- Log levels: error, warn, info, debug
- Daily log rotation
- Request/response logging middleware

### Health Monitoring
- Application health endpoints
- Database connection monitoring
- External service health checks
- Performance metrics collection

## 🧪 Testing

### Test Structure
```
src/__tests__/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for API endpoints
├── e2e/           # End-to-end tests
└── fixtures/      # Test data and mocks
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- transactions.test.ts
```

## 📦 Deployment

### Docker Deployment
```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run
```

### Environment-Specific Builds
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### Kubernetes Deployment
The application includes health check endpoints for Kubernetes:
- Readiness probe: `/api/health/readiness`
- Liveness probe: `/api/health/liveness`

## 🛠️ Development

### Code Structure
```
src/
├── api/
│   └── routes/          # API route handlers
├── config/              # Configuration management
├── jobs/                # Background job processors
├── middleware/          # Express middleware
├── services/            # Business logic services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── __tests__/           # Test files
└── index.ts            # Application entry point
```

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Database operations
npm run migration:generate
npm run migration:up
npm run migration:reset
npm run seed
```

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "pagination": {  // For paginated responses
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human readable error message",
  "details": {
    // Additional error details
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📚 API Documentation

### Postman Collection
Import the Postman collection from `/docs/postman/` for complete API testing.

### OpenAPI Specification
The API documentation is available in OpenAPI 3.0 format at `/docs/openapi.yaml`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Write comprehensive tests
- Document public APIs
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [Issues](https://github.com/your-repo/issues) page
- Review the API documentation
- Contact the development team

---

Built with ❤️ by the TinTin Finance Team
