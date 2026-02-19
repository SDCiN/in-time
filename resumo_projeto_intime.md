# 📘 iN!Time - Arquitetura MVC + Microserviços

## Documentação Técnica - Versão 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Microserviços](#microserviços)
4. [Padrão MVC](#padrão-mvc)
5. [Stack Tecnológico](#stack-tecnológico)
6. [Comunicação Entre Serviços](#comunicação-entre-serviços)
7. [Segurança](#segurança)
8. [Escalabilidade](#escalabilidade)
9. [Banco de Dados](#banco-de-dados)
10. [Deployment](#deployment)
11. [Monitoramento e Observabilidade](#monitoramento-e-observabilidade)
12. [Boas Práticas](#boas-práticas)
13. [Decisões Arquiteturais](#decisões-arquiteturais)
14. [Roadmap](#roadmap)

---

## 🎯 Visão Geral

### Sobre o iN!Time

O **iN!Time** é um sistema enterprise de gestão de projetos com foco em:

- **Gestão de Recursos Humanos**: Alocação, timesheet, rate cards
- **Gestão Financeira**: EVM (Earned Value Management), forecasting, budget tracking
- **Gestão de Portfólio**: Hierarquia multi-nível de projetos
- **Analytics Avançado**: Dashboards, relatórios customizados, predição por ML
- **Auditoria Completa**: Rastreabilidade de todas as operações

### Objetivos da Arquitetura

1. **Modularidade**: Serviços independentes e coesos
2. **Escalabilidade**: Horizontal e vertical
3. **Manutenibilidade**: Código limpo, testável e documentado
4. **Performance**: P95 < 500ms, P99 < 1000ms
5. **Confiabilidade**: Uptime > 99.5%
6. **Segurança**: RBAC, JWT, auditoria completa

---

## 🏛️ Arquitetura do Sistema

### Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React 18 SPA + Vite                                     │  │
│  │  • React Router 6 (SPA routing)                          │  │
│  │  • React Query (server state)                            │  │
│  │  • Zustand (client state)                                │  │
│  │  • Socket.io Client (real-time)                          │  │
│  │  • Tailwind CSS + shadcn/ui                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS/WSS
┌────────────────────────────▼────────────────────────────────────┐
│                         EDGE LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  NGINX (Reverse Proxy + Load Balancer)                  │  │
│  │  • SSL Termination (Let's Encrypt)                       │  │
│  │  • Rate Limiting (global: 1000 req/min)                  │  │
│  │  • Static Assets Serving                                 │  │
│  │  • Gzip Compression                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     API GATEWAY LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Gateway (Express.js + http-proxy-middleware)        │  │
│  │  • JWT Verification                                       │  │
│  │  • Request Routing                                        │  │
│  │  • Rate Limiting (per user: 100 req/min)                 │  │
│  │  • API Versioning (/api/v1)                               │  │
│  │  • CORS Configuration                                     │  │
│  │  • Request/Response Logging                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└───┬────┬────┬────┬────┬────┬────┬────┬────┬────┬──────────────┘
    │    │    │    │    │    │    │    │    │    │
┌───▼┐ ┌─▼┐ ┌─▼┐ ┌─▼┐ ┌─▼┐ ┌─▼┐ ┌─▼┐ ┌─▼┐ ┌─▼┐ ┌─▼┐
│Auth│ │Usr│ │Prj│ │Tim│ │All│ │Cnt│ │Fin│ │Ntf│ │Exp│ │Aud│
│Svc │ │Svc│ │Svc│ │Svc│ │Svc│ │Svc│ │Svc│ │Svc│ │Svc│ │Svc│
└─┬──┘ └─┬┘ └─┬┘ └─┬┘ └─┬┘ └─┬┘ └─┬┘ └─┬┘ └─┬┘ └─┬┘
  │      │    │    │    │    │    │    │    │    │
  └──────┴────┴────┴────┴────┴────┴────┴────┴────┘
                        │
       ┌────────────────┼────────────────┐
       │                │                │
  ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
  │PostgreSQL│    │  Redis  │     │ MongoDB │
  │ Primary │     │ Cluster │     │ Cluster │
  └────┬────┘     └─────────┘     └─────────┘
       │
  ┌────▼────┐
  │PostgreSQL│
  │ Replica │
  └─────────┘
```

### Tipo de Arquitetura

**Monolito Modular Distribuído** com características de microserviços:

- ✅ **Serviços independentes** (cada um com seu próprio repositório lógico)
- ✅ **Deploy independente** (containerização individual)
- ✅ **Escalabilidade independente** (cada serviço escala conforme necessidade)
- ✅ **Banco de dados compartilhado** (PostgreSQL central com acesso por domínio)
- ✅ **Comunicação síncrona e assíncrona** (REST + Event-driven)

### Justificativa

**Por que não microserviços puros?**

1. **Complexidade de dados**: Alto acoplamento entre domínios (projetos, timesheet, alocação)
2. **Transações distribuídas**: Evitar complexidade de Saga pattern em fase inicial
3. **Time pequeno**: Facilita desenvolvimento e debugging
4. **Performance**: Queries cross-domain mais rápidas (sem latência de rede)
5. **Migração futura**: Arquitetura permite extrair serviços para microserviços reais quando necessário

---

## 🔧 Microserviços

### 1. **AUTH-SERVICE** 🔐

**Responsabilidade**: Autenticação e autorização central

**Porta**: 3001

**Endpoints Principais**:
```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/validate (internal)
```

**Tecnologias**:
- Express.js 4.x
- jsonwebtoken 9.x
- bcryptjs 2.x
- Redis (token blacklist)

**Dados Gerenciados**:
- `users` (credenciais)
- `refresh_tokens`
- `password_reset_tokens`
- `login_attempts` (rate limiting)

**Características**:
- ✅ JWT com refresh token rotation
- ✅ Bloqueio de conta após 5 tentativas falhas
- ✅ Expiração: 1h (access) + 7d (refresh)
- ✅ Blacklist de tokens em Redis
- ✅ Password reset via email (token válido por 1h)

---

### 2. **USER-SERVICE** 👥

**Responsabilidade**: Gestão de usuários e perfis

**Porta**: 3002

**Endpoints Principais**:
```
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
GET    /api/v1/users/:id/permissions
PUT    /api/v1/users/:id/profile
GET    /api/v1/roles
```

**Dados Gerenciados**:
- `users` (perfil, metadados)
- `roles` (8 níveis hierárquicos)
- `permissions` (30+ permissões granulares)
- `user_roles`
- `role_permissions`
- `user_preferences`

**Características**:
- ✅ RBAC hierárquico (Admin → Viewer)
- ✅ Herança de permissões (roles filhos herdam de pais)
- ✅ Permissões granulares por entidade
- ✅ User preferences (tema, idioma, notificações)

---

### 3. **PROJECT-SERVICE** 📊

**Responsabilidade**: Gestão de projetos e portfólios

**Porta**: 3003

**Endpoints Principais**:
```
GET    /api/v1/projects
GET    /api/v1/projects/:id
POST   /api/v1/projects
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
GET    /api/v1/projects/:id/health
GET    /api/v1/portfolios
GET    /api/v1/portfolios/:id/projects
```

**Dados Gerenciados**:
- `projects`
- `portfolios` (hierarquia parent-child)
- `project_status`
- `project_metadata`

**Características**:
- ✅ Status: Active, On Hold, Completed, Cancelled
- ✅ Budget tracking
- ✅ Project manager assignment
- ✅ Portfolio drill-down
- ✅ Validação de transição de status

---

### 4. **TIMESHEET-SERVICE** ⏱️

**Responsabilidade**: Gestão de timesheets e aprovações

**Porta**: 3004

**Endpoints Principais**:
```
GET    /api/v1/timesheets
POST   /api/v1/timesheets
PUT    /api/v1/timesheets/:id
POST   /api/v1/timesheets/:id/submit
POST   /api/v1/timesheets/:id/approve
POST   /api/v1/timesheets/:id/reject
POST   /api/v1/timesheets/bulk-submit
GET    /api/v1/timesheets/weekly
GET    /api/v1/timesheets/monthly
```

**Dados Gerenciados**:
- `timesheets`
- `timesheet_approvals`
- `timesheet_comments`

**Características**:
- ✅ Workflow: Draft → Submitted → Approved/Rejected
- ✅ Validações: max 24h/dia, sem datas futuras
- ✅ Submissão em lote (semana completa)
- ✅ Comentários em aprovação/rejeição
- ✅ Histórico completo de mudanças

---

### 5. **ALLOCATION-SERVICE** 🧑‍💼

**Responsabilidade**: Alocação de recursos e rate cards

**Porta**: 3005

**Endpoints Principais**:
```
GET    /api/v1/allocations
POST   /api/v1/allocations
PUT    /api/v1/allocations/:id
DELETE /api/v1/allocations/:id
GET    /api/v1/allocations/conflicts
GET    /api/v1/users/:id/availability
GET    /api/v1/rate-cards
POST   /api/v1/rate-cards
```

**Dados Gerenciados**:
- `allocations`
- `rate_cards`
- `rate_history`
- `allocation_conflicts`

**Características**:
- ✅ Dedicação por % (0-100%)
- ✅ Período de alocação (start/end date)
- ✅ Detecção de superalocação (>100%)
- ✅ Rate card por alocação (custo/hora)
- ✅ Histórico de mudanças de rates

---

### 6. **CONTRACT-SERVICE** 📄

**Responsabilidade**: Gestão de contratos, frames e clientes

**Porta**: 3006

**Endpoints Principais**:
```
GET    /api/v1/clients
POST   /api/v1/clients
GET    /api/v1/contracts
POST   /api/v1/contracts
GET    /api/v1/contracts/:id/frames
POST   /api/v1/frames
PUT    /api/v1/frames/:id/budget
```

**Dados Gerenciados**:
- `clients`
- `contracts`
- `frames` (subdivisões de contrato)
- `frame_budgets`

**Características**:
- ✅ Vinculação projeto → frame → contrato → cliente
- ✅ Orçamento por frame
- ✅ Controle de budget consumido
- ✅ Histórico de alterações contratuais

---

### 7. **FINANCIAL-SERVICE** 💰

**Responsabilidade**: EVM, forecasting e cálculos financeiros

**Porta**: 3007

**Endpoints Principais**:
```
GET    /api/v1/financial/projects/:id/evm
GET    /api/v1/financial/projects/:id/forecast
GET    /api/v1/financial/projects/:id/budget-health
GET    /api/v1/financial/portfolios/:id/consolidated
GET    /api/v1/financial/projects/:id/burn-rate
```

**Dados Gerenciados**:
- Acesso read-only a: `projects`, `timesheets`, `allocations`, `rate_cards`
- Cache Redis: métricas pré-calculadas

**Métricas EVM Calculadas**:
- **PV** (Planned Value): Valor planejado
- **EV** (Earned Value): Valor agregado
- **AC** (Actual Cost): Custo real
- **BAC** (Budget at Completion): Orçamento total
- **CPI** (Cost Performance Index): EV / AC
- **SPI** (Schedule Performance Index): EV / PV
- **CV** (Cost Variance): EV - AC
- **SV** (Schedule Variance): EV - PV
- **EAC** (Estimate at Completion): BAC / CPI
- **ETC** (Estimate to Complete): EAC - AC
- **VAC** (Variance at Completion): BAC - EAC

**Forecasting**:
- ✅ Regressão linear (regression-js)
- ✅ Projeção de burn rate
- ✅ Data estimada de conclusão
- ✅ Confidence score (R²)
- ✅ Risk factors automáticos

**Características**:
- ✅ Cálculos intensivos em background (cron: a cada 15min)
- ✅ Cache Redis (TTL: 15min)
- ✅ Alertas de variação orçamentária (>10%)
- ✅ Database replica para queries pesadas

---

### 8. **NOTIFICATION-SERVICE** 🔔

**Responsabilidade**: Notificações real-time e email

**Porta**: 3008

**Endpoints Principais**:
```
GET    /api/v1/notifications
PUT    /api/v1/notifications/:id/read
POST   /api/v1/notifications/preferences
GET    /api/v1/notifications/unread-count
WS     /socket.io (real-time)
```

**Dados Gerenciados** (MongoDB):
- `notifications`
- `notification_preferences`
- `email_queue`

**Características**:
- ✅ WebSocket real-time (Socket.io + Redis Pub/Sub)
- ✅ Email notifications (Nodemailer)
- ✅ Centro de notificações (histórico)
- ✅ Badge de não lidas
- ✅ Preferências por usuário (email on/off, push on/off)
- ✅ Tipos de alerta: budget, schedule, approval, allocation

---

### 9. **EXPORT-SERVICE** 📥

**Responsabilidade**: Geração de relatórios e exportações

**Porta**: 3009

**Endpoints Principais**:
```
POST   /api/v1/exports/create
GET    /api/v1/exports/:jobId/status
GET    /api/v1/exports/:jobId/download
GET    /api/v1/exports/history
DELETE /api/v1/exports/:jobId
```

**Dados Gerenciados** (MongoDB):
- `export_jobs` (status: pending, processing, completed, failed)
- `export_history`

**Formatos Suportados**:
- ✅ Excel (.xlsx) - ExcelJS com streaming
- ✅ CSV - Papa Parse
- ✅ PDF - PDFKit
- ✅ JSON

**Características**:
- ✅ Processamento assíncrono (Bull Queue)
- ✅ Report Wizard (query builder customizável)
- ✅ Upload para S3 (retenção: 7 dias)
- ✅ Notificação ao concluir
- ✅ Download manager com tracking
- ✅ Compressão ZIP para múltiplos arquivos

---

### 10. **AUDIT-SERVICE** 📝

**Responsabilidade**: Auditoria e logs imutáveis

**Porta**: 3010

**Endpoints Principais**:
```
POST   /api/v1/audit/log (internal only)
GET    /api/v1/audit/logs
GET    /api/v1/audit/entity/:entityType/:entityId
GET    /api/v1/audit/user/:userId/actions
GET    /api/v1/audit/export
```

**Dados Gerenciados** (MongoDB - time-series):
- `audit_logs`

**Campos de Auditoria**:
```javascript
{
  timestamp: Date,
  userId: UUID,
  action: String,       // CREATE, UPDATE, DELETE, APPROVE, etc.
  entityType: String,   // project, timesheet, allocation, etc.
  entityId: UUID,
  changes: Object,      // { field: { old, new } }
  ipAddress: String,
  userAgent: String,
  metadata: Object
}
```

**Características**:
- ✅ Logs imutáveis (append-only)
- ✅ Rastreabilidade completa
- ✅ Retention: 30 dias (configurável)
- ✅ Indexação por entidade e usuário
- ✅ Exportação para análise forense

---

## 🎨 Padrão MVC

### Estrutura de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (VIEW)                        │
│  React Components → Estado (React Query + Zustand)         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST API
┌────────────────────────▼────────────────────────────────────┐
│                    CONTROLLER LAYER                         │
│  • Recebe requisições HTTP                                  │
│  • Valida entrada (express-validator)                       │
│  • Chama Service Layer                                      │
│  • Retorna resposta formatada                               │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     SERVICE LAYER                           │
│  • Business logic                                           │
│  • Orquestração de repositories                             │
│  • Validações de negócio                                    │
│  • Event publishing                                         │
│  • Transações complexas                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   REPOSITORY LAYER                          │
│  • Acesso ao banco de dados                                 │
│  • Queries SQL (via Sequelize ORM)                          │
│  • CRUD operations                                          │
│  • Data mapping                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      MODEL LAYER                            │
│  • Definição de schemas (Sequelize Models)                  │
│  • Validações de dados                                      │
│  • Relationships (associations)                             │
│  • Hooks (beforeCreate, afterUpdate, etc.)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                       DATABASE                              │
│  PostgreSQL + MongoDB + Redis                               │
└─────────────────────────────────────────────────────────────┘
```

### Responsabilidades por Camada

#### **1. Controller**
```javascript
// Responsabilidades:
✅ Receber requisição HTTP
✅ Extrair parâmetros (params, query, body)
✅ Validar entrada (via middleware)
✅ Chamar service apropriado
✅ Formatar resposta (JSON)
✅ Tratamento de erros HTTP

// NÃO deve:
❌ Conter business logic
❌ Acessar database diretamente
❌ Manipular models diretamente
```

#### **2. Service**
```javascript
// Responsabilidades:
✅ Business logic (regras de negócio)
✅ Validações complexas
✅ Orquestração de múltiplos repositories
✅ Publicação de eventos
✅ Gestão de transações
✅ Cálculos complexos (EVM, forecasting)

// NÃO deve:
❌ Conhecer detalhes HTTP (req, res)
❌ Conter queries SQL diretas
❌ Acessar models diretamente (usar repository)
```

#### **3. Repository**
```javascript
// Responsabilidades:
✅ Acesso ao banco de dados
✅ Queries SQL (via ORM)
✅ CRUD operations
✅ Paginação
✅ Filtros e ordenação
✅ Aggregations

// NÃO deve:
❌ Conter business logic
❌ Validações de negócio
❌ Publicação de eventos
```

#### **4. Model**
```javascript
// Responsabilidades:
✅ Definição de schema
✅ Validações de dados (tipo, tamanho, formato)
✅ Relationships (hasMany, belongsTo)
✅ Hooks (lifecycle events)
✅ Virtual fields
✅ Indexes

// NÃO deve:
❌ Conter business logic complexa
❌ Fazer chamadas HTTP
❌ Acessar outros serviços
```

---

## 🛠️ Stack Tecnológico

### Frontend

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Framework** | React | 18.x | Componentes, hooks, concurrent rendering |
| **Build Tool** | Vite | 4.x | HMR rápido, builds otimizados |
| **Routing** | React Router | 6.x | SPA navigation, lazy loading |
| **Server State** | React Query | 5.x | Cache, invalidação, background sync |
| **Client State** | Zustand | 4.x | Leve, simples, type-safe |
| **UI Components** | shadcn/ui + Radix UI | - | Acessíveis, customizáveis |
| **Styling** | Tailwind CSS | 3.x | Utility-first, performance |
| **Forms** | React Hook Form + Zod | 7.x + 3.x | Performance, type-safe validation |
| **Charts** | Recharts + D3.js | 2.x + 7.x | Dashboards, visualizações complexas |
| **HTTP Client** | Axios | 1.x | Interceptors, cancelamento |
| **WebSocket** | Socket.io Client | 4.x | Real-time notifications |

### Backend

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Runtime** | Node.js | 18 LTS | Estável, suporte até 2025 |
| **Framework** | Express.js | 4.x | Minimalista, maduro, ecosystem |
| **ORM** | Sequelize | 6.x | PostgreSQL, migrations, associations |
| **ODM** | Mongoose | 7.x | MongoDB, schemas, validations |
| **Process Manager** | PM2 | 5.x | Cluster mode, auto-restart |
| **Authentication** | jsonwebtoken | 9.x | JWT generation/validation |
| **Security** | helmet + cors | 7.x + 2.x | Headers, CORS config |
| **Rate Limiting** | express-rate-limit | 7.x | DDoS protection |
| **Validation** | Joi | 17.x | Schema validation |
| **WebSocket** | Socket.io | 4.x | Real-time bi-directional |
| **Queue** | Bull | 4.x | Background jobs, retry |
| **Logging** | Winston | 3.x | Structured logs, JSON |
| **Monitoring** | prom-client | 15.x | Prometheus metrics |

### Databases

| Tipo | Tecnologia | Versão | Uso |
|------|-----------|--------|-----|
| **Relacional** | PostgreSQL | 14.x | Dados transacionais, EVM |
| **NoSQL** | MongoDB | 6.x | Logs, notificações, exports |
| **Cache** | Redis | 7.x | Cache, sessions, pub/sub, queues |

### Infrastructure

| Categoria | Tecnologia | Versão | Uso |
|-----------|-----------|--------|-----|
| **Web Server** | Nginx | 1.24+ | Reverse proxy, load balancer |
| **Container** | Docker | 24.x | Containerização |
| **Orchestration** | Kubernetes | 1.28+ | Production (opcional) |
| **Metrics** | Prometheus + Grafana | 2.x + 10.x | Monitoring |
| **Logs** | Loki + Promtail | 2.x | Centralized logging |
| **CI/CD** | GitHub Actions | - | Automated pipelines |
| **Storage** | MinIO / S3 | - | Object storage |

---

## 🔄 Comunicação Entre Serviços

### 1. Síncrona (HTTP REST)

**Quando usar**:
- ✅ Operações que exigem resposta imediata
- ✅ CRUD operations
- ✅ Queries de leitura

**Implementação**:
```javascript
// API Gateway → Microserviço
app.use('/api/v1/projects', createProxyMiddleware({
  target: 'http://project-service:3003',
  changeOrigin: true,
}));

// Microserviço → Microserviço (via HTTP client)
const axios = require('axios');
const userService = axios.create({
  baseURL: process.env.USER_SERVICE_URL,
  timeout: 5000,
});

const user = await userService.get(`/api/v1/users/${userId}`);
```

**Vantagens**:
- ✅ Simples de implementar
- ✅ Resposta imediata
- ✅ Fácil debugging

**Desvantagens**:
- ❌ Acoplamento temporal (serviço destino deve estar disponível)
- ❌ Latência cumulativa em chamadas em cadeia

---

### 2. Assíncrona (Event-Driven via Redis Pub/Sub)

**Quando usar**:
- ✅ Notificações de eventos
- ✅ Eventual consistency
- ✅ Desacoplamento de serviços

**Fluxo**:
```
Project Service                    Notification Service
     │                                    │
     │  1. Projeto criado                 │
     │────────────────────────────────────│
     │                                    │
     │  2. Publica evento                 │
     │     "project.created"              │
     │          │                         │
     │          ▼                         │
     │      Redis Pub/Sub                 │
     │          │                         │
     │          └─────────────────────────┤
     │                                    │
     │                         3. Recebe evento
     │                                    │
     │                         4. Envia notificação
     │                                    │
```

**Implementação**:
```javascript
// Publisher (Project Service)
const redis = require('../config/redis');

class ProjectEventPublisher {
  async publishProjectCreated(payload) {
    const event = {
      type: 'project.created',
      data: payload,
      timestamp: new Date().toISOString(),
    };
    
    await redis.publish('project-events', JSON.stringify(event));
  }
}

// Subscriber (Notification Service)
class ProjectEventSubscriber {
  constructor() {
    this.subscriber = redis.duplicate();
    this.subscriber.subscribe('project-events');
    
    this.subscriber.on('message', async (channel, message) => {
      const event = JSON.parse(message);
      await this.handleEvent(event);
    });
  }
  
  async handleEvent(event) {
    if (event.type === 'project.created') {
      await notificationService.create({
        userId: event.data.managerId,
        type: 'project_created',
        message: `Project "${event.data.name}" created`,
      });
    }
  }
}
```

**Vantagens**:
- ✅ Desacoplamento temporal
- ✅ Escalabilidade (múltiplos subscribers)
- ✅ Resiliente a falhas de serviços

**Desvantagens**:
- ❌ Eventual consistency (não garante ordem)
- ❌ Mais complexo de debugar

---

### 3. Queue-Based (Bull com Redis)

**Quando usar**:
- ✅ Processamento em background
- ✅ Tarefas demoradas (exports, cálculos EVM)
- ✅ Retry automático

**Fluxo**:
```
Export Service                     Worker Process
     │                                   │
     │  1. Requisição de export          │
     │──────────────────────────────────►│
     │                                   │
     │  2. Cria job na fila              │
     │          │                        │
     │          ▼                        │
     │     Bull Queue (Redis)            │
     │          │                        │
     │          └───────────────────────►│
     │                                   │
     │                        3. Worker processa job
     │                                   │
     │                        4. Gera arquivo
     │                                   │
     │                        5. Upload S3
     │                                   │
     │  6. Notifica conclusão            │
     │◄──────────────────────────────────│
```

**Implementação**:
```javascript
// Export Service - Adicionar job à fila
const Queue = require('bull');
const exportQueue = new Queue('export-jobs', {
  redis: { host: 'localhost', port: 6379 }
});

// Controller
async createExport(req, res) {
  const job = await exportQueue.add('generate-report', {
    userId: req.user.id,
    reportType: req.body.type,
    filters: req.body.filters,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });
  
  res.json({ jobId: job.id, status: 'pending' });
}

// Worker Process
exportQueue.process('generate-report', async (job) => {
  const { userId, reportType, filters } = job.data;
  
  // 1. Query dados
  const data = await fetchData(filters);
  
  // 2. Gerar arquivo
  const fileBuffer = await generateExcel(data);
  
  // 3. Upload S3
  const s3Url = await uploadToS3(fileBuffer, `reports/${job.id}.xlsx`);
  
  // 4. Atualizar status
  await ExportJob.update(job.id, {
    status: 'completed',
    downloadUrl: s3Url,
  });
  
  // 5. Notificar usuário
  await notificationService.create({
    userId,
    type: 'export_ready',
    message: 'Your report is ready for download',
  });
  
  return { s3Url };
});
```

**Vantagens**:
- ✅ Retry automático em caso de falha
- ✅ Priorização de jobs
- ✅ Rate limiting (controle de throughput)
- ✅ Monitoring (jobs pending, active, completed)

**Desvantagens**:
- ❌ Redis como single point of failure (mitigar com cluster)
- ❌ Complexidade adicional

---

### Comparação de Padrões

| Aspecto | HTTP REST | Pub/Sub | Queue |
|---------|-----------|---------|-------|
| **Latência** | Baixa (ms) | Média (ms) | Alta (s-min) |
| **Acoplamento** | Forte | Fraco | Fraco |
| **Garantia de entrega** | Sim | Não | Sim |
| **Retry** | Manual | Manual | Automático |
| **Ordem** | Garantida | Não garantida | Garantida (por fila) |
| **Uso** | CRUD, queries | Notificações | Background jobs |

---

## 🔐 Segurança

### 1. Autenticação (JWT)

**Fluxo de Login**:
```
1. User → POST /api/v1/auth/login { email, password }
2. Auth Service → Valida credenciais
3. Auth Service → Gera access token (1h) + refresh token (7d)
4. Auth Service → Salva refresh token em DB
5. User ← { accessToken, refreshToken }
6. User → Armazena tokens (localStorage)
7. User → Requisições subsequentes com Authorization: Bearer {accessToken}
```

**Estrutura do JWT**:
```javascript
// Access Token (1h)
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "project_manager",
  "permissions": ["projects.view", "projects.create", ...],
  "iat": 1234567890,
  "exp": 1234571490  // 1h depois
}

// Refresh Token (7d)
{
  "sub": "user-uuid",
  "jti": "token-uuid",  // ID único do token
  "iat": 1234567890,
  "exp": 1235172690  // 7d depois
}
```

**Refresh Token Rotation**:
```javascript
// Fluxo:
1. Access token expira (1h)
2. Frontend detecta 401 Unauthorized
3. Frontend → POST /api/v1/auth/refresh { refreshToken }
4. Auth Service → Valida refresh token
5. Auth Service → Gera NOVO par de tokens
6. Auth Service → Invalida refresh token antigo (blacklist)
7. Frontend ← { accessToken, refreshToken }
8. Frontend → Atualiza tokens e retenta requisição original
```

---

### 2. Autorização (RBAC)

**Hierarquia de Roles (8 níveis)**:
```
1. Admin              (todas as permissões)
   ↓
2. Super Manager      (gestão multi-portfólio)
   ↓
3. Portfolio Manager  (gestão de portfólio)
   ↓
4. Project Manager    (gestão de projeto)
   ↓
5. Team Lead          (aprovação de timesheet)
   ↓
6. Senior Member      (edição de timesheet próprio)
   ↓
7. Member             (preenchimento de timesheet)
   ↓
8. Viewer             (somente leitura)
```

**Permissões Granulares (30+)**:
```javascript
// Estrutura: {entidade}.{ação}
const permissions = [
  // Users
  'users.view', 'users.create', 'users.update', 'users.delete',
  
  // Projects
  'projects.view', 'projects.create', 'projects.update', 'projects.delete',
  'projects.view_budget', 'projects.manage_budget',
  
  // Timesheets
  'timesheets.view_own', 'timesheets.view_all',
  'timesheets.create', 'timesheets.update_own', 'timesheets.update_all',
  'timesheets.submit', 'timesheets.approve', 'timesheets.reject',
  
  // Allocations
  'allocations.view', 'allocations.create', 'allocations.update', 'allocations.delete',
  
  // Contracts
  'contracts.view', 'contracts.create', 'contracts.update',
  
  // Financial
  'financial.view_evm', 'financial.view_forecast', 'financial.export',
  
  // Reports
  'reports.create', 'reports.export',
  
  // Admin
  'admin.roles', 'admin.permissions', 'admin.audit',
];
```

**Middleware de Autorização**:
```javascript
// rbac.middleware.js
const hasPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const userPermissions = req.user.permissions; // do JWT
    
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions',
        required: requiredPermission,
      });
    }
    
    next();
  };
};

// Uso em rotas:
router.post('/projects',
  authMiddleware.verifyToken,
  rbacMiddleware.hasPermission('projects.create'),
  projectController.create
);
```

---

### 3. Proteções Implementadas

| Proteção | Implementação | Parâmetros |
|----------|---------------|------------|
| **Rate Limiting (Login)** | express-rate-limit | 5 req/min por IP |
| **Rate Limiting (API)** | express-rate-limit | 100 req/min por user |
| **Account Lockout** | Custom middleware | 5 tentativas → lock 15min |
| **Password Hashing** | bcryptjs | 10 rounds |
| **JWT Signing** | jsonwebtoken | SHA256 |
| **HTTPS** | Let's Encrypt | TLS 1.2+ |
| **CORS** | cors middleware | Whitelist de origens |
| **CSRF** | csurf | Token em forms |
| **XSS** | helmet + output encoding | CSP headers |
| **SQL Injection** | Sequelize (parameterized) | ORM queries |
| **Security Headers** | helmet | HSTS, X-Frame-Options, etc. |

**Configuração Helmet**:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https://api.intime.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

### 4. Auditoria de Segurança

**Eventos Auditados**:
- ✅ Login/Logout (sucesso e falha)
- ✅ Mudanças de senha
- ✅ Criação/exclusão de usuários
- ✅ Alterações de permissões
- ✅ Operações financeiras (budget, EVM)
- ✅ Aprovações de timesheet
- ✅ Exports de dados sensíveis

**Log de Auditoria**:
```javascript
{
  "timestamp": "2026-02-12T14:30:00Z",
  "userId": "uuid",
  "action": "LOGIN_SUCCESS",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "email": "user@example.com",
    "role": "project_manager"
  }
}
```

---

## ⚡ Escalabilidade

### Horizontal Scaling

**Node.js Cluster Mode (PM2)**:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'project-service',
      script: './src/server.js',
      instances: 4,  // 4 processos
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
  ],
};
```

**Nginx Load Balancing**:
```nginx
upstream project_service {
  least_conn;  # Algoritmo: menor número de conexões
  server project-service-1:3003 weight=1;
  server project-service-2:3003 weight=1;
  server project-service-3:3003 weight=1;
  server project-service-4:3003 weight=1;
}

server {
  listen 80;
  
  location /api/v1/projects {
    proxy_pass http://project_service;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

---

### Vertical Scaling

**Capacidade por Serviço** (estimativa para 500 usuários simultâneos):

| Serviço | CPU | RAM | Instâncias | Total CPU | Total RAM |
|---------|-----|-----|------------|-----------|-----------|
| **API Gateway** | 1 core | 512 MB | 2 | 2 cores | 1 GB |
| **Auth Service** | 0.5 core | 256 MB | 2 | 1 core | 512 MB |
| **User Service** | 0.5 core | 512 MB | 2 | 1 core | 1 GB |
| **Project Service** | 1 core | 1 GB | 3 | 3 cores | 3 GB |
| **Timesheet Service** | 1 core | 1 GB | 4 | 4 cores | 4 GB |
| **Allocation Service** | 0.5 core | 512 MB | 2 | 1 core | 1 GB |
| **Contract Service** | 0.5 core | 512 MB | 2 | 1 core | 1 GB |
| **Financial Service** | 2 cores | 2 GB | 2 | 4 cores | 4 GB |
| **Notification Service** | 1 core | 1 GB | 2 | 2 cores | 2 GB |
| **Export Service** | 2 cores | 2 GB | 3 | 6 cores | 6 GB |
| **Audit Service** | 0.5 core | 512 MB | 1 | 0.5 core | 512 MB |
| **TOTAL** | - | - | **25** | **25.5 cores** | **25 GB** |

**Database Sizing**:
- **PostgreSQL**: 4 cores, 8 GB RAM, 100 GB SSD
- **MongoDB**: 2 cores, 4 GB RAM, 50 GB SSD
- **Redis**: 2 cores, 4 GB RAM, 20 GB SSD

**Total Infrastructure**: ~33 cores, 37 GB RAM

---

### Auto-Scaling (Kubernetes HPA)

```yaml
# project-service-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: project-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: project-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 💾 Banco de Dados

### PostgreSQL (Principal)

**Schema Design**:

```sql
-- Users & Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  level INTEGER NOT NULL,  -- 1-8 hierarchy
  description TEXT
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,  -- e.g., "projects.create"
  description TEXT
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);

-- Projects
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES portfolios(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  budget DECIMAL(12,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  portfolio_id UUID REFERENCES portfolios(id),
  contract_id UUID,
  frame_id UUID,
  project_manager_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_portfolio ON projects(portfolio_id);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- Timesheets
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  date DATE NOT NULL,
  hours DECIMAL(4,2) NOT NULL CHECK (hours >= 0 AND hours <= 24),
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft',  -- draft, submitted, approved, rejected
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, project_id, date)
);

CREATE INDEX idx_timesheet_user_date ON timesheets(user_id, date DESC);
CREATE INDEX idx_timesheet_project_date ON timesheets(project_id, date DESC);
CREATE INDEX idx_timesheet_status ON timesheets(status) WHERE status IN ('submitted', 'approved');

-- Allocations
CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  start_date DATE NOT NULL,
  end_date DATE,
  dedication_percentage INTEGER CHECK (dedication_percentage >= 0 AND dedication_percentage <= 100),
  rate_per_hour DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_allocations_user ON allocations(user_id, start_date, end_date);
CREATE INDEX idx_allocations_project ON allocations(project_id, start_date, end_date);

-- Rate Cards
CREATE TABLE rate_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile VARCHAR(50) NOT NULL,  -- e.g., "Senior Developer"
  rate_per_hour DECIMAL(10,2) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contracts
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  total_budget DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id),
  name VARCHAR(100) NOT NULL,
  budget DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Partitioning Strategy** (para 500K+ timesheets):

```sql
-- Partition timesheets por ano
CREATE TABLE timesheets_2025 PARTITION OF timesheets
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE timesheets_2026 PARTITION OF timesheets
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

---

### MongoDB (Logs e Notificações)

**Collections**:

```javascript
// audit_logs (time-series collection)
{
  timestamp: ISODate("2026-02-12T14:30:00Z"),
  userId: "uuid",
  action: "CREATE",
  entityType: "project",
  entityId: "uuid",
  changes: {
    name: { old: null, new: "Project Alpha" },
    budget: { old: null, new: 100000 }
  },
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0..."
}

// Indexes
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ entityType: 1, entityId: 1 });
db.audit_logs.createIndex({ userId: 1, timestamp: -1 });

// notifications
{
  _id: ObjectId("..."),
  userId: "uuid",
  type: "project_created",
  title: "New Project Created",
  message: "Project 'Alpha' has been created",
  read: false,
  readAt: null,
  metadata: {
    projectId: "uuid",
    projectName: "Alpha"
  },
  createdAt: ISODate("2026-02-12T14:30:00Z")
}

// Indexes
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 dias TTL

// export_jobs
{
  _id: ObjectId("..."),
  userId: "uuid",
  status: "completed",  // pending, processing, completed, failed
  type: "excel",
  filters: { ... },
  downloadUrl: "https://s3.../reports/xyz.xlsx",
  createdAt: ISODate("..."),
  completedAt: ISODate("..."),
  expiresAt: ISODate("...")  // 7 dias após criação
}

// Index
db.export_jobs.createIndex({ userId: 1, createdAt: -1 });
db.export_jobs.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete
```

---

### Redis (Cache e Queues)

**Estrutura de Chaves**:

```
# Cache de EVM (TTL: 15min)
evm:project:{project_id} → JSON com métricas EVM

# Cache de permissões (TTL: 1h)
permissions:user:{user_id} → Set de permissões

# Sessions (TTL: 24h)
session:{session_id} → JSON com user data

# Token blacklist (TTL: 7d)
blacklist:token:{jti} → "revoked"

# Rate limiting (TTL: 1min)
ratelimit:login:{ip} → counter
ratelimit:api:{user_id} → counter

# Queues (Bull)
bull:export-jobs:waiting → Lista de jobs pendentes
bull:export-jobs:active → Lista de jobs em processamento
bull:export-jobs:completed → Lista de jobs concluídos
bull:export-jobs:failed → Lista de jobs falhados

# Pub/Sub channels
project-events → Canal para eventos de projetos
user-events → Canal para eventos de usuários
notification-events → Canal para notificações
```

**Configuração Redis Cluster** (HA):

```yaml
# Redis Sentinel (3 nós)
redis-master:
  image: redis:7-alpine
  command: redis-server --port 6379
  
redis-slave-1:
  image: redis:7-alpine
  command: redis-server --port 6379 --replicaof redis-master 6379
  
redis-slave-2:
  image: redis:7-alpine
  command: redis-server --port 6379 --replicaof redis-master 6379
  
sentinel-1:
  image: redis:7-alpine
  command: redis-sentinel /etc/redis/sentinel.conf
  
sentinel-2:
  image: redis:7-alpine
  command: redis-sentinel /etc/redis/sentinel.conf
  
sentinel-3:
  image: redis:7-alpine
  command: redis-sentinel /etc/redis/sentinel.conf
```

---

## 🚀 Deployment

### Ambientes

| Ambiente | Objetivo | Database | Infraestrutura |
|----------|----------|----------|----------------|
| **Development** | Desenvolvimento local | PostgreSQL local, MongoDB local, Redis local | Docker Compose |
| **Staging** | Testes e QA | PostgreSQL RDS, MongoDB Atlas, Redis ElastiCache | AWS ECS / K8s |
| **Production** | Produção | PostgreSQL RDS Multi-AZ, MongoDB Atlas Cluster, Redis ElastiCache Cluster | AWS EKS (Kubernetes) |

---

### Docker Compose (Local Development)

```yaml
version: '3.8'

services:
  # Databases
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: intime_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  # Services
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - AUTH_SERVICE_URL=http://auth-service:3001
      - USER_SERVICE_URL=http://user-service:3002
      # ... outros services
    depends_on:
      - redis
  
  auth-service:
    build: ./services/auth-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
  
  user-service:
    build: ./services/user-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
  
  # ... outros serviços

volumes:
  postgres_data:
  mongodb_data:
```

---

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Check coverage
        run: npm run coverage
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/project-service:$IMAGE_TAG ./services/project-service
          docker push $ECR_REGISTRY/project-service:$IMAGE_TAG
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/project-service \
            project-service=$ECR_REGISTRY/project-service:${{ github.sha }}
          kubectl rollout status deployment/project-service
```

---

### Blue-Green Deployment

```yaml
# kubernetes/project-service-blue.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: project-service-blue
  labels:
    app: project-service
    version: blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: project-service
      version: blue
  template:
    metadata:
      labels:
        app: project-service
        version: blue
    spec:
      containers:
      - name: project-service
        image: ecr.../project-service:v1.2.3
        ports:
        - containerPort: 3003

---
# Service aponta para "blue" inicialmente
apiVersion: v1
kind: Service
metadata:
  name: project-service
spec:
  selector:
    app: project-service
    version: blue  # Trocar para "green" após validação
  ports:
  - port: 80
    targetPort: 3003
```

**Fluxo de Deploy**:
```
1. Deploy "green" (nova versão) → 0% traffic
2. Health checks em "green" → OK
3. Smoke tests em "green" → OK
4. Switch traffic: blue → green (atualizar Service selector)
5. Monitorar métricas por 10 minutos
6. Se OK: Delete "blue"
7. Se falha: Rollback (switch para "blue")
```

---

## 📊 Monitoramento e Observabilidade

### Pilares de Observabilidade

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   METRICS    │  │     LOGS     │  │   TRACES     │
│  (Prometheus)│  │    (Loki)    │  │(OpenTelemetry│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┴──────────────────┘
                         │
                    ┌────▼────┐
                    │ GRAFANA │
                    └─────────┘
```

---

### Métricas (Prometheus)

**Métricas de Sistema** (Node Exporter):
- `node_cpu_seconds_total` - Uso de CPU
- `node_memory_MemAvailable_bytes` - Memória disponível
- `node_disk_io_time_seconds_total` - I/O de disco
- `node_network_receive_bytes_total` - Tráfego de rede

**Métricas de Aplicação** (prom-client):
```javascript
// Express middleware para métricas HTTP
const promClient = require('prom-client');
const register = new promClient.Registry();

// Request duration histogram
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Request counter
const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Active connections gauge
const activeConnections = new promClient.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
});

// Business metrics
const projectsCreated = new promClient.Counter({
  name: 'projects_created_total',
  help: 'Total number of projects created',
});

const timesheetApprovals = new promClient.Counter({
  name: 'timesheet_approvals_total',
  help: 'Total number of timesheet approvals',
  labelNames: ['status'], // approved, rejected
});

// Endpoint para Prometheus scrape
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

**Alertas Prometheus** (alertmanager):
```yaml
# alerts.yml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          description: "Error rate is {{ $value }} errors/sec"
      
      # High latency (P95)
      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency on {{ $labels.route }}"
          description: "P95 latency is {{ $value }}s"
      
      # Database connection pool exhausted
      - alert: DBConnectionPoolExhausted
        expr: sequelize_pool_idle_connections < 2
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool almost exhausted"
      
      # Redis memory usage high
      - alert: RedisMemoryHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis memory usage > 90%"
```

---

### Logs (Loki + Promtail)

**Configuração Winston (Structured Logging)**:
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME,
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console (capturado por Promtail)
    new winston.transports.Console(),
    
    // Arquivo local (backup)
    new winston.transports.DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
});

module.exports = logger;
```

**Exemplo de Log Estruturado**:
```json
{
  "timestamp": "2026-02-12T14:30:00.123Z",
  "level": "info",
  "service": "project-service",
  "environment": "production",
  "message": "Project created successfully",
  "userId": "uuid",
  "projectId": "uuid",
  "duration": 125,
  "method": "POST",
  "path": "/api/v1/projects",
  "statusCode": 201
}
```

**Query Loki (LogQL)**:
```
# Erros nos últimos 5 minutos
{service="project-service"} |= "level=error" | json | line_format "{{.message}}"

# Latência > 1s
{service="project-service"} | json | duration > 1000

# Top 10 rotas lentas
topk(10, sum by (path) (rate({service="project-service"} | json | unwrap duration [5m])))
```

---

### Dashboards (Grafana)

**Dashboard Principal**:
```
┌─────────────────────────────────────────────────────────┐
│ iN!Time - Sistema Overview                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Uptime: 99.97%] [RPS: 1,234] [Errors: 0.02%]         │
│                                                         │
│ ┌─────────────────┐  ┌─────────────────┐              │
│ │ Request Rate    │  │ Latency (P95)   │              │
│ │ 📈 1,234 req/s  │  │ 🟢 287ms        │              │
│ └─────────────────┘  └─────────────────┘              │
│                                                         │
│ ┌─────────────────────────────────────────────┐        │
│ │ Services Status                             │        │
│ │ ✅ API Gateway    ✅ Auth     ✅ User       │        │
│ │ ✅ Project        ✅ Timesheet ✅ Allocation│        │
│ │ ✅ Financial      ✅ Notification ✅ Export  │        │
│ └─────────────────────────────────────────────┘        │
│                                                         │
│ ┌─────────────────────────────────────────────┐        │
│ │ Database Performance                        │        │
│ │ PostgreSQL: 45 qps | Avg: 12ms             │        │
│ │ MongoDB: 23 qps | Avg: 8ms                 │        │
│ │ Redis: 1,234 ops | Hit Rate: 94.2%         │        │
│ └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

**Alertas Configurados**:
- 🔴 **Critical**: P99 > 2s, Error rate > 1%, DB down
- 🟡 **Warning**: P95 > 500ms, Error rate > 0.1%, CPU > 80%
- 🟢 **Info**: Deploy completed, Backup completed

---

## ✅ Boas Práticas

### 1. Código Limpo

**ESLint + Prettier**:
```javascript
// .eslintrc.js
module.exports = {
  env: { node: true, es2021: true },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: { ecmaVersion: 12 },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'arrow-body-style': ['error', 'as-needed'],
  },
};
```

**Git Hooks (Husky)**:
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"]
  }
}
```

---

### 2. Testing Strategy

**Pirâmide de Testes**:
```
        ┌───────┐
       /  E2E   \     10% - Cypress (fluxos críticos)
      ├─────────┤
     /Integration\   20% - Supertest (API endpoints)
    ├─────────────┤
   /    Unit      \  70% - Jest (services, utils)
  └───────────────┘
```

**Coverage Mínimo**:
- **Global**: 80%
- **Services (business logic)**: 90%
- **Utils**: 95%
- **EVM calculations**: 100%

---

### 3. Error Handling

**Hierarquia de Erros**:
```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};
```

**Middleware de Erro Global**:
```javascript
// middlewares/error.middleware.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Operational errors (conhecidos)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Programming errors (bugs)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

module.exports = errorHandler;
```

---

### 4. API Design

**RESTful Principles**:
```
GET    /api/v1/projects          # List (com paginação)
GET    /api/v1/projects/:id      # Get by ID
POST   /api/v1/projects          # Create
PUT    /api/v1/projects/:id      # Update (full)
PATCH  /api/v1/projects/:id      # Update (partial)
DELETE /api/v1/projects/:id      # Delete

# Nested resources
GET    /api/v1/projects/:id/timesheets
POST   /api/v1/projects/:id/timesheets

# Actions (não-CRUD)
POST   /api/v1/timesheets/:id/submit
POST   /api/v1/timesheets/:id/approve
POST   /api/v1/timesheets/:id/reject
```

**Response Format Padrão**:
```javascript
// Success
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error
{
  "success": false,
  "message": "Project not found",
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "details": {...}
  }
}
```

---

## 🎯 Decisões Arquiteturais

### ADR 001: Monolito Modular vs Microserviços Puros

**Status**: Aprovado

**Contexto**:
- Sistema enterprise com múltiplos domínios
- Team pequeno (< 10 desenvolvedores)
- Alto acoplamento de dados (projetos, timesheet, alocação)

**Decisão**:
Implementar **Monolito Modular Distribuído** com características de microserviços:
- Serviços independentes (código separado)
- Deploy independente (Docker containers)
- Banco de dados compartilhado (PostgreSQL central)

**Consequências**:
- ✅ Desenvolvimento mais rápido
- ✅ Queries cross-domain eficientes
- ✅ Evita complexidade de transações distribuídas
- ✅ Fácil migração futura para microserviços reais
- ❌ Escalabilidade limitada por database

---

### ADR 002: React Query vs Redux

**Status**: Aprovado

**Contexto**:
- 90% do estado é server state (projetos, timesheets, etc.)
- Apenas 10% é client state (UI, preferências)

**Decisão**:
- **React Query** para server state
- **Zustand** para client state
- **Remover Context API** (redundante)

**Consequências**:
- ✅ Menos boilerplate (sem actions, reducers)
- ✅ Cache automático e invalidação
- ✅ Background sync
- ✅ Otimistic updates
- ❌ Curva de aprendizado inicial

---

### ADR 003: Sequelize vs Prisma

**Status**: Aprovado

**Contexto**:
- ORM para PostgreSQL
- Migrations, associations, validations

**Decisão**:
**Sequelize** ao invés de Prisma

**Justificativa**:
- ✅ Mais maduro (10+ anos)
- ✅ Ecosystem maior (plugins, extensions)
- ✅ Melhor suporte a transactions complexas
- ✅ Team já familiarizado
- ❌ Prisma tem melhor DX, mas menos maduro

---

### ADR 004: JWT vs Session-based Auth

**Status**: Aprovado

**Contexto**:
- Múltiplas instâncias (horizontal scaling)
- Stateless application design

**Decisão**:
**JWT** com refresh token rotation

**Consequências**:
- ✅ Stateless (não precisa session store)
- ✅ Escalável horizontalmente
- ✅ Suporte a mobile apps
- ❌ Revogação complexa (blacklist necessária)
- ❌ Tamanho maior de token

---

### ADR 005: Redis Pub/Sub vs RabbitMQ

**Status**: Aprovado

**Contexto**:
- Event-driven communication
- Notificações em tempo real

**Decisão**:
**Redis Pub/Sub** ao invés de RabbitMQ

**Justificativa**:
- ✅ Redis já usado (cache, queues)
- ✅ Suficiente para volume atual (<1M msgs/dia)
- ✅ Menos infraestrutura
- ✅ Mais simples de operar
- ❌ Sem garantia de entrega (RabbitMQ tem)
- ❌ Sem message persistence (RabbitMQ tem)

**Quando migrar**: Se volume > 10M msgs/dia ou garantia de entrega crítica

---

## 📈 Roadmap

### Fase 1: MVP (Q1 2026) ✅
- [x] Auth Service
- [x] User Service
- [x] Project Service
- [x] Timesheet Service (workflow básico)
- [x] RBAC básico (4 roles)
- [x] Dashboard simples
- [x] Deploy em Staging

### Fase 2: Core Features (Q2 2026)
- [ ] Allocation Service
- [ ] Contract Service
- [ ] Financial Service (EVM completo)
- [ ] Notification Service (WebSocket)
- [ ] RBAC avançado (8 roles, 30+ permissões)
- [ ] Dashboards avançados (Recharts)
- [ ] Export Service (Excel, CSV, PDF)
- [ ] Deploy em Production

### Fase 3: Advanced Features (Q3 2026)
- [ ] Forecasting (ML com regression-js)
- [ ] Multi-portfólio (hierarquia)
- [ ] Alertas configuráveis
- [ ] Audit Service completo
- [ ] API pública (para integrações)
- [ ] Mobile app (React Native)

### Fase 4: Otimização (Q4 2026)
- [ ] GraphQL API (alternativa ao REST)
- [ ] Elasticsearch (search avançado)
- [ ] Event sourcing (CQRS)
- [ ] Read replicas PostgreSQL
- [ ] CDN para frontend (CloudFront)
- [ ] Disaster recovery (multi-região)

### Fase 5: Enterprise (2027)
- [ ] Microserviços reais (extração de serviços)
- [ ] Kafka (event streaming)
- [ ] Multi-tenancy (SaaS)
- [ ] Compliance (SOC 2, ISO 27001)
- [ ] Advanced analytics (BI integrado)
- [ ] AI/ML predictions (custos, prazos)

---

## 📚 Referências

### Documentação
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://react.dev/learn)
- [PostgreSQL Performance](https://www.postgresql.org/docs/14/performance-tips.html)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Kubernetes Patterns](https://kubernetes.io/docs/concepts/)

### Livros
- **Clean Architecture** - Robert C. Martin
- **Designing Data-Intensive Applications** - Martin Kleppmann
- **Microservices Patterns** - Chris Richardson
- **Building Microservices** - Sam Newman
- **Site Reliability Engineering** - Google

### Tools
- [Sequelize Docs](https://sequelize.org/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Prometheus Docs](https://prometheus.io/docs/)
- [Bull Queue Docs](https://github.com/OptimalBits/bull)

---

## 👥 Contribuindo

### Code Review Checklist
- [ ] Código segue ESLint rules
- [ ] Testes cobrem > 80% do código
- [ ] Documentação (JSDoc) atualizada
- [ ] Sem console.log em produção
- [ ] Error handling apropriado
- [ ] Validações implementadas
- [ ] Performance considerada (queries N+1)
- [ ] Segurança verificada (OWASP Top 10)

---

**Versão**: 1.0  
**Última Atualização**: 2026-02-12  
**Mantenedor**: Time de Arquitetura iN!Time

---