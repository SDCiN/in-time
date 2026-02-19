import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PROJECT_SERVICE_PORT || 3003

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'project-service',
    timestamp: new Date().toISOString()
  })
})

// Placeholder – implementação pendente
app.use('/api/v1', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'project-service ainda não implementado',
    error: { code: 'NOT_IMPLEMENTED' }
  })
})

app.listen(PORT, () => {
  console.log(`Project Service rodando na porta ${PORT}`)
})

export default app
