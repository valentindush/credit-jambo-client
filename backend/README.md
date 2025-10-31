# CreditJambo Client Backend

Digital Credit & Savings Platform - Client Application Backend API built with NestJS, Prisma, and PostgreSQL.

## Description

This is the backend API for the CreditJambo client application, providing secure endpoints for customer financial operations including savings management, credit requests, transaction tracking, and notifications.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with refresh tokens
- 👤 **User Management**: Profile management and account operations
- 💰 **Savings Module**: Deposit, withdrawal, and balance tracking
- 💳 **Credit Module**: Credit requests with mock scoring, approval tracking, and repayment
- 📊 **Transactions**: Complete transaction history and analytics
- 🔔 **Notifications**: In-app and email notification system
- 📚 **API Documentation**: Auto-generated Swagger/OpenAPI docs
- ✅ **Validation**: Request validation with class-validator
- 🛡️ **Error Handling**: Global exception filters
- 🗄️ **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Package Manager**: pnpm

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- pnpm (v8 or higher)

## Installation

```bash
# Install dependencies
pnpm install
```

## Environment Setup

Create a `.env` file in the root directory (use `.env.example` as template):

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/creditjambo_client?schema=public"

# Application
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Database Setup

```bash
# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed the database with sample data
pnpm prisma:seed

# Open Prisma Studio (optional)
pnpm prisma:studio
```

## Running the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

The API will be available at:
- **API Base URL**: http://localhost:3001/api
- **Swagger Documentation**: http://localhost:3001/api/docs

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/validate` - Validate current token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/dashboard` - Get dashboard data

### Savings
- `GET /api/savings` - Get all savings accounts
- `GET /api/savings/:accountId` - Get specific account
- `POST /api/savings/:accountId/deposit` - Deposit money
- `POST /api/savings/:accountId/withdraw` - Withdraw money
- `GET /api/savings/:accountId/balance` - Get balance
- `GET /api/savings/:accountId/transactions` - Get transaction history

### Credit
- `POST /api/credit/request` - Request new credit
- `GET /api/credit` - Get all credits
- `GET /api/credit/:creditId` - Get specific credit
- `POST /api/credit/:creditId/repay` - Make repayment
- `GET /api/credit/:creditId/schedule` - Get repayment schedule

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get specific transaction
- `GET /api/transactions/stats` - Get transaction statistics
- `GET /api/transactions/analytics` - Get monthly analytics

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread-count` - Get unread count
- `GET /api/notifications/:id` - Get specific notification
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Test Credentials

After seeding the database, you can use these credentials:

```
Email: john.doe@example.com
Email: jane.smith@example.com
Email: bob.wilson@example.com
Password: Password123!
```

## Project Structure

```
src/
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── filters/         # Exception filters
│   ├── guards/          # Auth guards
│   ├── interceptors/    # Response interceptors
│   └── prisma.service.ts
├── config/              # Configuration
│   └── configuration.ts
├── modules/             # Feature modules
│   ├── auth/           # Authentication
│   ├── users/          # User management
│   ├── savings/        # Savings operations
│   ├── credit/         # Credit management
│   ├── transactions/   # Transaction history
│   └── notifications/  # Notifications
├── app.module.ts
└── main.ts
```

## License

This project is licensed under the UNLICENSED license.
