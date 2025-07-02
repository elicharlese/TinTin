# TinTin Backend Documentation

Welcome to the TinTin Backend documentation. This guide covers the complete backend architecture, API endpoints, database schema, and deployment procedures.

## Table of Contents

1. [Architecture Overview](./architecture.md)
2. [API Documentation](./api/README.md)
3. [Database Schema](./database/README.md)
4. [Blockchain Integration](./blockchain/README.md)
5. [Deployment Guide](./deployment/README.md)
6. [Development Setup](./development/setup.md)
7. [Testing Guide](./testing/README.md)
8. [Security Guidelines](./security/README.md)
9. [Performance Optimization](./performance/README.md)
10. [Troubleshooting](./troubleshooting/README.md)

## Quick Start

1. **Prerequisites**
   - Node.js 18+
   - PostgreSQL 14+
   - Redis (optional)
   - Rust toolchain (for Solana)

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   npx supabase start
   npx supabase db push
   ```

4. **Start Development Server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## Core Technologies

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth
- **Blockchain**: Solana with Anchor framework
- **Caching**: Redis
- **Queue**: Bull.js
- **Testing**: Jest
- **Documentation**: OpenAPI/Swagger

## Key Features

- RESTful API with comprehensive endpoints
- Real-time updates via WebSockets
- Blockchain integration for crypto assets
- Advanced security with JWT and RLS
- Automated testing and CI/CD
- Comprehensive error handling and logging
- Rate limiting and performance optimization

## API Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

## Health Check

```bash
curl http://localhost:3001/health
```

## Support

For questions and support:
- GitHub Issues: [Project Issues](https://github.com/elicharlese/TinTin/issues)
- Documentation: [Full Docs](./README.md)
- Email: support@tintin.app
