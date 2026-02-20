# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**iN!Time** is an enterprise project management system focused on resource management (allocation, timesheets, rate cards), financial management (EVM - Earned Value Management, forecasting, budget tracking), portfolio management, and advanced analytics.

**Architecture Type**: Client-Server with MVC + Middlewares + Microservices
- **Frontend (Client)**: React 19.2 with JavaScript (NOT TypeScript) — SPA in `client/` directory
- **Backend (Server)**: Node.js 20 LTS with JavaScript (NOT TypeScript) — microservices in `server/` directory
- **Language**: All code in JavaScript; documentation and UI text in Portuguese (pt-BR)
- **Deployment**: Docker Compose with isolated network, Nginx reverse proxy on port 8500

## Directory Structure

```
intime/
├── client/                    # Frontend React SPA
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page-level components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client services (Axios)
│   │   ├── store/            # Zustand stores
│   │   ├── utils/            # Helper functions
│   │   └── App.jsx           # Root component
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Backend microservices
│   ├── api-gateway/          # Port 3000 - Entry point
│   │   ├── src/
│   │   │   ├── middlewares/  # JWT verification, rate limiting
│   │   │   ├── routes/       # Proxy routing configuration
│   │   │   └── server.js
│   │   └── package.json
│   │
│   ├── services/
│   │   ├── auth-service/     # Port 3001
│   │   │   ├── src/
│   │   │   │   ├── controllers/  # HTTP request handlers
│   │   │   │   ├── services/     # Business logic
│   │   │   │   ├── repositories/ # Database access
│   │   │   │   ├── models/       # Sequelize models
│   │   │   │   ├── middlewares/  # Service-specific middlewares
│   │   │   │   ├── utils/        # Helpers, validators
│   │   │   │   └── server.js
│   │   │   └── package.json
│   │   │
│   │   ├── user-service/     # Port 3002
│   │   ├── project-service/  # Port 3003
│   │   ├── timesheet-service/ # Port 3004
│   │   ├── allocation-service/ # Port 3005
│   │   ├── contract-service/ # Port 3006
│   │   ├── financial-service/ # Port 3007
│   │   ├── notification-service/ # Port 3008
│   │   ├── export-service/   # Port 3009
│   │   └── audit-service/    # Port 3010
│   │
│   └── shared/               # Shared utilities across services
│       ├── config/           # Shared Sequelize factory (database.js)
│       ├── errors/           # Custom error classes (AppError hierarchy)
│       ├── logger/           # Winston configuration
│       └── validators/       # Common validation schemas
│
├── docker-compose.yml
├── ecosystem.config.js       # PM2 configuration
├── reinstall-deps.bat        # Windows script para reinstalar todas as deps
├── resumo_projeto_intime.md  # Documentação completa de arquitetura (2300+ linhas)
├── UX_UI_guide.md            # Design system: cores, tipografia, componentes
├── DATABASE_SETUP.md         # Instruções de configuração do PostgreSQL
└── DATABASE_CONNECTION.md    # Guia de conexão via PgAdmin
```

## Architecture

**Client-Server with Modular Distributed Monolith** — independent microservices with shared PostgreSQL database, deployed as separate Docker containers. Not pure microservices: cross-domain queries run directly against the shared DB instead of through service-to-service calls.

### Backend MVC + Middlewares Pattern

Each microservice follows this 4-layer structure:

```
HTTP Request → Middleware → Controller → Service → Repository → Model → Database
```

**Flow Example (Create Project)**:
```javascript
// 1. Middleware (middlewares/auth.middleware.js)
verifyToken → extractUserId → checkPermissions('projects.create')
        ↓
// 2. Controller (controllers/project.controller.js)
validateInput → call projectService.create() → format response
        ↓
// 3. Service (services/project.service.js)
business logic → orchestrate repositories → publish events
        ↓
// 4. Repository (repositories/project.repository.js)
Sequelize query → return data
        ↓
// 5. Model (models/project.model.js)
Schema definition, validations, associations
```

### Services (10 + API Gateway)

| Service | Port | Responsibility |
|---------|------|----------------|
| API Gateway | 3000 | JWT verification, request routing, rate limiting, CORS, API versioning (`/api/v1`) |
| AUTH-SERVICE | 3001 | Login, logout, JWT + refresh token rotation, password reset |
| USER-SERVICE | 3002 | Users, RBAC (8 roles, 30+ permissions), preferences |
| PROJECT-SERVICE | 3003 | Projects, portfolios, status tracking |
| TIMESHEET-SERVICE | 3004 | Timesheet CRUD, workflow (Draft → Submitted → Approved/Rejected), bulk submit |
| ALLOCATION-SERVICE | 3005 | Resource allocation, rate cards, conflict detection (>100%) |
| CONTRACT-SERVICE | 3006 | Clients, contracts, frames, budget per frame |
| FINANCIAL-SERVICE | 3007 | EVM metrics (PV, EV, AC, CPI, SPI, etc.), forecasting, burn-rate (read-only DB access, cron every 15min, Redis cache TTL 15min) |
| NOTIFICATION-SERVICE | 3008 | Real-time WebSocket (Socket.io + Redis Pub/Sub), email queue (Nodemailer) |
| EXPORT-SERVICE | 3009 | Async report generation via Bull Queue (Excel/CSV/PDF/JSON), S3 upload |
| AUDIT-SERVICE | 3010 | Immutable append-only logs in PostgreSQL JSONB |

### Layer Responsibilities

#### **Middleware**
```javascript
// Executes BEFORE controller
✅ JWT token verification
✅ Permission checking (RBAC)
✅ Request validation (Joi schemas)
✅ Rate limiting
✅ Request logging
✅ Error handling (global error middleware)

❌ Never contains business logic
❌ Never accesses database directly
```

#### **Controller**
```javascript
// HTTP layer - routes/endpoints
✅ Receives req, res, next
✅ Extracts params, query, body
✅ Calls appropriate service method
✅ Formats JSON response
✅ Sets HTTP status codes

❌ No business logic
❌ No database access
❌ No external API calls
```

#### **Service**
```javascript
// Business logic layer
✅ Core business rules
✅ Complex validations
✅ Orchestrates multiple repositories
✅ Manages database transactions
✅ Publishes events to Redis Pub/Sub
✅ Calls external services if needed

❌ Never touches req/res objects
❌ No HTTP status codes
❌ No direct SQL queries (use repository)
```

#### **Repository**
```javascript
// Data access layer
✅ Sequelize queries
✅ CRUD operations
✅ Filters, pagination, sorting
✅ Complex joins and aggregations
✅ Returns plain data (not HTTP responses)

❌ No business logic
❌ No validation (beyond DB constraints)
❌ No event publishing
```

#### **Model**
```javascript
// Schema definition layer
✅ Sequelize.define()
✅ Field types, constraints
✅ Associations (hasMany, belongsTo)
✅ Hooks (beforeCreate, afterUpdate)
✅ Virtual fields
✅ Indexes for performance

❌ No queries (use repository)
❌ No business logic
❌ No HTTP concerns
```

### Communication Patterns

- **Synchronous**: HTTP REST via API Gateway (`http-proxy-middleware`)
- **Asynchronous**: Redis Pub/Sub for event-driven notifications (channels: `project-events`, `user-events`, `notification-events`)
- **Background Jobs**: Bull Queue with Redis for long tasks (exports, EVM calculations)

## Technology Stack

**Frontend**: React 19.2 + Vite 7 (dependencies: react-dom only — NOT yet installed: router, query, zustand, shadcn, axios, etc.)

**Backend**: Node.js 20 LTS, Express.js 4.21, Sequelize 6.37.7 (PostgreSQL), redis client 4.7, jsonwebtoken 9, bcryptjs 2, helmet 8.1, cors 2, express-rate-limit 7, Joi 17, Socket.io 4.8, Bull 4.16, Winston 3.19

**Databases**:
- PostgreSQL 16 (transactional data + audit logs via JSONB) — dedicated instance `intime-postgres` on port 5433, user `intime_admin`, database `intime_dev`
- Redis 7.4 (cache, sessions, pub/sub, queues) — port 6379

**Infrastructure**:
- Nginx 1.24-alpine (reverse proxy on port 8500) — entry point for http://interno.sandech.local:8500/intime/
- Docker 24 + Docker Compose v3.8
- Isolated `intime-network` (bridge) — no cross-project access
- All microservices are internal-only (no host port exposure except via Nginx)

## Development Commands

### Docker (Recommended for Production-like Environment)
```bash
# Start all services (from project root)
docker compose up -d --build

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f auth-service

# Rebuild specific service
docker compose up -d --build auth-service

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes database data)
docker compose down -v

# Check service status
docker compose ps

# Access PostgreSQL
docker exec -it intime-postgres psql -U intime_admin -d intime_dev
```

### Frontend (client/)
```bash
cd client/
npm install
npm run dev           # Vite dev server on http://localhost:5173
npm run build         # Production build to dist/
npm run preview       # Preview production build
npm run lint          # ESLint check
```

### Backend - Manual Development (without Docker)
```bash
# Prerequisites: PostgreSQL and Redis running locally or on VM (use dev-db-start.ps1)

# API Gateway
cd server/api-gateway/
npm install
npm run dev           # nodemon on port 3000

# Auth Service (example)
cd server/services/auth-service/
npm install
npm run dev           # nodemon on port 3001
npm start             # production mode
npm test              # run tests (NOT yet implemented)
npm run lint          # ESLint check
```

### Database Management
```bash
# Backup PostgreSQL
docker exec intime-postgres pg_dump -U intime_admin intime_dev > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20260220.sql | docker exec -i intime-postgres psql -U intime_admin -d intime_dev
```

## Database Conventions

### PostgreSQL
- All primary keys are `UUID` via `gen_random_uuid()`
- All tables include `created_at` and `updated_at` timestamps
- Timesheets table is partitioned by year (for 500K+ records)
- Unique constraint on timesheets: `(user_id, project_id, date)`
- Hours validation: `CHECK (hours >= 0 AND hours <= 24)`
- Project statuses: `active`, `on_hold`, `completed`, `cancelled`
- Timesheet statuses: `draft`, `submitted`, `approved`, `rejected`

### Redis Key Naming
```
evm:project:{id}           # EVM cache (TTL: 15min)
permissions:user:{id}      # Permissions cache (TTL: 1h)
session:{id}               # Session data (TTL: 24h)
blacklist:token:{jti}      # Revoked tokens (TTL: 7d)
ratelimit:login:{ip}       # Login rate limit (TTL: 1min)
ratelimit:api:{user_id}    # API rate limit (TTL: 1min)
bull:export-jobs:*         # Bull queue keys
```

### Naming Conventions

**Backend:**
- Controllers: `entity.controller.js` (e.g., `auth.controller.js`, `project.controller.js`)
- Services: `entity.service.js` (e.g., `auth.service.js`, `timesheet.service.js`)
- Repositories: `entity.repository.js` (e.g., `user.repository.js`)
- Models: `Entity.model.js` with PascalCase (e.g., `User.model.js`, `RefreshToken.model.js`)
- Routes: `entity.routes.js` (e.g., `auth.routes.js`)
- Middlewares: `descriptive.middleware.js` (e.g., `error.middleware.js`, `auth.middleware.js`)

**Frontend:**
- Components: `PascalCase.jsx` (e.g., `LoginForm.jsx`, `ProjectCard.jsx`)
- Pages: `PascalCase.jsx` in `pages/` (e.g., `Dashboard.jsx`, `ProjectList.jsx`)
- Hooks: `useCamelCase.js` (e.g., `useAuth.js`, `useProjects.js`)
- Services: `camelCase.js` (e.g., `authService.js`, `projectService.js`)
- Stores: `camelCaseStore.js` (e.g., `authStore.js`, `projectStore.js`)

**Database:**
- Tables: `snake_case` plural (e.g., `users`, `refresh_tokens`, `project_allocations`)
- Columns: `snake_case` (e.g., `user_id`, `created_at`, `refresh_token`)
- Foreign keys: `{table_singular}_id` (e.g., `user_id`, `project_id`)

## Database Configuration

### Shared Sequelize Configuration (Hybrid Approach)

All microservices use a **shared factory function** to create Sequelize instances, ensuring consistency while allowing service-specific customization.

**Pattern**:
```javascript
// server/shared/config/database.js - Shared factory
export function createSequelizeInstance(serviceName, options = {})

// server/services/*/src/config/database.js - Service-specific
import { createSequelizeInstance } from '../../../../shared/config/database.js'
export const sequelize = createSequelizeInstance('service-name')
```

**Key features**:
- Environment variable validation (throws early if missing DB_HOST, DB_PORT, etc.)
- Connection pooling with defaults (max: 5, min: 0, acquire: 30s, idle: 10s)
- Service-specific logging with service name prefix
- Optional overrides for pool size, logging, dialect options

**Financial service exception** (larger pool for EVM calculations):
```javascript
export const sequelize = createSequelizeInstance('financial-service', {
  pool: { max: 10, min: 2 }
})
```

**Required environment variables** (all services):
```bash
DB_HOST=<VM_IP>          # PostgreSQL host
DB_PORT=5432
DB_NAME=intime_dev
DB_USER=<username>
DB_PASSWORD=<password>
DB_POOL_MAX=5            # Optional override
DB_POOL_MIN=0            # Optional override
```

**Adding database config to new services**:
1. Create `.env.example` with database variables (copy from auth-service)
2. Create `src/config/database.js` importing shared factory
3. Import sequelize instance in models/repositories
4. See [`DATABASE_SETUP.md`](DATABASE_SETUP.md) for detailed setup instructions

## API Conventions

- All endpoints prefixed with `/api/v1/`
- Standard JSON response: `{ success: boolean, message: string, data: any, pagination?: { page, limit, total, totalPages } }`
- Error response: `{ success: false, message: string, error: { code: string, details: object } }`
- Non-CRUD actions use POST on sub-resources: `POST /timesheets/:id/submit`, `POST /timesheets/:id/approve`
- Rate limits: 5 req/min on login, 100 req/min per user on general API

## Security Architecture

- **JWT**: access token (1h) + refresh token (7d) with rotation; blacklist in Redis
- **RBAC**: 8-level hierarchy (Admin → Super Manager → Portfolio Manager → Project Manager → Team Lead → Senior Member → Member → Viewer) with permission inheritance
- **Permissions format**: `{entity}.{action}` (e.g., `projects.create`, `timesheets.approve`)
- **Account lockout**: 5 failed attempts → 15min lock
- **Password hashing**: bcryptjs with 10 rounds

## Error Handling

Custom error hierarchy inheriting from `AppError`:
- `ValidationError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)

Global error middleware distinguishes operational errors (`isOperational: true`) from programming errors (500).

## Testing Strategy

- **Unit tests** (Jest): 70% — services, utilities, EVM calculations (100% coverage required for EVM)
- **Integration tests** (Supertest): 20% — API endpoint testing
- **E2E tests** (Cypress): 10% — critical user flows
- **Minimum coverage**: 80% global, 90% for service layer

## Logging

Winston structured JSON logs with fields: `timestamp`, `level`, `service`, `environment`, `message`, `userId`, `duration`, `method`, `path`, `statusCode`. Captured by Promtail → Loki → Grafana.

## Key Architectural Decisions

1. **Shared PostgreSQL** instead of database-per-service — avoids distributed transaction complexity, enables efficient cross-domain queries
2. **React Query + Zustand** (planned) instead of Redux — 90% server state, 10% client state
3. **Sequelize** over Prisma — team familiarity, mature transaction support
4. **JWT** over sessions — stateless, horizontally scalable
5. **Redis Pub/Sub** over RabbitMQ — simpler, Redis already in stack; migrate to Kafka if volume exceeds 10M msgs/day
6. **Docker Compose** over Kubernetes — simpler for single-VM deployment, can migrate to K8s later if needed
7. **Nginx subpath routing** (`/intime/`) — VM hosts multiple projects, each on different subpaths
8. **Centralized `.env`** — single `server/.env` feeds all 10 microservices via build args and environment variables

## Critical Implementation Notes

### Database Connection Pattern

All microservices use the **shared factory pattern** for Sequelize:

```javascript
// server/shared/config/database.js
export function createSequelizeInstance(serviceName, options = {})

// server/services/*/src/config/database.js
import { createSequelizeInstance } from '../../../../shared/config/database.js'
export const sequelize = createSequelizeInstance('service-name')
```

This ensures:
- Consistent connection pooling (max: 5, min: 0 by default)
- Environment variable validation (fails fast if missing `DB_HOST`, `DB_PASSWORD`, etc.)
- Service-specific logging with service name prefix
- Optional overrides (e.g., `financial-service` uses `pool: { max: 10 }`)

### Docker Build Context

All backend Dockerfiles use `context: ./server` in docker-compose.yml to access `shared/`:

```yaml
services:
  auth-service:
    build:
      context: ./server              # ← CRITICAL: allows access to shared/
      dockerfile: services/auth-service/Dockerfile
```

Without this, imports like `../../../../shared/config/database.js` would fail during build.

### Error Handling Philosophy

All services use the `AppError` hierarchy from `server/shared/errors/AppError.js`:

- `ValidationError` (400) — invalid input
- `UnauthorizedError` (401) — missing/invalid authentication
- `ForbiddenError` (403) — insufficient permissions
- `NotFoundError` (404) — resource doesn't exist
- `ConflictError` (409) — duplicate data (e.g., email already registered)

Global error middleware distinguishes operational errors (`isOperational: true`) from programming errors (log + 500).

### Next Implementation Steps

**Priority 1: Auth Service** (foundation for all other services)
1. Create models: `User.model.js`, `RefreshToken.model.js`, `PasswordResetToken.model.js`
2. Create repositories: `user.repository.js`, `token.repository.js`
3. Implement `auth.service.js` methods (bcrypt, JWT signing, token rotation)
4. Create Sequelize migrations for `users` and `refresh_tokens` tables
5. Add unit tests for service layer

**Priority 2: User Service** (needed for RBAC)
1. Create models: `User.model.js`, `Role.model.js`, `Permission.model.js`, `UserRole.model.js`
2. Implement user CRUD + RBAC checking
3. Create migrations for users, roles, permissions, user_roles tables
4. Seed initial roles (Admin, Manager, etc.) and permissions

**Priority 3: Frontend Auth Flow**
1. Install dependencies: `axios`, `zustand`, `react-router-dom`, `react-query`
2. Create `services/api.js` (Axios instance with JWT interceptors)
3. Create `services/authService.js` (login, logout, refresh wrappers)
4. Create `store/authStore.js` (Zustand store with localStorage persistence)
5. Create `pages/Login.jsx`, `pages/Dashboard.jsx`
6. Setup protected routes with React Router

**Priority 4: Other Microservices**
- Implement following the same MVC pattern as auth-service
- Reuse shared Sequelize factory and error classes
- Add integration tests hitting actual endpoints

## Common Development Tasks

### Adding a New Model

1. Create model file in service's `models/` directory:
```javascript
// server/services/user-service/src/models/User.model.js
import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true  // createdAt → created_at
})
```

2. Create repository for data access:
```javascript
// server/services/user-service/src/repositories/user.repository.js
import { User } from '../models/User.model.js'

export class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ where: { email } })
  }

  async create(userData) {
    return await User.create(userData)
  }
}
```

3. Use in service layer:
```javascript
// server/services/user-service/src/services/user.service.js
import { UserRepository } from '../repositories/user.repository.js'
import { NotFoundError } from '../../../../shared/errors/AppError.js'

export class UserService {
  constructor() {
    this.userRepository = new UserRepository()
  }

  async getUserByEmail(email) {
    const user = await this.userRepository.findByEmail(email)
    if (!user) throw new NotFoundError('Usuário não encontrado')
    return user
  }
}
```

### Adding a New Endpoint

1. Define route:
```javascript
// server/services/user-service/src/routes/user.routes.js
import express from 'express'
import { UserController } from '../controllers/user.controller.js'

const router = express.Router()
const userController = new UserController()

router.get('/:id', userController.getUserById)
router.post('/', userController.createUser)

export default router
```

2. Create controller:
```javascript
// server/services/user-service/src/controllers/user.controller.js
import { UserService } from '../services/user.service.js'

export class UserController {
  constructor() {
    this.userService = new UserService()
  }

  getUserById = async (req, res, next) => {
    try {
      const user = await this.userService.getUserById(req.params.id)
      res.json({ success: true, data: user })
    } catch (error) {
      next(error)  // passes to error middleware
    }
  }
}
```

3. Register routes in `server.js`:
```javascript
import userRoutes from './routes/user.routes.js'
app.use('/api/v1/users', userRoutes)
```

4. Update API Gateway proxy (if new service):
```javascript
// server/api-gateway/src/routes/index.js
app.use('/api/v1/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL,
  changeOrigin: true
}))
```

### Running Database Migrations (when implemented)

```bash
# Create migration
npx sequelize-cli migration:generate --name create-users-table

# Run migrations
npx sequelize-cli db:migrate

# Rollback
npx sequelize-cli db:migrate:undo
```

### Testing a Microservice Independently

```bash
# Option 1: Via API Gateway (through Docker)
curl http://localhost:8500/intime/api/v1/auth/health

# Option 2: Direct to service (only if running locally, not in Docker)
curl http://localhost:3001/api/v1/auth/health

# Option 3: From inside Docker network
docker exec -it intime-api-gateway curl http://auth-service:3001/api/v1/auth/health
```

## Troubleshooting

### Service won't start - "Missing environment variables"

**Cause**: Sequelize factory validates required DB env vars at startup.

**Fix**:
```bash
# Check if server/.env exists and has all required fields
cat server/.env | grep DB_

# Required variables:
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
```

### Service won't connect to PostgreSQL

**Symptoms**: `ECONNREFUSED` or `connection timeout`

**Fix**:
```bash
# 1. Verify PostgreSQL is running
docker compose ps postgres

# 2. Check if postgres is healthy
docker compose ps | grep postgres
# Should show "(healthy)"

# 3. Test connection manually
docker exec -it intime-postgres psql -U intime_admin -d intime_dev -c "SELECT 1"

# 4. Check service logs
docker compose logs -f auth-service

# 5. Verify DB_HOST in docker-compose
# Inside containers, DB_HOST should be "postgres", not "localhost" or IP
```

### Nginx returns 502 Bad Gateway

**Cause**: Backend service is not running or not healthy.

**Fix**:
```bash
# 1. Check which service is failing
docker compose ps

# 2. Check logs of the failing service
docker compose logs -f api-gateway

# 3. Verify service is listening on correct port
docker exec -it intime-api-gateway netstat -tulpn | grep 3000

# 4. Restart specific service
docker compose restart api-gateway
```

### "Cannot find module '../../../../shared/...'"

**Cause**: Dockerfile build context is wrong or `shared/` was not copied.

**Fix**:
```yaml
# Verify docker-compose.yml has correct context
services:
  auth-service:
    build:
      context: ./server          # ← Must be ./server, not ./server/services/auth-service
      dockerfile: services/auth-service/Dockerfile
```

### Frontend can't reach API

**Symptoms**: CORS errors or 404 on API calls

**Fix**:
```bash
# 1. Check Nginx config - ensure /intime/api/ routes to api-gateway
docker exec -it intime-nginx cat /etc/nginx/conf.d/default.conf

# 2. Test API Gateway directly
curl http://localhost:8500/intime/api/v1/health

# 3. Check frontend VITE_API_URL build arg
# Should be "/intime/api/v1" (relative) not "http://localhost:3000"
docker inspect intime-client | grep VITE_API_URL
```

### Redis connection issues

**Fix**:
```bash
# 1. Verify Redis is running
docker compose ps redis

# 2. Test connection
docker exec -it intime-redis redis-cli ping
# Should return "PONG"

# 3. Check REDIS_HOST in service
# Inside containers should be "redis", not "localhost"
docker compose exec auth-service env | grep REDIS_HOST
```

### Hot reload not working in development

**Cause**: Nodemon not watching files or Docker volume not mounted.

**Fix**:
```bash
# For local development (without Docker), nodemon should work automatically
cd server/services/auth-service
npm run dev  # uses nodemon

# For Docker development (requires volume mount):
# Add to docker-compose.yml:
volumes:
  - ./server/services/auth-service/src:/app/services/auth-service/src
```

### Port conflicts

**Symptoms**: "port already in use" or "address already in use"

**Fix**:
```bash
# 1. Check which process is using the port (Windows)
netstat -ano | findstr :8500

# 2. Check which process is using the port (Linux/Mac)
lsof -i :8500

# 3. Stop conflicting container
docker stop <container_name>

# 4. Use different port in .env or docker-compose.yml
```

## Additional Resources

- **`DEPLOY.md`**: Complete production deployment guide for the VM
- **`ESTRUTURA_CRIADA.md`**: Detailed breakdown of directory structure
- **`README.md`**: Quick start guide for developers
- **`resumo_projeto_intime.md`**: Full architectural specification (2300+ lines)
- **`UX_UI_guide.md`**: Design system guidelines
- **`DATABASE_SETUP.md`**: PostgreSQL configuration instructions
- **`DATABASE_CONNECTION.md`**: PgAdmin connection guide

## Implementation Status

> **Estado atual**: Infraestrutura completa (~30% implementado) — Docker, Nginx, API Gateway, e scaffolding de todos os microserviços estão funcionais. Falta implementar a lógica de negócio, modelos, e frontend.

### ✅ Infrastructure & DevOps (100%)

| Componente | Status | Detalhes |
|-----------|--------|----------|
| docker-compose.yml | ✅ Completo | 12 containers (2 DBs, 1 nginx, 1 client, 1 gateway, 10 services), healthchecks, isolated network |
| Dockerfiles | ✅ Completo | 12 arquivos (client + api-gateway + 10 services), multi-stage build no frontend |
| nginx/nginx.conf | ✅ Completo | Reverse proxy configurado: `/intime/` → client, `/intime/api/` → gateway, `/intime/socket.io/` → notifications |
| server/.env | ✅ Completo | Variáveis centralizadas para todos os serviços (DB, Redis, JWT, URLs) |
| .env (raiz) | ✅ Completo | `INTIME_DB_PASSWORD` injetado no docker-compose |

### ✅ Shared Libraries (100%)

| Componente | Status | Detalhes |
|-----------|--------|----------|
| shared/errors/AppError.js | ✅ Completo | `AppError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError` |
| shared/config/database.js | ✅ Completo | Factory `createSequelizeInstance()` com validação de env vars, connection pooling, logging per-service |

### ✅ API Gateway (100%)

| Componente | Status | Detalhes |
|-----------|--------|----------|
| server.js | ✅ Funcional | Express setup, proxy middleware, rate limiting, CORS, error handling |
| routes/index.js | ✅ Funcional | Proxy configurado para 10 microserviços via `http-proxy-middleware` |
| middlewares/rateLimit.js | ✅ Funcional | 100 req/min per user |
| config/logger.js | ✅ Funcional | Winston structured logging |

### ⚠️ Auth Service (30%)

| Componente | Status | O que falta |
|-----------|--------|-------------|
| server.js | ✅ Funcional | Express + Sequelize connection + health endpoint |
| routes/auth.routes.js | ✅ Estrutura | 5 rotas POST (`/login`, `/logout`, `/refresh-token`, `/forgot-password`, `/reset-password`) |
| controllers/auth.controller.js | ✅ Estrutura | Handlers chamam service (mas service lança erros) |
| middlewares/error.middleware.js | ✅ Funcional | Global error handler com tratamento JWT |
| config/database.js | ✅ Funcional | Usa factory shared |
| config/redis.js | ✅ Funcional | Redis client configurado |
| config/logger.js | ✅ Funcional | Winston |
| services/auth.service.js | ⚠️ TODOs | Todos os 5 métodos lançam `Error('não implementado ainda')` |
| models/ | ❌ Vazio | Faltam: `User.model.js`, `RefreshToken.model.js`, `PasswordResetToken.model.js` |
| repositories/ | ❌ Vazio | Faltam: `user.repository.js`, `token.repository.js` |

### ⚠️ Outros Microserviços (10%)

Todos os 9 serviços restantes (`user`, `project`, `timesheet`, `allocation`, `contract`, `financial`, `notification`, `export`, `audit`) possuem:

| Componente | Status | Detalhes |
|-----------|--------|----------|
| Dockerfile | ✅ Completo | Build context `./server`, copia shared/ |
| server.js | ✅ Skeleton | Express + health endpoint (alguns conectam DB/Redis) |
| config/database.js | ✅ Funcional | Usa factory shared (exceto notification) |
| Restante | ❌ Ausente | Sem routes, controllers, services, models, repositories |

**Observação**: `notification-service` usa Redis Pub/Sub e Socket.io (configurado), `audit-service` usa PostgreSQL JSONB (configurado). Ambos aceitam conexões mas não possuem lógica implementada.

### ⚠️ Frontend (5%)

| Componente | Status | Detalhes |
|-----------|--------|----------|
| Dockerfile + nginx.conf | ✅ Completo | Multi-stage build, SPA routing configurado |
| package.json | ⚠️ Mínimo | Apenas `react` e `react-dom` — faltam axios, zustand, react-router, etc. |
| App.jsx | ⚠️ Boilerplate | Template padrão Vite — contador simples |
| services/api.js | ❌ Ausente | (existe no plano mas não encontrado no src/) |
| services/authService.js | ❌ Ausente | (existe no plano mas não encontrado no src/) |
| store/authStore.js | ❌ Ausente | (existe no plano mas não encontrado no src/) |

### ❌ Não Implementado (0%)

- **Modelos Sequelize** — nenhum definido em nenhum serviço
- **Repositórios** — camada de acesso a dados ausente
- **Lógica de negócio** — todos os services lançam erros
- **Migrações de banco** — schemas não criados
- **Sistema RBAC** — roles e permissions não implementados
- **Frontend páginas/componentes** — sem React Router, sem páginas, sem UI library
- **Testes** — Jest/Supertest instalados mas zero arquivos `.test.js` ou `.spec.js`
- **WebSocket handlers** — Socket.io configurado mas sem event handlers
- **Bull queues** — export-service não possui jobs definidos

## Deployment Configuration

### VM Production Setup

- **URL**: http://interno.sandech.local:8500/intime/
- **PostgreSQL**: Port 5433 on host (5432 internal) — **SEPARATE** from `worklocation-db` on port 5432
- **Redis**: Port 6379 (shared with VM, no conflicts)
- **Network**: `intime-network` (isolated bridge) — no cross-project access

### Port Map

| Host Port | Internal Port | Service | Accessibility |
|-----------|---------------|---------|---------------|
| 8500 | 80 | nginx | Public entry point |
| 5433 | 5432 | intime-postgres | External (PgAdmin) |
| 6379 | 6379 | intime-redis | External (RedisInsight) |
| — | 3000 | api-gateway | Internal only (via nginx) |
| — | 3001-3010 | microservices | Internal only (via gateway) |
| — | 80 | client | Internal only (via nginx) |

### Environment Variables

**`.env` (project root):**
```env
INTIME_DB_PASSWORD=<strong_password>
```

**`server/.env` (all microservices):**
- `DB_HOST`, `DB_USER`, `DB_PASSWORD` — overridden by docker-compose for containers
- `JWT_SECRET` — must be set before first deploy
- `REDIS_HOST` — overridden to `redis` in docker-compose
- Service URLs — overridden to internal container names in docker-compose

See `DEPLOY.md` for complete deployment instructions.
