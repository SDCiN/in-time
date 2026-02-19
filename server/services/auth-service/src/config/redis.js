import { createClient } from 'redis'
import dotenv from 'dotenv'
import logger from './logger.js'

dotenv.config()

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
})

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  logger.info('Redis connected successfully')
})

// Conectar ao Redis
await redisClient.connect()

export default redisClient
