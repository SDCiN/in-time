import { AuthService } from '../services/auth.service.js'
import logger from '../config/logger.js'

const authService = new AuthService()

export class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body

      // Validação básica
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        })
      }

      const result = await authService.login(email, password)

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result
      })
    } catch (error) {
      logger.error('Login error:', error)
      next(error)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body

      await authService.logout(refreshToken)

      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      })
    } catch (error) {
      logger.error('Logout error:', error)
      next(error)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token é obrigatório'
        })
      }

      const result = await authService.refreshToken(refreshToken)

      res.json({
        success: true,
        message: 'Token atualizado com sucesso',
        data: result
      })
    } catch (error) {
      logger.error('Refresh token error:', error)
      next(error)
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        })
      }

      await authService.forgotPassword(email)

      res.json({
        success: true,
        message: 'Email de recuperação enviado'
      })
    } catch (error) {
      logger.error('Forgot password error:', error)
      next(error)
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token e nova senha são obrigatórios'
        })
      }

      await authService.resetPassword(token, newPassword)

      res.json({
        success: true,
        message: 'Senha redefinida com sucesso'
      })
    } catch (error) {
      logger.error('Reset password error:', error)
      next(error)
    }
  }
}
