# iN!Time - Sistema de Gestão de Projetos

Sistema enterprise de gestão de projetos com foco em gestão de recursos, controle financeiro (EVM), alocação e timesheets.

## Arquitetura

**Client-Server com Microserviços**

- **Frontend**: React 19.2 + JavaScript (Vite 7)
- **Backend**: Node.js 20 LTS + JavaScript (Express.js)
- **Bancos de Dados**: PostgreSQL 16, Redis 7.4

### Estrutura

```
intime/
├── client/                    # Frontend React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
│
├── server/                    # Backend microservices
│   ├── api-gateway/          # Port 3000
│   ├── services/
│   │   ├── auth-service/     # Port 3001
│   │   ├── user-service/     # Port 3002
│   │   ├── project-service/  # Port 3003
│   │   ├── timesheet-service/ # Port 3004
│   │   ├── allocation-service/ # Port 3005
│   │   ├── contract-service/ # Port 3006
│   │   ├── financial-service/ # Port 3007
│   │   ├── notification-service/ # Port 3008
│   │   ├── export-service/   # Port 3009
│   │   └── audit-service/    # Port 3010
│   └── shared/               # Código compartilhado
│
└── docker-compose.yml
```

## Início Rápido

### Pré-requisitos

- Node.js 20 LTS
- Docker & Docker Compose
- PostgreSQL 16 (provisionado via Docker)
- Redis 7.4 (provisionado via Docker)

### Instalação

1. **Clone o repositório**
```bash
git clone <repo-url>
cd intime
```

2. **Configurar variáveis de ambiente**
```bash
# Frontend
cp client/.env.example client/.env

# API Gateway
cp server/api-gateway/.env.example server/api-gateway/.env

# Auth Service
cp server/services/auth-service/.env.example server/services/auth-service/.env
```

3. **Instalar dependências**

**Opção 1: Script automático (Recomendado)**
```bash
# Windows
reinstall-deps.bat

# Linux/Mac
./reinstall-deps.sh
```

**Opção 2: Manual**
```bash
# Frontend
cd client
npm install

# Backend (Scripts)
cd ../server
npm install

# Backend (Shared - bibliotecas compartilhadas)
cd shared
npm install

# Backend (API Gateway)
cd api-gateway
npm install

# Backend (Auth Service - exemplo)
cd services/auth-service
npm install
```

> ✅ **Nota**: As dependências já foram atualizadas para versões suportadas (sem warnings deprecated).
> Ver `ATUALIZACOES_DEPENDENCIAS.md` para detalhes.

4. **Iniciar com Docker Compose**
```bash
# Na raiz do projeto
docker-compose up -d
```

Ou manualmente:

```bash
# Terminal 1 - Frontend
cd client
npm run dev

# Terminal 2 - API Gateway
cd server/api-gateway
npm run dev

# Terminal 3 - Auth Service
cd server/services/auth-service
npm run dev
```

5. **Configurar Banco de Dados PostgreSQL**

```bash
# 1. Copiar .env centralizado
cd server/
cp .env.example .env

# 2. Editar server/.env e preencher:
#    DB_HOST=<IP_DA_VM>
#    DB_USER=<usuario>
#    DB_PASSWORD=<senha>
#    JWT_SECRET=<chave-secreta>

# 3. Criar banco na VM (via SSH):
docker exec -it worklocation-db psql -U postgres -c "CREATE DATABASE intime_dev;"

# 4. Testar conexão
cd server/
npm run test-db
# ou: node scripts/test-db-connection.js
```

> 📘 **Configuração centralizada**: Um único arquivo `server/.env` alimenta todos os 10 microserviços.
> 📘 **Guia completo**: Ver [`DATABASE_SETUP.md`](DATABASE_SETUP.md) para instruções detalhadas.

### URLs

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001

## Comandos Úteis

### Frontend
```bash
cd client/
npm run dev        # Desenvolvimento
npm run build      # Build produção
npm run lint       # Linting
```

### Backend
```bash
# Cada serviço
cd server/services/auth-service/
npm run dev        # Desenvolvimento
npm start          # Produção
npm test           # Testes
npm run lint       # Linting
```

### Docker
```bash
docker-compose up -d              # Iniciar todos os serviços
docker-compose down               # Parar todos os serviços
docker-compose logs -f auth-service  # Ver logs de um serviço
docker-compose ps                 # Status dos containers
```

## Tecnologias

### Frontend
- React 19.2
- Vite 7
- React Router 6
- React Query 5 (TanStack Query)
- Zustand 4
- Tailwind CSS 3
- Axios
- Socket.io Client

### Backend
- Node.js 20 LTS
- Express.js 4.21
- Sequelize 6.37.7 (PostgreSQL ORM)
- Redis client 4.7
- Redis 7.4
- JWT (jsonwebtoken)
- bcryptjs
- Winston (logging)
- Bull (job queue)

## Padrões de Desenvolvimento

### Backend (MVC + Middlewares)

```
Middleware → Controller → Service → Repository → Model → Database
```

- **Middleware**: Autenticação, validação, rate limiting
- **Controller**: HTTP request handling
- **Service**: Lógica de negócio
- **Repository**: Acesso ao banco de dados
- **Model**: Schema e validações

### Frontend (Component-based)

- Components reutilizáveis
- Custom hooks para lógica compartilhada
- React Query para server state
- Zustand para client state

## Documentação

- **CLAUDE.md**: Guia completo para desenvolvimento com Claude Code
- **DATABASE_SETUP.md**: 🗄️ Configuração do PostgreSQL (IMPORTANTE!)
- **resumo_projeto_intime.md**: Arquitetura detalhada (2300+ linhas)
- **ESTRUTURA_CRIADA.md**: Documentação da estrutura de diretórios
- **VERSOES_CORRIGIDAS.md**: ✅ Versões corrigidas e testadas (LEIA PRIMEIRO!)
- **ATUALIZACOES_DEPENDENCIAS.md**: Changelog de dependências atualizadas

## Licença

Proprietary - iN!Time © 2026
