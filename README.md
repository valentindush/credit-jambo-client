# CreditJambo Client Application

A comprehensive Digital Credit & Savings Platform client application with backend API and frontend interface.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Setup](#docker-setup)
- [Manual Setup](#manual-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 📁 Project Structure

```
client/
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── main.ts         # Application entry point
│   │   └── app.module.ts   # Root module
│   ├── prisma/             # Database schema
│   ├── Dockerfile          # Docker configuration
│   └── package.json        # Dependencies
├── frontend/               # Next.js Client Frontend
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities and hooks
│   ├── Dockerfile          # Docker configuration
│   └── package.json        # Dependencies
└── README.md              # This file
```

---

## 📦 Prerequisites

### For Docker Setup
- Docker 20.10+
- Docker Compose 2.0+

### For Manual Setup
- Node.js 20+
- pnpm 8+ (for backend) or npm 10+ (for frontend)
- PostgreSQL 14+

---

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd creditjambo

# Start all services
docker-compose up -d

# Wait for services to be ready (30-40 seconds)
sleep 40

# Run database migrations
docker-compose exec backend pnpm prisma migrate deploy

# Seed the database (optional)
docker-compose exec backend pnpm prisma:seed
```

**Access the applications:**
- Client Frontend: http://localhost:3000
- Admin Frontend: http://localhost:3003
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

### Manual Setup

See [Manual Setup](#manual-setup) section below.

---

## 🐳 Docker Setup

### Prerequisites
- Docker and Docker Compose installed

### Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f client-frontend
```

### Database Migrations

```bash
# Run migrations
docker-compose exec backend pnpm prisma migrate deploy

# Seed database
docker-compose exec backend pnpm prisma:seed

# Open Prisma Studio
docker-compose exec backend pnpm prisma:studio
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Rebuild Services

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build client-frontend
```

---

## 🛠️ Manual Setup

### Backend Setup

```bash
cd client/backend

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma migrate dev

# Seed database (optional)
pnpm prisma:seed

# Start development server
pnpm start:dev

# Or start production server
pnpm build
pnpm start:prod
```

### Frontend Setup

```bash
cd client/frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Start development server
npm run dev

# Or build for production
npm run build
npm start
```

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:123456@localhost:5432/creditjambo_client?schema=public"

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

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📚 API Documentation

### Swagger Documentation

Access the interactive API documentation at:
- **Client API**: http://localhost:3001/api/docs
- **Admin API**: http://localhost:3001/admin/docs

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Credits
- `GET /api/credits` - Get all credits
- `POST /api/credits` - Create credit
- `GET /api/credits/:id` - Get credit by ID
- `PUT /api/credits/:id` - Update credit

#### Savings
- `GET /api/savings` - Get all savings
- `POST /api/savings` - Create savings
- `GET /api/savings/:id` - Get savings by ID

---

## 💻 Development

### Backend Development

```bash
cd client/backend

# Start development server with hot reload
pnpm start:dev

# Run linter
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Run tests with coverage
pnpm test:cov
```

### Frontend Development

```bash
cd client/frontend

# Start development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## 🧪 Testing

### Backend Tests

```bash
cd client/backend

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e
```

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build production images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Environment for Production

Update `.env` files with production values:

```env
# Backend
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
CORS_ORIGIN=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## 📊 Database

### Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **User** - Customer and admin users
- **Credit** - Credit products and applications
- **Savings** - Savings accounts
- **Transaction** - Financial transactions

### Migrations

```bash
# Create new migration
pnpm prisma migrate dev --name migration_name

# Deploy migrations
pnpm prisma migrate deploy

# Reset database
pnpm prisma migrate reset
```

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Rate limiting
- Input validation with class-validator
- SQL injection prevention via Prisma ORM

---

## 📝 Default Credentials

### Customer Account
- **Email**: customer@creditjambo.com
- **Password**: Customer@123456

### Admin Account
- **Email**: admin@creditjambo.com
- **Password**: Admin@123456

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Port Already in Use

```bash
# Change ports in docker-compose.yml or .env
# Or kill process using the port
lsof -i :3001
kill -9 <PID>
```

### Build Failures

```bash
# Clear Docker cache
docker-compose build --no-cache

# Rebuild from scratch
docker-compose down -v
docker-compose up -d
```

---

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check application logs
4. Open an issue on GitHub

---

## 📄 License

UNLICENSED

---

**Last Updated**: October 30, 2025

