import rateLimit from 'express-rate-limit'

export const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minuto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requisições por minuto
  message: {
    success: false,
    message: 'Muitas requisições deste IP, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const loginRateLimit = rateLimit({
  windowMs: 60000, // 1 minuto
  max: 5, // 5 tentativas de login por minuto
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 1 minuto.'
  },
  skipSuccessfulRequests: true,
})
