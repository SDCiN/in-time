import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import logger from './config/logger.js'
import { sequelize } from './config/database.js'
import authRoutes from './routes/auth.routes.js'
import { errorHandler } from './middlewares/error.middleware.js'

dotenv.config({ path: '../../.env' })

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
  res.json({
    status: 'OK',
    service: 'AUTH-SERVICE',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.use('/api/v1/auth', authRoutes)

// Error handler
app.use(errorHandler)

// Database connection e start server
const startServer = async () => {
  try {
    await sequelize.authenticate()
    logger.info('Database connected successfully')

    // Sync models (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false })
      logger.info('Database synced')
    }

    app.listen(PORT, () => {
      logger.info(`AUTH-SERVICE running on port ${PORT}`)
      logger.info(`Environment: ${process.env.NODE_ENV}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
