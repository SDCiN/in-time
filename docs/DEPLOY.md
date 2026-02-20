# iN!Time — Guia de Deploy na VM

> **Para uso em outra instância do Claude.**
> Este documento descreve todas as decisões de infraestrutura tomadas durante o design do projeto e serve como instrução completa para realizar o deploy na VM de produção.

---

## 1. Contexto da VM

A VM já hospeda outros projetos Docker em execução. As portas a seguir estão **ocupadas** e não podem ser reutilizadas pelo iN!Time:

| Porta | Container existente |
|-------|-------------------|
| 3000 | worklocation-report-frontend |
| 4444 | selenium |
| 5000 | worklocation-api |
| 5050 | pgadmin (worklocation) |
| **5432** | **worklocation-db (PostgreSQL 16)** ← ambos projetos agora usam PG 16 |
| 7000 | hub-pmo-backend |
| 7001 | hub-pmo-frontend |
| 8070 | sandash-backend |
| 8080 | worklocation-report-backend |
| 8802 | sandash-frontend |
| 8810 | selenium VNC |
| 9000–9001 | minio |

**Portas reservadas para o iN!Time:**

| Porta (host) | Serviço | Observação |
|-------------|---------|------------|
| **8500** | Nginx (entrada principal) | `http://<IP_DA_VM>:8500` |
| **5433** | intime-postgres | Acesso externo ao PostgreSQL do iN!Time |
| **27017** | intime-mongodb | Livre na VM |
| **6379** | intime-redis | Livre na VM |
| 3001–3010 | Microserviços | **Internos apenas** — sem exposição no host |

---

## 2. Decisão Crítica: PostgreSQL Isolado

> **O iN!Time possui sua própria instância de PostgreSQL (`intime-postgres`), completamente separada do `worklocation-db`.**

### Por que são instâncias separadas?

- **Dados sensíveis**: o banco do iN!Time contém dados financeiros (EVM, orçamentos, rate cards) e de RH (alocações, timesheets). O acesso é restrito.
- **Isolamento de rede**: o `intime-postgres` reside exclusivamente na `intime-network`. Nenhum container de outros projetos (worklocation, sandash, hub-pmo) enxerga esta instância.
- **Usuário dedicado**: o banco usa `intime_admin` como usuário — nunca o usuário padrão `postgres`.
- **Porta separada**: exposta externamente na porta `5433` do host (a `5432` pertence ao `worklocation-db`).

### Diagrama de isolamento

```
VM HOST (192.168.1.71)
│
├── :5432 ──→ worklocation-db (postgres:16)   [worklocation-network]
│                └── usuário: worklocation_user
│
└── :5433 ──→ intime-postgres (postgres:16)   [intime-network]  ← INSTÂNCIA SEPARADA
                  ├── usuário: intime_admin
                  ├── banco:   intime_dev
                  └── acessível APENAS por containers da intime-network
```

As redes Docker são **completamente isoladas entre si**. Mesmo estando no mesmo IP da VM, um container de `worklocation-network` não consegue se conectar ao `intime-postgres`, e vice-versa.

---

## 3. Arquitetura de Serviços

### Fluxo de requisição

```
Usuário (browser)
    │
    ▼ :8500
 [nginx]  ← Ponto de entrada único
    │
    ├── /             → client:80          (React SPA)
    ├── /api/         → api-gateway:3000   (REST API)
    └── /socket.io/   → notification:3008  (WebSocket)
                              │
                      api-gateway roteia para:
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        auth:3001      user:3002     project:3003  ...etc
              │
              ▼
        intime-postgres:5432 (interno)
        intime-redis:6379    (interno)
```

### Todos os serviços

| Container | Imagem/Build | Porta interna | Acesso externo |
|-----------|-------------|---------------|----------------|
| intime-nginx | nginx:1.24-alpine | 80 | **:8500** |
| intime-client | build ./client | 80 | apenas via nginx |
| intime-api-gateway | build ./server (api-gateway/) | 3000 | apenas via nginx |
| intime-auth-service | build ./server (services/auth-service/) | 3001 | apenas via nginx |
| intime-user-service | build ./server (services/user-service/) | 3002 | apenas via nginx |
| intime-project-service | build ./server (services/project-service/) | 3003 | apenas via nginx |
| intime-timesheet-service | build ./server (services/timesheet-service/) | 3004 | apenas via nginx |
| intime-allocation-service | build ./server (services/allocation-service/) | 3005 | apenas via nginx |
| intime-contract-service | build ./server (services/contract-service/) | 3006 | apenas via nginx |
| intime-financial-service | build ./server (services/financial-service/) | 3007 | apenas via nginx |
| intime-notification-service | build ./server (services/notification-service/) | 3008 | apenas via nginx |
| intime-export-service | build ./server (services/export-service/) | 3009 | apenas via nginx |
| intime-audit-service | build ./server (services/audit-service/) | 3010 | apenas via nginx |
| intime-postgres | postgres:16-alpine | 5432 | **:5433** |
| intime-mongodb | mongo:7.0 | 27017 | **:27017** |
| intime-redis | redis:7.4-alpine | 6379 | **:6379** |

---

## 4. Mapa de Arquivos

### Dockerfiles (12 arquivos)

```
client/
└── Dockerfile                          ← Multi-stage: node build → nginx serve

server/
├── api-gateway/
│   └── Dockerfile                      ← Build context: ./server
│
└── services/
    ├── auth-service/Dockerfile
    ├── user-service/Dockerfile
    ├── project-service/Dockerfile
    ├── timesheet-service/Dockerfile
    ├── allocation-service/Dockerfile
    ├── contract-service/Dockerfile
    ├── financial-service/Dockerfile
    ├── notification-service/Dockerfile
    ├── export-service/Dockerfile
    └── audit-service/Dockerfile
    # Todos com build context: ./server (para acessar shared/)
```

**Importante sobre build context:** Todos os serviços do backend usam `context: ./server` no `docker-compose.yml`. Isso permite que cada Dockerfile copie a pasta `server/shared/` (utilitários compartilhados entre microserviços — factory Sequelize, classes de erro, logger). Sem isso, os imports relativos `../../../../shared/...` falhariam no build.

### Nginx (2 arquivos)

```
nginx/
└── nginx.conf      ← Reverse proxy principal (montado no container nginx do docker-compose)

client/
└── nginx.conf      ← Config do servidor Nginx interno do container React (SPA routing)
```

### Arquivos de ambiente

```
.env                    ← Raiz do projeto (lido pelo docker-compose)
                           Contém: INTIME_DB_PASSWORD
server/.env             ← Variáveis de todos os serviços backend
                           Contém: DB_*, REDIS_*, JWT_*, SERVICE_URLS...
client/.env.example     ← Referência de variáveis do frontend
```

---

## 5. Variáveis de Ambiente

### `.env` (raiz — lido pelo docker-compose)

```env
INTIME_DB_PASSWORD=<senha_forte_aqui>
```

Esta variável é injetada automaticamente pelo docker-compose no container `intime-postgres` e em todos os microserviços backend via `${INTIME_DB_PASSWORD}`.

### `server/.env` (variáveis dos microserviços)

As seguintes variáveis **serão sobrescritas** pelo docker-compose com os valores corretos para o ambiente Docker (hostnames internos, usuário dedicado). O `server/.env` é usado como fallback e para desenvolvimento local fora do Docker.

```env
# PostgreSQL — dentro do Docker, DB_HOST vira "postgres" e DB_USER vira "intime_admin"
DB_HOST=localhost         # sobrescrito para "postgres" pelo docker-compose
DB_PORT=5433              # porta do HOST; dentro do Docker usa 5432 interno
DB_NAME=intime_dev
DB_USER=intime_admin      # usuário dedicado — nunca "postgres"
DB_PASSWORD=<mesmo valor de INTIME_DB_PASSWORD>

# Redis — dentro do Docker, REDIS_HOST vira "redis"
REDIS_HOST=localhost      # sobrescrito para "redis" pelo docker-compose
REDIS_PORT=6379

# MongoDB (audit-service)
MONGODB_URI=mongodb://localhost:27017/intime_audit
# Dentro do Docker: mongodb://mongodb:27017/intime_audit

# JWT
JWT_SECRET=<string aleatória de 64+ caracteres>
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
BCRYPT_ROUNDS=10

# Portas dos serviços
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
PROJECT_SERVICE_PORT=3003
TIMESHEET_SERVICE_PORT=3004
ALLOCATION_SERVICE_PORT=3005
CONTRACT_SERVICE_PORT=3006
FINANCIAL_SERVICE_PORT=3007
NOTIFICATION_SERVICE_PORT=3008
EXPORT_SERVICE_PORT=3009
AUDIT_SERVICE_PORT=3010

# URLs internas (usadas pelo API Gateway dentro do Docker)
AUTH_SERVICE_URL=http://auth-service:3001
USER_SERVICE_URL=http://user-service:3002
PROJECT_SERVICE_URL=http://project-service:3003
TIMESHEET_SERVICE_URL=http://timesheet-service:3004
ALLOCATION_SERVICE_URL=http://allocation-service:3005
CONTRACT_SERVICE_URL=http://contract-service:3006
FINANCIAL_SERVICE_URL=http://financial-service:3007
NOTIFICATION_SERVICE_URL=http://notification-service:3008
EXPORT_SERVICE_URL=http://export-service:3009
AUDIT_SERVICE_URL=http://audit-service:3010

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

---

## 6. Passo a Passo do Deploy

### Pré-requisitos na VM

- Docker 24+
- Docker Compose v2 (`docker compose` sem hífen) ou v1 (`docker-compose`)
- Git
- Acesso ao repositório do iN!Time

### 6.1 Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO> /opt/intime
cd /opt/intime
```

### 6.2 Criar o arquivo `.env` na raiz

```bash
cp .env.example .env
# Editar e definir a senha do banco
nano .env
```

Conteúdo mínimo:
```env
INTIME_DB_PASSWORD=SuaSenhaForteAqui
```

### 6.3 Configurar o `server/.env`

O arquivo `server/.env` já existe no projeto. Verifique se as seguintes variáveis estão corretas:

```bash
nano server/.env
```

Confirme:
- `DB_USER=intime_admin`
- `DB_PASSWORD=` (mesmo valor de `INTIME_DB_PASSWORD`)
- `JWT_SECRET=` (string aleatória — gere com: `openssl rand -hex 32`)

### 6.4 Build e inicialização

```bash
# Build de todas as imagens e subida dos containers
docker compose up -d --build

# Acompanhar os logs durante a inicialização
docker compose logs -f
```

### 6.5 Verificar healthchecks

```bash
# Aguardar todos os serviços ficarem healthy
docker compose ps
```

Todos os containers de banco de dados devem mostrar `(healthy)` antes dos microserviços subirem. O docker-compose já está configurado com `depends_on` e `condition: service_healthy` para garantir a ordem correta.

### 6.6 Verificar a aplicação

```bash
# Nginx respondendo
curl http://localhost:8500/nginx-health

# API Gateway
curl http://localhost:8500/api/v1/health

# Serviços individualmente (de dentro da VM)
curl http://localhost:8500/api/v1/auth/health
```

---

## 7. Comandos Úteis

### Gerenciamento

```bash
# Subir tudo
docker compose up -d

# Parar tudo (sem remover volumes)
docker compose down

# Rebuild de um serviço específico
docker compose up -d --build auth-service

# Ver logs de um serviço
docker compose logs -f auth-service

# Ver status de todos os containers
docker compose ps
```

### Banco de dados

```bash
# Acessar o PostgreSQL do iN!Time diretamente
docker exec -it intime-postgres psql -U intime_admin -d intime_dev

# Backup do banco
docker exec intime-postgres pg_dump -U intime_admin intime_dev > backup_intime_$(date +%Y%m%d).sql
```

### Limpeza (cuidado em produção)

```bash
# Parar e remover containers + networks (mantém volumes)
docker compose down

# Remover também os volumes (APAGA OS DADOS)
docker compose down -v
```

---

## 8. Conectar ao PostgreSQL via PgAdmin

Use o PgAdmin já disponível na VM (porta 5050) ou instale um cliente local:

| Campo | Valor |
|-------|-------|
| Host | `<IP_DA_VM>` |
| Porta | `5433` |
| Database | `intime_dev` |
| Usuário | `intime_admin` |
| Senha | valor de `INTIME_DB_PASSWORD` |

> **Atenção:** Não confunda com o `worklocation-db` que está na porta `5432` com usuário `worklocation_user`. São instâncias e bancos completamente diferentes.

---

## 9. Problema Conhecido: API Gateway

O arquivo `server/api-gateway/src/server.js` declara `const app` duas vezes (linhas ~10 e ~13). Isso causará erro de sintaxe ao subir o container `intime-api-gateway`.

**Antes de fazer o deploy, corrija este arquivo:**

```bash
nano server/api-gateway/src/server.js
# Remover a declaração duplicada de "const app"
# Manter apenas uma: const app = express()
```

---

## 10. Estado de Implementação

> O projeto está em scaffolding inicial (~5-10% implementado). A maior parte dos microserviços responde com `HTTP 501 Not Implemented` — isso é esperado.

| Serviço | Status |
|---------|--------|
| API Gateway | Funcional (proxy + rate limiting) |
| auth-service | Estrutura pronta, lógica pendente |
| user-service | Skeleton (501) |
| project-service | Skeleton (501) |
| timesheet-service | Skeleton (501) |
| allocation-service | Skeleton (501) |
| contract-service | Skeleton (501) |
| financial-service | Skeleton (501) |
| notification-service | Skeleton (WebSocket aceita conexões) |
| export-service | Skeleton (501) |
| audit-service | Skeleton (501, conecta MongoDB) |
| client (frontend) | Boilerplate Vite padrão |

O deploy completo sobe toda a infraestrutura corretamente. Os serviços skeleton não causam falha — eles iniciam, respondem no `/health` e retornam 501 para rotas não implementadas.

---

## 11. Resumo das Decisões de Arquitetura

1. **Nginx como único ponto de entrada** — porta `8500` no host. Nenhum microserviço é exposto diretamente.
2. **PostgreSQL exclusivo** — `intime-postgres` na porta `5433`, `intime-network` isolada, usuário `intime_admin`, banco `intime_dev`. Sem relação com o `worklocation-db` (porta `5432`).
3. **Build context `./server`** — todos os Dockerfiles de microserviços usam o diretório `server/` como contexto para ter acesso ao `shared/` (factory Sequelize, AppError, logger).
4. **Credenciais via `${INTIME_DB_PASSWORD}`** — a senha do banco nunca está hardcoded. O docker-compose lê do arquivo `.env` na raiz e injeta em todos os serviços.
5. **Redes Docker isoladas** — `intime-network` (bridge) é exclusiva do projeto. Os outros projetos na VM operam em suas próprias redes e não enxergam os containers do iN!Time.
