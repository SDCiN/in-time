import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3008

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notification-service',
    timestamp: new Date().toISOString()
  })
})

// WebSocket – Placeholder
io.on('connection', (socket) => {
  console.log(`Cliente WebSocket conectado: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`Cliente WebSocket desconectado: ${socket.id}`)
  })
})

// REST Placeholder – implementação pendente
app.use('/api/v1', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'notification-service ainda não implementado',
    error: { code: 'NOT_IMPLEMENTED' }
  })
})

httpServer.listen(PORT, () => {
  console.log(`Notification Service rodando na porta ${PORT}`)
})

export default app
