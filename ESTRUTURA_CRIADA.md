# Estrutura de Diretórios Criada - iN!Time

## ✅ Frontend (Client)

### Projeto Base
- ✅ **Vite React** criado com `npm create vite`
- ✅ Template: React + JavaScript (não TypeScript)

### Estrutura de Diretórios
```
client/
├── src/
│   ├── components/         # Componentes reutilizáveis (criado)
│   ├── pages/              # Páginas (será criado conforme necessidade)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API clients
│   │   ├── api.js         ✅ Axios configurado com interceptors
│   │   └── authService.js ✅ Serviço de autenticação
│   ├── store/              # Zustand stores
│   │   └── authStore.js   ✅ Store de autenticação
│   ├── utils/              # Funções auxiliares
│   └── assets/             # Imagens, ícones
├── public/                 # Assets estáticos
├── .env.example           ✅ Template de variáveis
├── .gitignore             ✅ Configurado
├── package.json           ✅ Gerado pelo Vite
├── vite.config.js         ✅ Gerado pelo Vite
└── README.md              ✅ Documentação atualizada
```

### Arquivos Criados
- ✅ `src/services/api.js` - Cliente Axios com refresh token automático
- ✅ `src/services/authService.js` - Métodos de autenticação
- ✅ `src/store/authStore.js` - Zustand store para auth
- ✅ `.env.example` - Template de configuração

---

## ✅ Backend (Server)

### API Gateway (Port 3000)
```
server/api-gateway/
├── src/
│   ├── config/
│   │   └── logger.js      ✅ Winston configurado
│   ├── middlewares/
│   │   └── rateLimit.js   ✅ Rate limiting configurado
│   ├── routes/
│   │   └── index.js       ✅ Proxy para todos os microserviços
│   └── server.js          ✅ Servidor Express
├── .env.example           ✅ Variáveis de ambiente
├── .gitignore             ✅ Configurado
├── Dockerfile             ✅ Para containerização
└── package.json           ✅ Dependências definidas
```

### Auth Service (Port 3001) - TEMPLATE COMPLETO
```
server/services/auth-service/
├── src/
│   ├── config/
│   │   ├── database.js    ✅ Sequelize configurado
│   │   ├── redis.js       ✅ Redis client configurado
│   │   └── logger.js      ✅ Winston configurado
│   ├── controllers/
│   │   └── auth.controller.js ✅ HTTP handlers
│   ├── services/
│   │   └── auth.service.js    ✅ Business logic (TODOs)
│   ├── middlewares/
│   │   └── error.middleware.js ✅ Error handler global
│   ├── routes/
│   │   └── auth.routes.js     ✅ Rotas definidas
│   ├── repositories/       (será criado conforme necessidade)
│   ├── models/             (será criado conforme necessidade)
│   ├── utils/              (será criado conforme necessidade)
│   └── server.js          ✅ Servidor Express com DB connection
├── .env.example           ✅ Variáveis de ambiente
├── .gitignore             ✅ Configurado
├── Dockerfile             ✅ Para containerização
└── package.json           ✅ Dependências completas
```

### Outros Microserviços (Ports 3002-3010)
Estrutura de diretórios criada para:
- ✅ **user-service** (Port 3002)
- ✅ **project-service** (Port 3003)
- ✅ **timesheet-service** (Port 3004)
- ✅ **allocation-service** (Port 3005)
- ✅ **contract-service** (Port 3006)
- ✅ **financial-service** (Port 3007)
- ✅ **notification-service** (Port 3008)
- ✅ **export-service** (Port 3009)
- ✅ **audit-service** (Port 3010)

Cada um com:
```
services/[nome-service]/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middlewares/
│   ├── routes/
│   ├── config/
│   ├── utils/
│   └── tests/
```

### Shared (Código Compartilhado)
```
server/shared/
├── errors/
│   └── AppError.js        ✅ Classes de erro customizadas
├── logger/                (será criado)
├── validators/            (será criado)
└── config/                (será criado)
```

---

## ✅ Infrastructure

### Docker
- ✅ **docker-compose.yml** - Orquestração completa
  - PostgreSQL 14
  - MongoDB 6
  - Redis 7
  - API Gateway
  - Auth Service (exemplo)

### Documentação
- ✅ **CLAUDE.md** - Guia para Claude Code
- ✅ **README.md** - Documentação principal do projeto
- ✅ **.gitignore** - Configurado para todo o projeto
- ✅ **resumo_projeto_intime.md** - Arquitetura detalhada (já existia)

---

## 📋 Próximos Passos

### 1. Frontend
```bash
cd client/
npm install                     # Instalar dependências
npm run dev                     # Iniciar dev server
```

Depois implementar:
- [ ] Páginas (Login, Dashboard, Projects, etc.)
- [ ] Componentes UI (shadcn/ui)
- [ ] Rotas protegidas
- [ ] Integração com React Query

### 2. Backend - API Gateway
```bash
cd server/api-gateway/
npm install                     # Instalar dependências
cp .env.example .env           # Configurar variáveis
npm run dev                     # Iniciar dev server
```

### 3. Backend - Auth Service
```bash
cd server/services/auth-service/
npm install                     # Instalar dependências
cp .env.example .env           # Configurar variáveis
npm run dev                     # Iniciar dev server
```

Implementar:
- [ ] Models (User, RefreshToken, PasswordResetToken)
- [ ] Repositories (UserRepository, TokenRepository)
- [ ] Services (lógica de login, JWT, bcrypt)
- [ ] Testes unitários

### 4. Outros Microserviços
Replicar a estrutura do auth-service para cada serviço:
- [ ] Criar package.json
- [ ] Criar Dockerfile
- [ ] Implementar MVC + Middlewares
- [ ] Adicionar ao docker-compose.yml

### 5. Databases
```bash
docker-compose up -d postgres mongodb redis
```

Depois:
- [ ] Criar migrations do Sequelize
- [ ] Popular dados iniciais (roles, permissions)
- [ ] Configurar indexes

---

## 🚀 Como Iniciar o Projeto

### Opção 1: Docker Compose (Recomendado)
```bash
# Na raiz do projeto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### Opção 2: Manual (Desenvolvimento)
```bash
# Terminal 1 - Databases
docker-compose up -d postgres mongodb redis

# Terminal 2 - Frontend
cd client/
npm install
npm run dev

# Terminal 3 - API Gateway
cd server/api-gateway/
npm install
cp .env.example .env
npm run dev

# Terminal 4 - Auth Service
cd server/services/auth-service/
npm install
cp .env.example .env
npm run dev
```

---

## 📊 Arquitetura Implementada

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT (React + Vite)                                  │
│  http://localhost:5173                                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
┌────────────────────▼────────────────────────────────────┐
│  API GATEWAY (Express)                                  │
│  http://localhost:3000                                  │
│  • JWT verification                                      │
│  • Rate limiting                                         │
│  • Proxy routing                                         │
└───┬────┬────┬────┬────┬────┬────┬────┬────┬────┬───────┘
    │    │    │    │    │    │    │    │    │    │
    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼
  3001 3002 3003 3004 3005 3006 3007 3008 3009 3010
  Auth User Proj Time Allc Cntr Fncl Ntfy Expt Audt
```

---

## ✨ Convenções Estabelecidas

### Nomenclatura
- **Componentes React**: PascalCase (ex: `LoginForm.jsx`)
- **Hooks**: `use` prefix (ex: `useAuth.js`)
- **Services**: `Service` suffix (ex: `authService.js`)
- **Stores**: `Store` suffix (ex: `authStore.js`)
- **Controllers**: `Controller` suffix (ex: `auth.controller.js`)

### Estrutura MVC
```
Request → Middleware → Controller → Service → Repository → Model
```

### Padrões de Código
- JavaScript (não TypeScript)
- Documentação em português (pt-BR)
- ESLint configurado
- Prettier recomendado
- Commits convencionais

---

**Status**: ✅ Estrutura base completa e pronta para desenvolvimento!
