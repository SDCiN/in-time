# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**iN!Time** is an enterprise project management system focused on resource management (allocation, timesheets, rate cards), financial management (EVM - Earned Value Management, forecasting, budget tracking), portfolio management, and advanced analytics.

**Architecture Type**: Client-Server with MVC + Middlewares + Microservices
- **Frontend (Client)**: React 18 with JavaScript (NOT TypeScript) — SPA in `client/` directory
- **Backend (Server)**: Node.js with JavaScript (NOT TypeScript) — microservices in `server/` directory
- **Language**: All code in JavaScript; documentation and UI text in Portuguese (pt-BR)

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
│   │   │   │   ├── models/       # Sequelize/Mongoose models
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
| AUDIT-SERVICE | 3010 | Immutable append-only logs in MongoDB time-series |

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
✅ Sequelize/Mongoose queries
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
✅ Sequelize.define() / mongoose.Schema()
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

**Frontend**: React 19.2 + Vite 7, React Router 6, React Query 5 (server state), Zustand 4 (client state), shadcn/ui + Radix UI, Tailwind CSS 3, React Hook Form + Zod, Recharts + D3.js, Axios, Socket.io Client

**Backend**: Node.js 18 LTS, Express.js 4.21, Sequelize 6.37 (PostgreSQL), Mongoose 7 (MongoDB), PM2 5, jsonwebtoken 9, bcryptjs 2, helmet 8, cors 2, express-rate-limit 7, Joi 17, Socket.io 4, Bull 4, Winston 3, prom-client 15

**Databases**: PostgreSQL 14 (transactional data), MongoDB 6 (audit logs, notifications, exports), Redis 7 (cache, sessions, pub/sub, queues, token blacklist)

**Infrastructure**: Nginx 1.24+ (reverse proxy), Docker 24, Kubernetes 1.28+ (production optional), Prometheus + Grafana (monitoring), Loki + Promtail (logging), GitHub Actions (CI/CD)

## Development Commands

### Frontend (client/)
```bash
cd client/
npm install
npm run dev           # Vite dev server (HMR)
npm run build         # Production build
npm run preview       # Preview production build
npm run lint          # ESLint check
```

### Backend (server/)
```bash
# Start all services with Docker Compose
docker-compose up -d

# Start specific service
docker-compose up -d auth-service

# Without Docker (manual)
cd server/services/auth-service
npm install
npm run dev           # nodemon for auto-reload
npm start             # production mode

# Run tests
npm test                           # All tests
npm run test:watch                 # Watch mode
npm run test:coverage              # With coverage report
npx jest path/to/test.spec.js     # Single test file

# Linting
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix issues

# PM2 (production)
cd server/
pm2 start ecosystem.config.js     # Start all services
pm2 logs project-service          # View logs
pm2 restart all                   # Restart all
pm2 stop all                      # Stop all
pm2 delete all                    # Delete all processes
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
bull:export-jobs:*          # Bull queue keys
```

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
2. **React Query + Zustand** instead of Redux — 90% server state, 10% client state
3. **Sequelize** over Prisma — team familiarity, mature transaction support
4. **JWT** over sessions — stateless, horizontally scalable
5. **Redis Pub/Sub** over RabbitMQ — simpler, Redis already in stack; migrate to Kafka if volume exceeds 10M msgs/day

## Implementation Status

> **Estado atual**: Projeto em scaffolding inicial (~5-10% implementado)

### ✅ Implementado

| Componente | Status | Detalhes |
|-----------|--------|----------|
| API Gateway | ✅ Funcional | Proxy para 10 serviços, rate limiting, CORS, logging |
| shared/errors | ✅ Completo | `AppError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError` |
| shared/config/database | ✅ Completo | Factory Sequelize com validação de env vars e connection pooling |
| auth-service/server.js | ✅ Funcional | Express setup, conexão DB, middlewares |
| auth-service/controllers | ✅ Estrutura | 5 endpoints HTTP (login, logout, refresh, forgot-password, reset-password) |
| auth-service/routes | ✅ Estrutura | 5 rotas POST definidas |
| auth-service/middlewares | ✅ Funcional | Global error handler com tratamento de erros JWT |
| client/services/api.js | ✅ Funcional | Axios com interceptors JWT e refresh token |
| client/services/authService.js | ✅ Funcional | Wrapper dos métodos de auth |
| client/store/authStore.js | ✅ Funcional | Zustand store com persistência localStorage |
| docker-compose.yml | ✅ Funcional | postgres, mongodb, redis, api-gateway, auth-service |

### ⚠️ Esqueleto (Estrutura criada, sem implementação)

| Componente | Status | O que falta |
|-----------|--------|-------------|
| auth-service/services | ⚠️ Stub | `auth.service.js` — todos os métodos lançam `NotImplemented` |
| auth-service/models | ❌ Ausente | Modelos User, RefreshToken |
| auth-service/repositories | ❌ Ausente | Camada de acesso a dados |
| user-service | ⚠️ Esqueleto | Apenas `src/config/database.js` |
| project-service | ⚠️ Esqueleto | Apenas `src/config/database.js` |
| timesheet-service | ⚠️ Esqueleto | Apenas `src/config/database.js` |
| allocation-service | ⚠️ Esqueleto | Apenas `src/config/database.js` |
| contract-service | ⚠️ Esqueleto | Apenas `src/config/database.js` |
| financial-service | ⚠️ Esqueleto | Apenas `src/config/database.js` |
| notification-service | ⚠️ Esqueleto | Apenas `src/config/database.js` |
| export-service | ⚠️ Esqueleto | Apenas `src/config/database.js` |
| audit-service | ⚠️ Esqueleto | Apenas `src/config/database.js` |
| client/App.jsx | ⚠️ Template | Boilerplate padrão Vite — sem páginas, layouts ou roteamento |

### ❌ Não implementado

- Modelos Sequelize (nenhum definido)
- Migrações de banco de dados
- Sistema RBAC (papéis e permissões)
- Páginas e componentes do frontend (shadcn/ui não instalado no client)
- Testes (Jest/Supertest instalados mas sem arquivos de teste)

## Known Issues

- **API Gateway bug**: `server/api-gateway/src/server.js` declara `const app` duas vezes (linha ~10 e ~13)
- **Client deps**: `client/package.json` não lista axios, zustand, react-router — instalá-los com `npm install`
- **Auth service stub**: `auth.service.js` lança erros em todos os métodos — implementação pendente
- **Env centralizado**: `server/.env` contém credenciais reais — não commitar; usar `.env.example` como referência
