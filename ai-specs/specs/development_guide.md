# Development Guide

This guide provides step-by-step instructions for setting up the development environment and running the LTI full-stack application locally.

---

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v16 or higher) — Download from [nodejs.org](https://nodejs.org/)
- **npm** (v8 or higher) — Installed with Node.js
- **Docker** and **Docker Compose** — Download from [docker.com](https://www.docker.com/products/docker-desktop)
- **Git** — Download from [git-scm.com](https://git-scm.com/)

Verify your installations:
```bash
node --version
npm --version
docker --version
docker-compose --version
git --version
```

---

## Quick Start (5 minutes)

```bash
# 1. Clone and navigate to project
git clone https://github.com/LIDR-academy/AI4Devs-lab-ides-2603-Sr_II.git
cd AI4Devs-lab-ides-2603-Sr_II

# 2. Start PostgreSQL in Docker
docker-compose up -d

# 3. Setup backend (Terminal 1)
cd backend
npm install
npx prisma migrate dev
npm run dev

# 4. Setup frontend (Terminal 2)
cd frontend
npm install
npm start
```

**Result**:
- Backend API: `http://localhost:3010`
- Frontend app: `http://localhost:3000`

---

## Detailed Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/LIDR-academy/AI4Devs-lab-ides-2603-Sr_II.git
cd AI4Devs-lab-ides-2603-Sr_II
```

### 2. Database Setup (PostgreSQL with Docker)

Start the PostgreSQL database using Docker Compose:

```bash
# Start PostgreSQL container in background
docker-compose up -d

# Verify container is running
docker-compose ps

# View logs (optional)
docker-compose logs postgres
```

**Connection details** (from `docker-compose.yml`):
- **Host**: `localhost`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `password`
- **Database**: `mydatabase`

To access the database with a PostgreSQL client:
```bash
psql -h localhost -U postgres -d mydatabase
```

To stop the database:
```bash
docker-compose down
```

To stop and remove all data:
```bash
docker-compose down -v
```

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example or create manually)
cat > .env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydatabase
NODE_ENV=development
PORT=3010
EOF

# Generate Prisma client
npx prisma generate

# Run database migrations (creates tables)
npx prisma migrate dev

# (Optional) Seed database with sample data
npx prisma db seed

# Start development server
npm run dev
```

**Expected output**:
```
Server is running at http://localhost:3010
```

**Available backend scripts**:
```bash
npm run dev          # Start dev server with auto-reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
```

### 4. Frontend Setup

Open a new terminal and navigate to the project root:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:3010
EOF

# Start development server
npm start
```

**Expected behavior**:
- Browser opens automatically to `http://localhost:3000`
- Hot-reload enabled: changes update automatically

**Available frontend scripts**:
```bash
npm start        # Start dev server
npm run build    # Create production build in build/ directory
npm test         # Run Jest tests
npm run eject    # Eject from Create React App (one-way operation)
```

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests once (interactive mode)
npm test

# Press 'a' to run all tests, 'q' to quit
```

---

## Troubleshooting

### Port Already in Use

If `3010` or `3000` is already in use:

**Backend (3010)**:
```bash
# Find process using port 3010
lsof -i :3010
# Kill the process
kill -9 <PID>

# Or change PORT in backend/.env
PORT=3011
npm run dev
```

**Frontend (3000)**:
```bash
# Frontend respects PORT env variable
PORT=3001 npm start
```

### Docker PostgreSQL Not Starting

```bash
# Check logs
docker-compose logs postgres

# Remove and recreate container
docker-compose down
docker-compose up -d --remove-orphans

# Verify it's running
docker ps | grep postgres
```

### Prisma Migration Issues

```bash
cd backend

# Reset database (removes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Create a new migration
npx prisma migrate dev --name description_of_change
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For both backend and frontend if needed
rm -rf frontend/node_modules frontend/package-lock.json
npm install --prefix frontend
```

### TypeScript Compilation Errors

```bash
cd backend

# Check TypeScript for errors
npx tsc --noEmit

# Rebuild
npx tsc
```

---

## Development Workflow

### Creating a Feature Branch

```bash
# Create a feature branch
git checkout -b feature/describe-your-feature

# Make changes, test locally, then commit
git add .
git commit -m "[feat] Describe your changes"
git push origin feature/describe-your-feature

# Create a Pull Request on GitHub
```

### Running Code Quality Checks

```bash
cd backend

# Check for linting errors
npm run lint

# Format code with Prettier (if configured)
npx prettier --write src/

cd ../frontend

# Run linting
npm run lint

# Format code
npx prettier --write src/
```

### Environment Variables Reference

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydatabase
NODE_ENV=development
PORT=3010
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:3010
```

---

## Technology Stack

| Component | Technology | Version |
|---|---|---|
| **Backend Runtime** | Node.js | v16+ |
| **Backend Language** | TypeScript | v4.9.5+ |
| **Backend Framework** | Express.js | v4.19.2+ |
| **ORM** | Prisma | v5.13.0+ |
| **Database** | PostgreSQL | latest (Docker) |
| **Frontend Framework** | React | v18.3.1+ |
| **Frontend Language** | TypeScript | v4.9.5+ |
| **Frontend UI Library** | React Bootstrap | v2.10.2+ |
| **HTTP Client** | Axios | latest |
| **Router** | React Router DOM | v6.23.1+ |

---

## File Structure

```
.
├── backend/                    # Express backend
│   ├── src/                    # TypeScript source code
│   ├── prisma/                 # Prisma schema & migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                    # Local environment (not in git)
├── frontend/                   # React frontend
│   ├── src/                    # React components & logic
│   ├── public/                 # Static assets
│   ├── package.json
│   └── .env                    # Local environment (not in git)
├── docker-compose.yml          # PostgreSQL service
└── README.md                   # Project overview
```

---

## Additional Resources

- [Backend Standards](./ai-specs/specs/backend-standards.mdc)
- [Frontend Standards](./ai-specs/specs/frontend-standards.mdc)
- [Data Model](./ai-specs/specs/data-model.md)
- [API Specification](./ai-specs/specs/api-spec.yml)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

