import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { rateLimitMiddleware } from './middlewares/rateLimit.js'
import { setupRoutes } from './routes/index.js'
import logger from './config/logger.js'

const app = express()
dotenv.config({ path: '../.env' })

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares globais
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting global
app.use(rateLimitMiddleware)

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  })
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'API Gateway', timestamp: new Date().toISOString() })
})

// Setup proxy routes para microserviços
setupRoutes(app)

// Error handler
app.use((err, req, res, next) => {
  logger.error('API Gateway Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  })

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV}`)
})
