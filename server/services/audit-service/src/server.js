import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.AUDIT_SERVICE_PORT || 3010
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/intime_audit'

app.use(helmet())
app.use(cors())
app.use(express.json())

// Conexão MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Audit Service conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar MongoDB:', err.message))

app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  res.json({
    status: 'ok',
    service: 'audit-service',
    mongodb: mongoStatus,
    timestamp: new Date().toISOString()
  })
})

// Placeholder – implementação pendente
// Quando implementado: logs imutáveis append-only em MongoDB time-series
app.use('/api/v1', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'audit-service ainda não implementado',
    error: { code: 'NOT_IMPLEMENTED' }
  })
})

app.listen(PORT, () => {
  console.log(`Audit Service rodando na porta ${PORT}`)
})

export default app
