import logger from '../config/logger.js'

export const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Erros operacionais conhecidos
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  // Erros de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.errors.map(e => e.message),
    })
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
    })
  }

  // Erro genérico (bug)
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
  })
}
