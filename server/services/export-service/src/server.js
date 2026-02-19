import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.EXPORT_SERVICE_PORT || 3009

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'export-service',
    timestamp: new Date().toISOString()
  })
})

// Placeholder – implementação pendente
// Quando implementado: geração assíncrona de relatórios via Bull Queue
// Formatos: Excel, CSV, PDF, JSON — upload para S3
app.use('/api/v1', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'export-service ainda não implementado',
    error: { code: 'NOT_IMPLEMENTED' }
  })
})

app.listen(PORT, () => {
  console.log(`Export Service rodando na porta ${PORT}`)
})

export default app
