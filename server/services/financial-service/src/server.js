import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.FINANCIAL_SERVICE_PORT || 3007

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'financial-service',
    timestamp: new Date().toISOString()
  })
})

// Placeholder – implementação pendente
// Quando implementado: cálculos EVM (PV, EV, AC, CPI, SPI), burn-rate,
// previsões via cron a cada 15min com cache Redis TTL 15min
app.use('/api/v1', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'financial-service ainda não implementado',
    error: { code: 'NOT_IMPLEMENTED' }
  })
})

app.listen(PORT, () => {
  console.log(`Financial Service rodando na porta ${PORT}`)
})

export default app
