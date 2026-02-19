# Conectando ao PostgreSQL via PgAdmin

Este guia passo a passo explica como configurar uma conexão com um banco de dados PostgreSQL usando a interface do PgAdmin.

## 1. Pré-requisitos

*   **PostgreSQL** rodando (localmente via Docker ou em um servidor/VM).
*   **PgAdmin** instalado e rodando.
*   Credenciais de acesso ao banco (Host, Porta, Usuário, Senha e Nome do Banco).

## 2. Passo a Passo no PgAdmin

1.  Abra o **PgAdmin**.
2.  No menu lateral esquerdo, clique com o botão direito em **Servers**.
3.  Vá em **Register** > **Server...**.

### Aba "General" (Geral)
*   **Name**: Dê um nome para identificar esta conexão (ex: `Meu App - Produção`, `InTime - Dev`).

### Aba "Connection" (Conexão)
Preencha os campos conforme a tabela abaixo, relacionando com suas variáveis de ambiente ou dados de acesso:

| Campo no PgAdmin          | O que preencher (Exemplo .env) | Descrição                                      |
| :------------------------ | :----------------------------- | :--------------------------------------------- |
| **Host name/address**     | `DB_HOST`                      | IP da máquina/VM ou `localhost`                |
| **Port**                  | `DB_PORT`                      | Porta do banco (padrão: `5432`)                |
| **Maintenance database**  | `DB_NAME`                      | Nome do banco de dados (ex: `intime`)          |
| **Username**              | `DB_USER`                      | Usuário banco de dados                         |
| **Password**              | `DB_PASSWORD`                  | Senha do usuário                               |

4.  Clique em **Save**.

## 3. Resolução de Problemas Comuns

### ❌ Erro: "password authentication failed"
*   **Causa**: A senha ou o nome de usuário estão incorretos.
*   **Solução**:
    *   Verifique se o `Username` está exato (se for um email, inclua o `@dominio.com`).
    *   Redigite a senha com cuidado.

### ❌ Erro: "connection refused" ou "timeout"
*   **Causa**: O PgAdmin não consegue alcançar o servidor do banco.
*   **Solução**:
    *   Verifique se o IP (`Host name/address`) está correto.
    *   Se for uma VM ou servidor remoto, verifique se a porta `5432` está liberada no firewall.
    *   Confirme se o serviço do PostgreSQL está rodando (`docker ps` se estiver usando Docker).

### ❌ Erro: "database does not exist"
*   **Causa**: O nome do banco ou o banco de manutenção está errado.
*   **Solução**: Verifique o campo **Maintenance database**. Se não tiver certeza, tente usar `postgres` (banco padrão) para testar a conexão primeiro.
