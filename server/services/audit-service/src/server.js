import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { sequelize } from './config/database.js'

dotenv.config({ path: '../../.env' })

const app = express()
const PORT = process.env.AUDIT_SERVICE_PORT || 3010

app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected'
  try {
    await sequelize.authenticate()
    dbStatus = 'connected'
  } catch {
    dbStatus = 'disconnected'
  }

  res.json({
    status: 'ok',
    service: 'audit-service',
    database: dbStatus,
    timestamp: new Date().toISOString()
  })
})

// Placeholder – implementação pendente
// Quando implementado: logs imutáveis append-only em PostgreSQL com JSONB
app.use('/api/v1', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'audit-service ainda não implementado',
    error: { code: 'NOT_IMPLEMENTED' }
  })
})

// Database connection e start server
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('Audit Service conectado ao PostgreSQL')

    // Sync models (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false })
      console.log('Database synced')
    }

    app.listen(PORT, () => {
      console.log(`Audit Service rodando na porta ${PORT}`)
    })
  } catch (error) {
    console.error('Erro ao conectar PostgreSQL:', error.message)
    process.exit(1)
  }
}

startServer()

export default app
