# Configuração do Banco de Dados - iN!Time

## ✨ Configuração Centralizada

Todas as variáveis de ambiente estão em **um único arquivo** `server/.env` que alimenta todos os 10 microserviços + API Gateway.

---

## 1. Criar Banco de Dados na VM

Conecte via SSH na VM e execute:

```bash
# Entrar no container PostgreSQL
docker exec -it worklocation-db psql -U postgres

# Dentro do psql, executar:
CREATE DATABASE intime_dev;

# Verificar se foi criado
\l

# Sair
\q
```

### Opção: Criar usuário dedicado (recomendado)

```sql
-- Criar usuário
CREATE USER intime_user WITH PASSWORD 'SuaSenhaSegura123!';

-- Criar banco com owner
CREATE DATABASE intime_dev OWNER intime_user;

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE intime_dev TO intime_user;

-- Conectar ao banco
\c intime_dev

-- Conceder privilégios no schema public
GRANT ALL ON SCHEMA public TO intime_user;
```

---

## 2. Configurar .env Centralizado

### 2.1 Copiar exemplo

```bash
cd server/
cp .env.example .env
```

### 2.2 Editar server/.env

Abra `server/.env` e preencha **apenas as seções necessárias**:

```bash
#################################################
# iN!Time - Configuração Centralizada
#################################################

# ==============================================
# BANCO DE DADOS POSTGRESQL
# ==============================================
DB_HOST=192.168.x.x        # ⬅️ IP DA SUA VM (PREENCHER)
DB_PORT=5432
DB_NAME=intime_dev
DB_USER=intime_user        # ⬅️ PREENCHER (ou 'postgres')
DB_PASSWORD=SuaSenha123!   # ⬅️ PREENCHER

# Pool de conexões
DB_POOL_MAX=5
DB_POOL_MIN=0

# ==============================================
# JWT / AUTENTICAÇÃO
# ==============================================
JWT_SECRET=mude-isso-para-algo-muito-secreto-e-aleatorio
```

> 💡 **Importante**: As outras seções (Redis, SMTP, AWS) podem ser preenchidas depois conforme necessário.

---

## 3. Configurar Acesso Remoto (se necessário)

Se não conseguir conectar da sua máquina de desenvolvimento à VM:

### 3.1 Verificar pg_hba.conf

```bash
docker exec -it worklocation-db cat /var/lib/postgresql/data/pg_hba.conf
```

Deve conter:
```
# IPv4 local connections:
host    all             all             0.0.0.0/0               md5
```

### 3.2 Verificar postgresql.conf

```bash
docker exec -it worklocation-db cat /var/lib/postgresql/data/postgresql.conf | grep listen_addresses
```

Deve ser:
```
listen_addresses = '*'
```

### 3.3 Reiniciar se necessário

```bash
docker restart worklocation-db
```

---

## 4. Testar Conexão

```bash
# Opção 1 (Recomendada - usando npm script):
cd server/
npm run test-db

# Opção 2 (Direta):
node server/scripts/test-db-connection.js
```

**Resultado esperado:**
```
🔍 Testando conexão com PostgreSQL...

Configuração:
  Host: 192.168.x.x
  Port: 5432
  Database: intime_dev
  User: intime_user
  Password: ********

⏳ Conectando...
✅ Conexão estabelecida com sucesso!

📊 PostgreSQL version: PostgreSQL 16.x ...

📚 Bancos disponíveis:
  - postgres
  - intime_dev

✅ Teste concluído com sucesso!
```

---

## 5. Iniciar Serviços

```bash
# Auth Service
cd server/services/auth-service
npm run dev
```

**Logs esperados:**
```
[auth-service] Database connected successfully
[auth-service] Database synced
✓ AUTH-SERVICE running on port 3001
```

---

## Troubleshooting

### Erro: Connection Timeout
```
Error: connect ETIMEDOUT
```
**Soluções:**
- Verificar IP da VM no `server/.env` (DB_HOST)
- Verificar firewall permite porta 5432
- Testar conectividade: `ping <IP_VM>`
- Verificar se PostgreSQL está rodando: `docker ps | grep postgres`

### Erro: Authentication Failed
```
Error: password authentication failed for user
```
**Soluções:**
- Verificar DB_USER e DB_PASSWORD no `server/.env`
- Verificar pg_hba.conf permite conexão remota
- Reiniciar PostgreSQL após mudanças: `docker restart worklocation-db`

### Erro: Database does not exist
```
Error: database "intime_dev" does not exist
```
**Soluções:**
- Criar banco: `docker exec -it worklocation-db psql -U postgres -c "CREATE DATABASE intime_dev;"`
- Verificar DB_NAME no `server/.env`

### Erro: Too many connections
```
Error: FATAL: sorry, too many clients already
```
**Soluções:**
- Reduzir DB_POOL_MAX no `server/.env`
- Verificar outros serviços conectados
- Aumentar max_connections no PostgreSQL

---

## Estrutura Centralizada

```
server/
├── .env                         # ⭐ ARQUIVO ÚNICO COM TODAS AS VARIÁVEIS
├── .env.example                 # Template para copiar
├── scripts/
│   └── test-db-connection.js   # Usa server/.env
├── shared/
│   └── config/
│       └── database.js         # Factory compartilhada
└── services/
    ├── auth-service/
    │   ├── .env.example        # Documentação apenas
    │   └── src/config/
    │       └── database.js     # ⬆️ Carrega de ../../../../.env
    ├── user-service/
    │   └── src/config/
    │       └── database.js     # ⬆️ Carrega de ../../../../.env
    ├── ... (todos os 10 serviços)
    └── audit-service/
        └── src/config/
            └── database.js     # ⬆️ Carrega de ../../../../.env
```

**Vantagens:**
- ✅ Um único arquivo para configurar tudo
- ✅ Sem duplicação de variáveis
- ✅ Fácil manutenção
- ✅ Menos propenso a erros

---

## Variáveis Disponíveis

O `server/.env` contém todas as configurações:

| Seção | Variáveis | Obrigatório Agora? |
|-------|-----------|-------------------|
| **PostgreSQL** | DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD | ✅ Sim |
| **Redis** | REDIS_HOST, REDIS_PORT, REDIS_PASSWORD | ⏳ Futuro |
| **JWT** | JWT_SECRET, JWT_ACCESS_EXPIRATION, JWT_REFRESH_EXPIRATION | ✅ Sim |
| **Portas** | API_GATEWAY_PORT, AUTH_SERVICE_PORT, etc. | ✅ Sim |
| **Rate Limiting** | RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS | ⏳ Futuro |
| **Email** | SMTP_HOST, SMTP_USER, etc. | ⏳ Futuro |
| **Storage** | AWS_ACCESS_KEY_ID, S3_BUCKET, etc. | ⏳ Futuro |

---

## Próximos Passos

1. ✅ **Preencher `server/.env`** com credenciais da VM
2. ✅ **Criar banco** `intime_dev` no PostgreSQL da VM
3. ✅ **Testar conexão** com `node server/scripts/test-db-connection.js`
4. ✅ **Iniciar auth-service** para validar
5. ⏳ **Implementar models** para cada serviço (futuro)
6. ⏳ **Configurar migrations** (futuro)
