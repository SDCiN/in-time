// AuthService - Business Logic Layer
// TODO: Implementar lógica de autenticação completa

export class AuthService {
  async login(email, password) {
    // TODO:
    // 1. Validar credenciais no banco
    // 2. Verificar tentativas de login
    // 3. Gerar JWT access token (1h)
    // 4. Gerar JWT refresh token (7d)
    // 5. Salvar refresh token no banco
    // 6. Retornar tokens + user data

    throw new Error('Login não implementado ainda')
  }

  async logout(refreshToken) {
    // TODO:
    // 1. Validar refresh token
    // 2. Adicionar à blacklist no Redis
    // 3. Remover do banco

    throw new Error('Logout não implementado ainda')
  }

  async refreshToken(refreshToken) {
    // TODO:
    // 1. Validar refresh token
    // 2. Verificar se não está na blacklist
    // 3. Gerar novos access + refresh tokens
    // 4. Invalidar refresh token antigo
    // 5. Salvar novo refresh token

    throw new Error('Refresh token não implementado ainda')
  }

  async forgotPassword(email) {
    // TODO:
    // 1. Buscar usuário por email
    // 2. Gerar token de reset (UUID)
    // 3. Salvar token no banco (expira em 1h)
    // 4. Enviar email com link de reset

    throw new Error('Forgot password não implementado ainda')
  }

  async resetPassword(token, newPassword) {
    // TODO:
    // 1. Validar token de reset
    // 2. Verificar se não expirou
    // 3. Hash da nova senha (bcryptjs)
    // 4. Atualizar senha no banco
    // 5. Invalidar token de reset

    throw new Error('Reset password não implementado ainda')
  }
}
